package com.movehubmvp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.ServiceInfo
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.changes.Change
import androidx.health.connect.client.changes.DeletionChange
import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ChangesTokenRequest
import androidx.health.connect.client.response.ChangesResponse
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
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
    private val KEY_CHANGES_TOKEN = "health_connect_changes_token"

    override suspend fun doWork(): Result {
        Log.d(TAG, "Background Health Connect Changes API sync worker started")

        try {
            setForeground(createForegroundInfo())
            Log.d(TAG, "Foreground service elevation active for health sync")
        } catch (e: Exception) {
            Log.w(TAG, "Could not elevate to foreground service: ${e.message}")
        }

        val attempt = inputData.getInt("attempt", 0)
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val baseUrl = prefs.getString("baseUrl", null)
        val deviceId = prefs.getString("deviceId", null)
        val uhid = prefs.getString("uhid", null)

        if (baseUrl.isNullOrBlank()) {
            Log.w(TAG, "Sync aborted: base API URL not configured")
            return Result.success()
        }

        updateAttemptStatus(prefs, "Attempting Changes API sync (attempt #$attempt)")

        // 1. Check Google Health Connect Availability
        val sdkStatus = HealthConnectClient.getSdkStatus(context)
        if (sdkStatus != HealthConnectClient.SDK_AVAILABLE) {
            val reason = "Health Connect client is not available on this device"
            Log.w(TAG, reason)
            saveSyncFailure(prefs, reason)
            return Result.success()
        }

        val client = HealthConnectClient.getOrCreate(context)

        // 2. Target Record Types & Permissions
        val recordTypes = setOf(
            StepsRecord::class,
            DistanceRecord::class,
            TotalCaloriesBurnedRecord::class,
            ActiveCaloriesBurnedRecord::class,
            HeartRateRecord::class,
            SleepSessionRecord::class,
            ExerciseSessionRecord::class,
            SpeedRecord::class,
            BasalMetabolicRateRecord::class
        )

        val requiredPermissions = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(DistanceRecord::class),
            HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
            HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            HealthPermission.getReadPermission(SpeedRecord::class),
            HealthPermission.getReadPermission(BasalMetabolicRateRecord::class)
        )

        val grantedPermissions = client.permissionController.getGrantedPermissions()
        if (!grantedPermissions.containsAll(requiredPermissions)) {
            val reason = "Health Connect permissions are missing"
            Log.w(TAG, reason)
            saveSyncFailure(prefs, reason)
            return Result.success()
        }

        val systemZone = ZoneId.systemDefault()
        val now = Instant.now()

        val httpClient = OkHttpClient.Builder()
            .connectTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
            .build()

        // 3. Obtain or validate ChangesToken
        var savedToken = prefs.getString(KEY_CHANGES_TOKEN, null)

        if (savedToken.isNullOrBlank()) {
            Log.d(TAG, "================ [HEALTH CONNECT CHANGES SYNC] ================")
            Log.d(TAG, "[ChangesToken] No existing token found. Requesting initial ChangesToken from Health Connect...")
            try {
                savedToken = client.getChangesToken(ChangesTokenRequest(recordTypes = recordTypes))
                prefs.edit().putString(KEY_CHANGES_TOKEN, savedToken).apply()
                Log.d(TAG, "[ChangesToken] Initial ChangesToken registered: $savedToken")
            } catch (e: Exception) {
                val reason = "Failed to acquire initial ChangesToken: ${e.message}"
                Log.e(TAG, "[ChangesToken] $reason", e)
                saveSyncFailure(prefs, reason)
                return Result.failure()
            }
        } else {
            Log.d(TAG, "================ [HEALTH CONNECT CHANGES SYNC] ================")
            Log.d(TAG, "[ChangesToken] Using Previous/Current Token: $savedToken")
        }

        // 4. Fetch Changes via Token Cursor
        val allUpsertedRecords = mutableListOf<Record>()
        val allDeletedRecordIds = mutableListOf<String>()
        var currentToken = savedToken
        var nextToken: String? = null
        var hasMore = true
        var tokenExpired = false

        try {
            while (hasMore) {
                val changesResponse: ChangesResponse = client.getChanges(currentToken!!)

                if (changesResponse.changesTokenExpired) {
                    Log.w(TAG, "[ChangesToken] Token expired! Requesting a fresh ChangesToken from Health Connect...")
                    tokenExpired = true
                    val freshToken = client.getChangesToken(ChangesTokenRequest(recordTypes = recordTypes))
                    prefs.edit().putString(KEY_CHANGES_TOKEN, freshToken).apply()
                    Log.d(TAG, "[ChangesToken] Fresh ChangesToken registered: $freshToken")
                    break
                }

                for (change in changesResponse.changes) {
                    when (change) {
                        is UpsertionChange -> allUpsertedRecords.add(change.record)
                        is DeletionChange -> allDeletedRecordIds.add(change.recordId)
                    }
                }

                nextToken = changesResponse.nextChangesToken
                hasMore = changesResponse.hasMore
                currentToken = nextToken
            }
        } catch (e: Exception) {
            val reason = "Error reading Health Connect changes: ${e.message}"
            Log.e(TAG, "[Changes API] $reason", e)
            saveSyncFailure(prefs, reason)
            return Result.failure()
        }

        Log.d(TAG, "[ChangesToken] Next Token Received from Health Connect: $nextToken")
        Log.d(TAG, "[Changes API] Total Upserted Records: ${allUpsertedRecords.size} | Deleted Records: ${allDeletedRecordIds.size}")

        if (tokenExpired) {
            val syncTime = DateTimeFormatter.ISO_INSTANT.format(now)
            prefs.edit().apply {
                putString("lastSyncedAt", syncTime)
                putString("lastAttemptAt", syncTime)
                putString("lastStatus", "Success")
                putString("lastReason", "Refreshed expired ChangesToken for next cycle")
                apply()
            }
            Log.d(TAG, "===============================================================")
            return Result.success()
        }

        // 5. Smart Skip on No Changes
        if (allUpsertedRecords.isEmpty() && allDeletedRecordIds.isEmpty()) {
            Log.d(TAG, "[Ingestion] 0 new records detected. SKIPPING AWS API Gateway call (hasNewData = false).")
            if (!nextToken.isNullOrBlank()) {
                prefs.edit().putString(KEY_CHANGES_TOKEN, nextToken).apply()
                Log.d(TAG, "[ChangesToken] Saved Next Token for upcoming 16-min cycle: $nextToken")
            }
            val syncTime = DateTimeFormatter.ISO_INSTANT.format(now)
            prefs.edit().apply {
                putString("lastSyncedAt", syncTime)
                putString("lastAttemptAt", syncTime)
                putString("lastStatus", "Success")
                putString("lastReason", "All health metrics are up to date (no new changes)")
                apply()
            }
            Log.d(TAG, "===============================================================")
            return Result.success()
        }

        Log.d(TAG, "[Ingestion] New health changes found (${allUpsertedRecords.size} records). Preparing AWS API Gateway upload...")

        // 6. Group Upserted Records by Session (Morning, Afternoon, Evening, Night)
        val recordsBySession = mutableMapOf<Pair<String, String>, MutableList<Record>>()

        for (record in allUpsertedRecords) {
            val recordStartTime = getRecordStartTime(record)
            val sessionKey = getSessionForInstant(recordStartTime, systemZone)
            recordsBySession.getOrPut(sessionKey) { mutableListOf() }.add(record)
        }

        var overallSuccess = true
        var networkError = false

        // 7. Construct & Post Payload for Each Affected Session Block
        for ((sessionKey, recordsList) in recordsBySession) {
            val dateStr = sessionKey.first
            val sessionName = sessionKey.second
            val intervalKey = "$dateStr:$sessionName"

            val stepsRecords = recordsList.filterIsInstance<StepsRecord>()
            val distanceRecords = recordsList.filterIsInstance<DistanceRecord>()
            val activeCalRecords = recordsList.filterIsInstance<ActiveCaloriesBurnedRecord>()
            val totalCalRecords = recordsList.filterIsInstance<TotalCaloriesBurnedRecord>()
            val heartRateRecords = recordsList.filterIsInstance<HeartRateRecord>()
            val sleepRecords = recordsList.filterIsInstance<SleepSessionRecord>()
            val exerciseRecords = recordsList.filterIsInstance<ExerciseSessionRecord>()
            val speedRecords = recordsList.filterIsInstance<SpeedRecord>()

            // Aggregates
            val totalSteps = stepsRecords.sumOf { it.count }
            val totalDistanceKm = distanceRecords.sumOf { it.distance.inKilometers }
            val totalActiveCalories = activeCalRecords.sumOf { it.energy.inKilocalories }
            val totalCalories = totalCalRecords.sumOf { it.energy.inKilocalories }

            val totalSleepHours = sleepRecords.sumOf {
                java.time.Duration.between(it.startTime, it.endTime).toMinutes().toDouble() / 60.0
            }

            var totalHeartRateBpm = 0
            var heartRateSamplesCount = 0
            for (hrRecord in heartRateRecords) {
                for (sample in hrRecord.samples) {
                    totalHeartRateBpm += sample.beatsPerMinute.toInt()
                    heartRateSamplesCount++
                }
            }
            val avgHeartRate = if (heartRateSamplesCount > 0) totalHeartRateBpm.toDouble() / heartRateSamplesCount else 0.0

            // Steps Array
            val stepsObjectArray = JSONArray()
            for (record in stepsRecords.sortedBy { it.startTime }) {
                stepsObjectArray.put(JSONObject().apply {
                    put("count", record.count.toInt())
                    put("distanceKm", JSONObject.NULL)
                    put("energyKcal", JSONObject.NULL)
                    put("speed", JSONObject.NULL)
                    put("startTime", record.startTime.toString())
                    put("endTime", record.endTime.toString())
                })
            }

            // Distance Array
            val distanceObjectArray = JSONArray()
            for (record in distanceRecords.sortedBy { it.startTime }) {
                distanceObjectArray.put(JSONObject().apply {
                    put("count", JSONObject.NULL)
                    put("distanceKm", record.distance.inKilometers)
                    put("energyKcal", JSONObject.NULL)
                    put("speed", JSONObject.NULL)
                    put("startTime", record.startTime.toString())
                    put("endTime", record.endTime.toString())
                })
            }

            // Calories Array
            val caloriesObjectArray = JSONArray()
            if (activeCalRecords.isNotEmpty()) {
                for (record in activeCalRecords.sortedBy { it.startTime }) {
                    caloriesObjectArray.put(JSONObject().apply {
                        put("type", "ACTIVE")
                        put("count", JSONObject.NULL)
                        put("distanceKm", JSONObject.NULL)
                        put("energyKcal", record.energy.inKilocalories)
                        put("speed", JSONObject.NULL)
                        put("startTime", record.startTime.toString())
                        put("endTime", record.endTime.toString())
                    })
                }
            } else {
                for (record in totalCalRecords.sortedBy { it.startTime }) {
                    caloriesObjectArray.put(JSONObject().apply {
                        put("type", "ACTIVE")
                        put("count", JSONObject.NULL)
                        put("distanceKm", JSONObject.NULL)
                        put("energyKcal", record.energy.inKilocalories)
                        put("speed", JSONObject.NULL)
                        put("startTime", record.startTime.toString())
                        put("endTime", record.endTime.toString())
                    })
                }
            }

            // Speed Array
            val speedObjectArray = JSONArray()
            for (record in speedRecords.sortedBy { it.startTime }) {
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
                    for (sample in record.samples.sortedBy { it.time }) {
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

            // Exercise Array
            val todayExerciseRecordsArray = JSONArray()
            for (record in exerciseRecords.sortedBy { it.startTime }) {
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

            val activeKcal = if (totalActiveCalories > 0.0) totalActiveCalories else totalCalories

            val clientPayloadObj = JSONObject().apply {
                put("user_id", uhid ?: "TEST001")
                put("event_type", "TELEMETRY_SYNC")
                put("uhid", uhid ?: "")
                put("deviceId", deviceId ?: "")
                put("date", dateStr)
                put("steps", totalSteps)
                put("heartPoint", 0)
                put("activeCaloriesInKcal", activeKcal)
                put("averageHeartRate", avgHeartRate)
                put("heartRateMeasurements", heartRateSamplesCount)
                put("sleepHours", totalSleepHours)
                put("distanceInKm", totalDistanceKm)
                put("createdOn", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(systemZone).format(now))
                put("lastSyncTime", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(systemZone).format(now))
                put("todayExerciseRecords", todayExerciseRecordsArray)
                put("stepsObject", stepsObjectArray)
                put("distanceObject", distanceObjectArray)
                put("caloriesObject", caloriesObjectArray)
                put("speedObject", speedObjectArray)
            }

            val clientPayloadArray = JSONArray().put(clientPayloadObj)
            val payloadJsonString = clientPayloadArray.toString()
            Log.d(TAG, "[Telemetry Payload] Uploading to AWS ($intervalKey) -> Steps: $totalSteps, Distance: $totalDistanceKm km, ActiveKcal: $activeKcal, Sleep: $totalSleepHours hrs")
            Log.d(TAG, "[Telemetry Payload JSON]: $payloadJsonString")

            val targetUrl = "https://97c0imknqe.execute-api.ap-south-1.amazonaws.com/v1/telemetry"
            val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
            val requestBody = payloadJsonString.toRequestBody(mediaType)

            val request = Request.Builder()
                .url(targetUrl)
                .post(requestBody)
                .build()

            try {
                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        throw java.io.IOException("HTTP error code: ${response.code}")
                    }
                    Log.d(TAG, "Successfully synced Changes API payload for interval: $intervalKey (HTTP Status: ${response.code})")
                }
            } catch (e: java.io.IOException) {
                Log.e(TAG, "Network error syncing changes for interval: $intervalKey", e)
                overallSuccess = false
                networkError = true
            } catch (e: Exception) {
                Log.e(TAG, "Exception syncing changes for interval: $intervalKey", e)
                overallSuccess = false
            }
        }

        // 8. Commit Token & Status
        if (overallSuccess) {
            if (!nextToken.isNullOrBlank()) {
                prefs.edit().putString(KEY_CHANGES_TOKEN, nextToken).apply()
            }
            val syncTime = DateTimeFormatter.ISO_INSTANT.format(now)
            prefs.edit().apply {
                putString("lastSyncedAt", syncTime)
                putString("lastAttemptAt", syncTime)
                putString("lastStatus", "Success")
                putString("lastReason", "Successfully processed and uploaded Health Connect changes (${allUpsertedRecords.size} records)")
                apply()
            }
            Log.d(TAG, "Changes API sync worker completed successfully")
            return Result.success()
        } else {
            val errorReason = if (networkError) "Network connection failed during API post" else "Errors occurred during sync execution"
            saveSyncFailure(prefs, errorReason)
            Log.w(TAG, "Sync Worker completed with failures: $errorReason")
            return Result.failure()
        }
    }

    private fun getRecordStartTime(record: Record): Instant {
        return when (record) {
            is StepsRecord -> record.startTime
            is DistanceRecord -> record.startTime
            is ActiveCaloriesBurnedRecord -> record.startTime
            is TotalCaloriesBurnedRecord -> record.startTime
            is BasalMetabolicRateRecord -> record.time
            is HeartRateRecord -> record.startTime
            is SleepSessionRecord -> record.startTime
            is ExerciseSessionRecord -> record.startTime
            is SpeedRecord -> record.startTime
            else -> Instant.now()
        }
    }

    private fun getSessionForInstant(instant: Instant, zoneId: ZoneId): Pair<String, String> {
        val zonedDateTime = instant.atZone(zoneId)
        val hour = zonedDateTime.hour
        val dateStr = zonedDateTime.toLocalDate().toString()

        val session = when (hour) {
            in 6..11 -> "morning"
            in 12..16 -> "afternoon"
            in 17..20 -> "evening"
            else -> "night"
        }

        val adjustedDateStr = if (hour in 0..5) {
            zonedDateTime.toLocalDate().minusDays(1).toString()
        } else {
            dateStr
        }

        return Pair(adjustedDateStr, session)
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

    private fun createForegroundInfo(): ForegroundInfo {
        val channelId = "health_sync_channel"
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Health Data Synchronization",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Synchronizing steps and activity data with MoveHub"
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setContentTitle("MoveHub Health Sync")
            .setContentText("Syncing your health activity in background...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val serviceType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC or ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
            } else {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            }
            ForegroundInfo(1001, notification, serviceType)
        } else {
            ForegroundInfo(1001, notification)
        }
    }
}
