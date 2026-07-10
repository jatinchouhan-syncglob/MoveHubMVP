package com.movehubmvp

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.util.Log
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class HealthConnectSyncWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val TAG = "HealthConnectSyncWorker"
    private val PREFS_NAME = "HealthConnectSyncPrefs"
    
    private val VIGOROUS_TYPES = setOf(8, 12, 17, 20, 22, 25, 27, 28, 29, 34, 36, 39, 40, 42, 43, 44, 45, 47, 52, 53, 54, 55, 57, 58, 59, 60, 62, 76)
    private val MODERATE_TYPES = setOf(1, 2, 9, 10, 11, 14, 15, 16, 18, 19, 21, 23, 24, 30, 31, 32, 35, 37, 38, 41, 48, 49, 50, 51, 56, 61, 63, 64, 65, 66, 67, 68, 70, 72, 73, 74, 75, 77, 78, 100, 101)

    override suspend fun doWork(): Result {
        Log.d(TAG, "Background sync worker started execution")
        
        val attempt = inputData.getInt("attempt", 0)
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val baseUrl = prefs.getString("baseUrl", null)
        val deviceId = prefs.getString("deviceId", null)
        val uhid = prefs.getString("uhid", null)

        if (baseUrl.isNullOrBlank()) {
            Log.w(TAG, "Sync aborted: base API URL not configured")
            return Result.success()
        }

        updateAttemptStatus(prefs, "Attempting sync (attempt #$attempt)")

        // 1. Check Google Health Connect Availability
        val sdkStatus = HealthConnectClient.getSdkStatus(context)
        if (sdkStatus != HealthConnectClient.SDK_AVAILABLE) {
            val reason = "Health Connect client is not available on this device"
            Log.w(TAG, reason)
            saveSyncFailure(prefs, reason)
            return Result.success()
        }

        val client = HealthConnectClient.getOrCreate(context)

        // 2. Check Permissions
        val requiredPermissions = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(DistanceRecord::class),
            HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
            HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            HealthPermission.getReadPermission(SpeedRecord::class)
        )

        val grantedPermissions = client.permissionController.getGrantedPermissions()
        if (!grantedPermissions.containsAll(requiredPermissions)) {
            val reason = "Health Connect permissions are missing"
            Log.w(TAG, reason)
            saveSyncFailure(prefs, reason)
            return Result.success()
        }

        // 3. Collect list of intervals to sync (last 7 days)
        val systemZone = ZoneId.systemDefault()
        val today = LocalDate.now(systemZone)
        val sessionsToSync = mutableListOf<Pair<String, String>>()

        for (i in 6 downTo 0) {
            val dateStr = today.minusDays(i.toLong()).toString()
            sessionsToSync.add(Pair(dateStr, "morning"))
            sessionsToSync.add(Pair(dateStr, "afternoon"))
            sessionsToSync.add(Pair(dateStr, "evening"))
            sessionsToSync.add(Pair(dateStr, "night"))
        }

        val syncedIntervalsSet = prefs.getStringSet("synced_intervals", emptySet())?.toMutableSet() ?: mutableSetOf()
        val now = Instant.now()
        var overallSuccess = true
        var networkError = false
        var syncedSomething = false

        val httpClient = OkHttpClient.Builder()
            .connectTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
            .build()

        for (sessionPair in sessionsToSync) {
            val dateStr = sessionPair.first
            val sessionName = sessionPair.second
            val intervalKey = "$dateStr:$sessionName"

            val (startInstant, endInstant) = getSessionTimeRange(dateStr, sessionName, systemZone)

            // Skip future sessions
            if (startInstant.isAfter(now)) {
                continue
            }

            val isPastSession = endInstant.isBefore(now)
            val isCurrentSession = startInstant.isBefore(now) && endInstant.isAfter(now)

            // Skip already synced completed past sessions
            if (isPastSession && syncedIntervalsSet.contains(intervalKey)) {
                continue
            }

            Log.d(TAG, "Syncing session interval: $intervalKey (Range: $startInstant to $endInstant)")
            syncedSomething = true

            try {
                // Query Health Connect records
                val steps = client.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val distance = client.readRecords(ReadRecordsRequest(DistanceRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val activeCal = client.readRecords(ReadRecordsRequest(ActiveCaloriesBurnedRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val totalCal = client.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val heartRate = client.readRecords(ReadRecordsRequest(HeartRateRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val sleep = client.readRecords(ReadRecordsRequest(SleepSessionRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val exercises = client.readRecords(ReadRecordsRequest(ExerciseSessionRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records
                val speed = client.readRecords(ReadRecordsRequest(SpeedRecord::class, TimeRangeFilter.between(startInstant, endInstant))).records

                // Aggregate summary values
                val totalSteps = steps.sumOf { it.count }
                val totalDistanceKm = distance.sumOf { it.distance.inKilometers }
                val totalActiveCalories = activeCal.sumOf { it.energy.inKilocalories }
                val totalCalories = totalCal.sumOf { it.energy.inKilocalories }
                
                val totalSleepHours = sleep.sumOf {
                    java.time.Duration.between(it.startTime, it.endTime).toMinutes().toDouble() / 60.0
                }

                var totalHeartRateBpm = 0
                var heartRateSamplesCount = 0
                for (record in heartRate) {
                    for (sample in record.samples) {
                        totalHeartRateBpm += sample.beatsPerMinute.toInt()
                        heartRateSamplesCount++
                    }
                }
                val avgHeartRate = if (heartRateSamplesCount > 0) totalHeartRateBpm.toDouble() / heartRateSamplesCount else 0.0

                // Heart Points
                var exerciseHeartPoints = 0.0
                for (ex in exercises) {
                    val durationMin = java.time.Duration.between(ex.startTime, ex.endTime).toMinutes().toDouble()
                    if (durationMin > 0) {
                        if (VIGOROUS_TYPES.contains(ex.exerciseType)) {
                            exerciseHeartPoints += durationMin * 2
                        } else {
                            exerciseHeartPoints += durationMin
                        }
                    }
                }

                var stepsHeartPoints = 0.0
                for (step in steps) {
                    if (!isStepOverlappingExercise(step.startTime, step.endTime, exercises)) {
                        val durationMin = java.time.Duration.between(step.startTime, step.endTime).toMillis() / 60000.0
                        if (durationMin > 0) {
                            val stepsPerMin = step.count / durationMin
                            if (stepsPerMin >= 130) {
                                stepsHeartPoints += durationMin * 2
                            } else if (stepsPerMin >= 100) {
                                stepsHeartPoints += durationMin
                            }
                        }
                    }
                }
                val finalHeartPoints = Math.round(exerciseHeartPoints + stepsHeartPoints).toInt()

                // Map Detailed Objects
                val stepsObjectArray = JSONArray()
                for (record in steps) {
                    stepsObjectArray.put(JSONObject().apply {
                        put("count", record.count.toInt())
                        put("distanceKm", JSONObject.NULL)
                        put("energyKcal", JSONObject.NULL)
                        put("speed", JSONObject.NULL)
                        put("startTime", record.startTime.toString())
                        put("endTime", record.endTime.toString())
                    })
                }

                val distanceObjectArray = JSONArray()
                for (record in distance) {
                    distanceObjectArray.put(JSONObject().apply {
                        put("count", JSONObject.NULL)
                        put("distanceKm", record.distance.inKilometers)
                        put("energyKcal", JSONObject.NULL)
                        put("speed", JSONObject.NULL)
                        put("startTime", record.startTime.toString())
                        put("endTime", record.endTime.toString())
                    })
                }

                val caloriesObjectArray = JSONArray()
                for (record in totalCal) {
                    caloriesObjectArray.put(JSONObject().apply {
                        put("count", JSONObject.NULL)
                        put("distanceKm", JSONObject.NULL)
                        put("energyKcal", record.energy.inKilocalories)
                        put("speed", JSONObject.NULL)
                        put("startTime", record.startTime.toString())
                        put("endTime", record.endTime.toString())
                    })
                }

                val speedObjectArray = JSONArray()
                for (record in speed) {
                    if (record.samples.isEmpty()) {
                        speedObjectArray.put(JSONObject().apply {
                            put("count", JSONObject.NULL)
                            put("distanceKm", JSONObject.NULL)
                            put("energyKcal", JSONObject.NULL)
                            put("speed", JSONObject.NULL)
                            put("startTime", record.startTime.toString())
                            put("endTime", record.endTime.toString())
                        })
                    } else {
                        for (sample in record.samples) {
                            speedObjectArray.put(JSONObject().apply {
                                put("count", JSONObject.NULL)
                                put("distanceKm", JSONObject.NULL)
                                put("energyKcal", JSONObject.NULL)
                                put("speed", sample.speed.inKilometersPerHour)
                                put("startTime", sample.time.toString())
                                put("endTime", sample.time.toString())
                            })
                        }
                    }
                }

                val todayExerciseRecordsArray = JSONArray()
                for (record in exercises) {
                    val durationHours = java.time.Duration.between(record.startTime, record.endTime).toMinutes().toDouble() / 60.0
                    todayExerciseRecordsArray.put(JSONObject().apply {
                        put("durationHours", durationHours)
                        put("startTime", record.startTime.toString())
                        put("endTime", record.endTime.toString())
                        put("source", record.metadata.dataOrigin.packageName)
                        put("title", record.title ?: "")
                        put("type", record.exerciseType)
                    })
                }

                // Construct Single Payload per session block
                val payloadObj = JSONObject().apply {
                    put("uhid", uhid ?: "")
                    put("deviceId", deviceId ?: "")
                    put("session", sessionName)
                    put("date", dateStr)
                    put("steps", totalSteps.toInt())
                    put("heartPoint", finalHeartPoints)
                    put("activeCaloriesInKcal", if (totalActiveCalories > 0) totalActiveCalories else totalCalories)
                    put("averageHeartRate", avgHeartRate)
                    put("heartRateMeasurements", heartRateSamplesCount)
                    put("sleepHours", totalSleepHours)
                    put("distanceInKm", totalDistanceKm)
                    put("createdOn", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(systemZone).format(now))
                    put("lastSyncTime", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(systemZone).format(now))
                    put("todayExerciseRecords", todayExerciseRecordsArray)
                    put("stepsObject", stepsObjectArray)
                    put("distanceObject", distanceObjectArray)
                    put("caloriesObject", caloriesObjectArray)
                    put("speedObject", speedObjectArray)
                }

                val payloadArray = JSONArray().put(payloadObj)

                // Execute Network POST
                val cleanBaseUrl = baseUrl.trim().removeSuffix("/")
                val targetUrl = "$cleanBaseUrl/health-connect/saveDetailedUserHealthAnalytics"
                val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
                val requestBody = RequestBody.create(mediaType, payloadArray.toString())
                
                val request = Request.Builder()
                    .url(targetUrl)
                    .post(requestBody)
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        throw java.io.IOException("HTTP error code: ${response.code}")
                    }
                    Log.d(TAG, "Successfully synced session interval: $intervalKey")
                    
                    // Mark as synced only if the session is fully completed in the past
                    if (isPastSession) {
                        syncedIntervalsSet.add(intervalKey)
                    }
                }

            } catch (e: java.io.IOException) {
                Log.e(TAG, "Network connection error syncing interval: $intervalKey", e)
                overallSuccess = false
                networkError = true
            } catch (e: Exception) {
                Log.e(TAG, "General exception syncing interval: $intervalKey", e)
                overallSuccess = false
            }
        }

        // Save synced intervals set
        prefs.edit().putStringSet("synced_intervals", syncedIntervalsSet).apply()

        // 4. Update Status and Schedule Retries if Network Fails
        if (overallSuccess) {
            val syncTime = DateTimeFormatter.ISO_INSTANT.format(now)
            prefs.edit().apply {
                putString("lastSyncedAt", syncTime)
                putString("lastAttemptAt", syncTime)
                putString("lastStatus", "Success")
                putString("lastReason", if (syncedSomething) "Successfully synced missing health intervals" else "All intervals are up-to-date")
                apply()
            }
            HealthConnectExactSyncScheduler.cancelRetrySync(context)
            Log.d(TAG, "Sync Worker completed successfully")
            return Result.success()
        } else {
            val attemptTime = DateTimeFormatter.ISO_INSTANT.format(now)
            val errorReason = if (networkError) "Network connection failed during API post" else "Errors occurred during sync execution"
            
            saveSyncFailure(prefs, errorReason)
            
            if (networkError && attempt < 3) {
                val nextAttempt = attempt + 1
                HealthConnectExactSyncScheduler.scheduleRetrySync(context, nextAttempt)
            }
            
            Log.w(TAG, "Sync Worker completed with failures: $errorReason")
            return Result.failure()
        }
    }

    private fun getSessionTimeRange(dateStr: String, session: String, zoneId: ZoneId): Pair<Instant, Instant> {
        val localDate = LocalDate.parse(dateStr)
        val (startLDT, endLDT) = when (session) {
            "morning" -> Pair(
                localDate.atTime(6, 0, 0),
                localDate.atTime(11, 59, 59, 999000000)
            )
            "afternoon" -> Pair(
                localDate.atTime(12, 0, 0),
                localDate.atTime(16, 59, 59, 999000000)
            )
            "evening" -> Pair(
                localDate.atTime(17, 0, 0),
                localDate.atTime(20, 59, 59, 999000000)
            )
            "night" -> Pair(
                localDate.atTime(21, 0, 0),
                localDate.plusDays(1).atTime(5, 59, 59, 999000000)
            )
            else -> throw IllegalArgumentException("Unknown session: $session")
        }
        return Pair(startLDT.atZone(zoneId).toInstant(), endLDT.atZone(zoneId).toInstant())
    }

    private fun isStepOverlappingExercise(
        stepStart: Instant,
        stepEnd: Instant,
        exercises: List<ExerciseSessionRecord>
    ): Boolean {
        for (ex in exercises) {
            if (stepStart.isBefore(ex.endTime) && stepEnd.isAfter(ex.startTime)) {
                return true
            }
        }
        return false
    }

    private fun updateAttemptStatus(prefs: SharedPreferences, message: String) {
        val timeNow = DateTimeFormatter.ISO_INSTANT.format(Instant.now())
        prefs.edit().apply {
            putString("lastAttemptAt", timeNow)
            putString("lastStatus", "In Progress")
            putString("lastReason", message)
            apply()
        }
    }

    private fun saveSyncFailure(prefs: SharedPreferences, reason: String) {
        val timeNow = DateTimeFormatter.ISO_INSTANT.format(Instant.now())
        prefs.edit().apply {
            putString("lastAttemptAt", timeNow)
            putString("lastStatus", "Failure")
            putString("lastReason", reason)
            apply()
        }
    }
}
