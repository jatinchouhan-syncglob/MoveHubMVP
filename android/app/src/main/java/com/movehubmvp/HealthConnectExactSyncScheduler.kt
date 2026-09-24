package com.movehubmvp

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

object HealthConnectExactSyncScheduler {
    private const val TAG = "HCExactSyncScheduler"
    const val ACTION_HOURLY_SYNC = "com.movehubmvp.ACTION_HOURLY_SYNC"
    const val ACTION_RETRY_SYNC = "com.movehubmvp.ACTION_RETRY_SYNC"
    const val RC_HOURLY = 1000
    const val RC_RETRY = 2000

    fun scheduleNextHourlySync(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.w(TAG, "Cannot schedule exact alarm: Permission not granted")
            return
        }

        val intent = Intent(context, HealthConnectExactSyncReceiver::class.java).apply {
            action = ACTION_HOURLY_SYNC
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            RC_HOURLY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Schedule 1 hour from now
        val triggerTime = System.currentTimeMillis() + 60 * 60 * 1000
        
        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
            )
            Log.d(TAG, "Scheduled next hourly sync in 60 minutes")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException scheduling exact alarm", e)
        }
    }

    fun scheduleRetrySync(context: Context, attemptNumber: Int) {
        if (attemptNumber > 3) {
            Log.w(TAG, "Max retry attempts (3) reached. Skipping retry scheduling.")
            return
        }

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.w(TAG, "Cannot schedule exact retry alarm: Permission not granted")
            return
        }

        val intent = Intent(context, HealthConnectExactSyncReceiver::class.java).apply {
            action = ACTION_RETRY_SYNC
            putExtra("attempt", attemptNumber)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            RC_RETRY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Retry after 2 minutes
        val triggerTime = System.currentTimeMillis() + 2 * 60 * 1000
        
        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
            )
            Log.d(TAG, "Scheduled retry sync #$attemptNumber in 2 minutes")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException scheduling exact retry alarm", e)
        }
    }

    fun cancelRetrySync(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, HealthConnectExactSyncReceiver::class.java).apply {
            action = ACTION_RETRY_SYNC
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            RC_RETRY,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            Log.d(TAG, "Cancelled pending retry alarms")
        }
    }
}
