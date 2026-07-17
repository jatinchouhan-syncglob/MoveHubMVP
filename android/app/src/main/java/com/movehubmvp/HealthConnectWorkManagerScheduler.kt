package com.movehubmvp

import android.content.Context
import android.util.Log
import androidx.work.*
import java.util.concurrent.TimeUnit

object HealthConnectWorkManagerScheduler {
    private const val TAG = "HCWorkManagerScheduler"
    const val UNIQUE_PERIODIC_WORK_NAME = "HealthConnectPeriodicSyncWork"

    fun schedulePeriodicSync(context: Context) {
        try {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            // 30 minutes periodic work interval for background sync
            val periodicWorkRequest = PeriodicWorkRequestBuilder<HealthConnectSyncWorker>(30, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context.applicationContext).enqueueUniquePeriodicWork(
                UNIQUE_PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                periodicWorkRequest
            )
            Log.d(TAG, "Enqueued 30-minute PeriodicWorkRequest for Health Connect sync successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error scheduling periodic sync WorkManager request", e)
        }
    }

    fun triggerImmediateSync(context: Context) {
        try {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val oneTimeWorkRequest = OneTimeWorkRequestBuilder<HealthConnectSyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context.applicationContext).enqueue(oneTimeWorkRequest)
            Log.d(TAG, "Triggered immediate OneTimeWorkRequest for Health Connect sync")
        } catch (e: Exception) {
            Log.e(TAG, "Error triggering immediate sync WorkManager request", e)
        }
    }
}
