package com.movehubmvp

import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.*

class HealthConnectWorkManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "HealthConnectWorkManager"
    }

    @ReactMethod
    fun isBatteryOptimizationIgnored(promise: Promise) {
        try {
            val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isIgnored = pm.isIgnoringBatteryOptimizations(reactContext.packageName)
            promise.resolve(isIgnored)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openBatteryOptimizationSettings(promise: Promise) {
        try {
            val intent = Intent().apply {
                action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                data = Uri.parse("package:${reactContext.packageName}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            // Fallback to general battery optimization settings page
            try {
                val fallbackIntent = Intent().apply {
                    action = Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(fallbackIntent)
                promise.resolve(true)
            } catch (ex: Exception) {
                // Fallback to app info page
                try {
                    val appDetailsIntent = Intent().apply {
                        action = Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                        data = Uri.parse("package:${reactContext.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    reactContext.startActivity(appDetailsIntent)
                    promise.resolve(true)
                } catch (e2: Exception) {
                    promise.resolve(false)
                }
            }
        }
    }

    @ReactMethod
    fun isExactAlarmAllowed(promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val isAllowed = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager.canScheduleExactAlarms()
            } else {
                true
            }
            promise.resolve(isAllowed)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openExactAlarmSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val intent = Intent().apply {
                    action = Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM
                    data = Uri.parse("package:${reactContext.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun startHealthSync(options: ReadableMap, promise: Promise) {
        try {
            val baseUrl = options.getString("baseUrl")
            val deviceId = if (options.hasKey("deviceId") && !options.isNull("deviceId")) options.getString("deviceId") else ""
            val uhid = if (options.hasKey("uhid") && !options.isNull("uhid")) options.getString("uhid") else ""

            val prefs = reactContext.getSharedPreferences("HealthConnectSyncPrefs", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString("baseUrl", baseUrl)
                putString("deviceId", deviceId)
                putString("uhid", uhid)
                apply()
            }

            // Schedule periodic sync (15-mins)
            HealthConnectWorkManagerScheduler.schedulePeriodicSync(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getHealthSyncStatus(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("HealthConnectSyncPrefs", Context.MODE_PRIVATE)
            val map = Arguments.createMap().apply {
                putString("baseUrl", prefs.getString("baseUrl", null))
                putString("deviceId", prefs.getString("deviceId", null))
                putString("uhid", prefs.getString("uhid", null))
                putString("lastAttemptAt", prefs.getString("lastAttemptAt", null))
                putString("lastSyncedAt", prefs.getString("lastSyncedAt", null))
                putString("lastStatus", prefs.getString("lastStatus", null))
                putString("lastReason", prefs.getString("lastReason", null))
                
                putBoolean("exactAlarmAllowed", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    (reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager).canScheduleExactAlarms()
                } else {
                    true
                })
                
                putBoolean("batteryOptimizationIgnored", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    (reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager).isIgnoringBatteryOptimizations(reactContext.packageName)
                } else {
                    true
                })
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getSyncedIntervals(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("HealthConnectSyncPrefs", Context.MODE_PRIVATE)
            val set = prefs.getStringSet("synced_intervals", emptySet()) ?: emptySet()
            val arr = Arguments.createArray()
            for (item in set) {
                arr.pushString(item)
            }
            promise.resolve(arr)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun saveSyncedIntervals(intervals: ReadableArray, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("HealthConnectSyncPrefs", Context.MODE_PRIVATE)
            val set = mutableSetOf<String>()
            for (i in 0 until intervals.size()) {
                val item = intervals.getString(i)
                if (item != null) {
                    set.add(item)
                }
            }
            prefs.edit().putStringSet("synced_intervals", set).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getSyncedKeys(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("HealthConnectSyncPrefs", Context.MODE_PRIVATE)
            val set = prefs.getStringSet("synced_keys", emptySet()) ?: emptySet()
            val arr = Arguments.createArray()
            for (item in set) {
                arr.pushString(item)
            }
            promise.resolve(arr)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun saveSyncedKeys(keys: ReadableArray, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("HealthConnectSyncPrefs", Context.MODE_PRIVATE)
            val set = mutableSetOf<String>()
            for (i in 0 until keys.size()) {
                val item = keys.getString(i)
                if (item != null) {
                    set.add(item)
                }
            }
            prefs.edit().putStringSet("synced_keys", set).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
