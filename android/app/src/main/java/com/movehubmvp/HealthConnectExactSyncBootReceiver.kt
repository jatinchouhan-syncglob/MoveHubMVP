package com.movehubmvp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class HealthConnectExactSyncBootReceiver : BroadcastReceiver() {
    private val TAG = "HCExactSyncBootReceiver"

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d(TAG, "System event received: $action. Rescheduling periodic sync WorkManager request...")
        HealthConnectWorkManagerScheduler.schedulePeriodicSync(context)
        HealthConnectWorkManagerScheduler.triggerImmediateSync(context)
    }
}
