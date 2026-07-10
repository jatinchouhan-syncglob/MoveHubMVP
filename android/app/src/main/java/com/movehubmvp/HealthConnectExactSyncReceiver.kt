package com.movehubmvp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.*

class HealthConnectExactSyncReceiver : BroadcastReceiver() {
    private val TAG = "HCExactSyncReceiver"

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d(TAG, "Alarm fired: $action")

        val attempt = intent.getIntExtra("attempt", 0)

        // If it was the regular hourly sync, reschedule the next hourly check immediately
        if (action == HealthConnectExactSyncScheduler.ACTION_HOURLY_SYNC) {
            HealthConnectExactSyncScheduler.scheduleNextHourlySync(context)
        }

        // Trigger the WorkManager background sync worker
        val inputData = Data.Builder()
            .putInt("attempt", attempt)
            .build()

        val syncWorkRequest = OneTimeWorkRequestBuilder<HealthConnectSyncWorker>()
            .setInputData(inputData)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()

        WorkManager.getInstance(context.applicationContext).enqueueUniqueWork(
            "HealthConnectSyncWork",
            ExistingWorkPolicy.REPLACE,
            syncWorkRequest
        )
    }
}
