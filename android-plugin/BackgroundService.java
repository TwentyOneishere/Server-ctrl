package com.serverctrl.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.core.app.NotificationCompat;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Properties;

public class BackgroundService extends Service {

    private static final String CHANNEL_ID_SERVICE  = "serverctrl_service";
    private static final String CHANNEL_ID_ALERTS   = "serverctrl_alerts";
    private static final int    NOTIF_ID_SERVICE    = 1;
    private static final int    NOTIF_ID_ALERT_BASE = 100;
    private static final long   CHECK_INTERVAL_MS   = 60_000L; // 1 minute

    private Handler  handler;
    private Runnable checkRunnable;
    private int      alertCounter = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIF_ID_SERVICE, buildServiceNotification());
        scheduleChecks();
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (handler != null && checkRunnable != null)
            handler.removeCallbacks(checkRunnable);
    }

    // ─── Notification Channels ───────────────────────────────────
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);

            NotificationChannel svc = new NotificationChannel(
                CHANNEL_ID_SERVICE, "ServerCtrl Monitor",
                NotificationManager.IMPORTANCE_LOW);
            svc.setDescription("Background monitoring service");
            nm.createNotificationChannel(svc);

            NotificationChannel alerts = new NotificationChannel(
                CHANNEL_ID_ALERTS, "ServerCtrl Alerts",
                NotificationManager.IMPORTANCE_HIGH);
            alerts.setDescription("Critical server alerts");
            nm.createNotificationChannel(alerts);
        }
    }

    private Notification buildServiceNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        return new NotificationCompat.Builder(this, CHANNEL_ID_SERVICE)
            .setContentTitle("ServerCtrl")
            .setContentText("Monitoring active")
            .setSmallIcon(android.R.drawable.ic_menu_manage)
            .setContentIntent(pi)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void sendAlert(String title, String text) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Notification n = new NotificationCompat.Builder(this, CHANNEL_ID_ALERTS)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build();

        nm.notify(NOTIF_ID_ALERT_BASE + (alertCounter++), n);
    }

    // ─── Metric Checks ───────────────────────────────────────────
    private void scheduleChecks() {
        checkRunnable = new Runnable() {
            @Override
            public void run() {
                performCheck();
                handler.postDelayed(this, CHECK_INTERVAL_MS);
            }
        };
        handler.postDelayed(checkRunnable, CHECK_INTERVAL_MS);
    }

    private void performCheck() {
        SharedPreferences prefs = getSharedPreferences("srvctrl_prefs", Context.MODE_PRIVATE);
        boolean alertsEnabled = prefs.getBoolean("alerts_enabled", false);
        if (!alertsEnabled) return;

        String ip   = prefs.getString("active_ip",   "");
        String user = prefs.getString("active_user", "");
        String pass = prefs.getString("active_pass", "");
        int    port = prefs.getInt("active_port", 22);
        String name = prefs.getString("active_name", "Server");

        if (ip.isEmpty() || user.isEmpty()) return;

        new Thread(() -> {
            try {
                String result = sshCommand(ip, port, user, pass,
                    "echo CPU:$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d. -f1);" +
                    "echo DISK:$(df / | awk 'NR==2{printf \"%.0f\",$5}' | tr -d '%');" +
                    "echo TEMP:$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf \"%.0f\",$1/1000}' || echo 0)");

                int cpu  = parseVal(result, "CPU");
                int disk = parseVal(result, "DISK");
                int temp = parseVal(result, "TEMP");

                boolean cpuAlerts  = prefs.getBoolean("alert_cpu",  false);
                boolean diskAlerts = prefs.getBoolean("alert_disk", false);
                boolean tempAlerts = prefs.getBoolean("alert_temp", false);

                if (cpuAlerts  && cpu  > 90) sendAlert("⚠ CPU Alert - " + name, "CPU usage: " + cpu + "%");
                if (diskAlerts && disk > 95) sendAlert("⚠ Disk Alert - " + name, "Disk usage: " + disk + "%");
                if (tempAlerts && temp > 80) sendAlert("🌡 Temp Alert - " + name, "Temperature: " + temp + "°C");

            } catch (Exception e) {
                // Server offline — don't spam notifications
            }
        }).start();
    }

    private int parseVal(String raw, String key) {
        for (String line : raw.split("\n")) {
            if (line.startsWith(key + ":")) {
                try { return Integer.parseInt(line.split(":")[1].trim()); } catch (Exception e) {}
            }
        }
        return 0;
    }

    private String sshCommand(String host, int port, String user, String pass, String cmd) throws Exception {
        JSch jsch = new JSch();
        Session session = jsch.getSession(user, host, port);
        session.setPassword(pass);
        Properties cfg = new Properties();
        cfg.put("StrictHostKeyChecking", "no");
        session.setConfig(cfg);
        session.setTimeout(8000);
        session.connect();

        ChannelExec exec = (ChannelExec) session.openChannel("exec");
        exec.setCommand(cmd);
        InputStream in = exec.getInputStream();
        exec.connect();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int len;
        while (true) {
            while (in.available() > 0) { len = in.read(buf); if (len > 0) out.write(buf, 0, len); }
            if (exec.isClosed()) break;
            Thread.sleep(50);
        }
        exec.disconnect();
        session.disconnect();
        return out.toString("UTF-8");
    }

    // ─── Static helpers ──────────────────────────────────────────
    public static void start(Context ctx) {
        Intent i = new Intent(ctx, BackgroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            ctx.startForegroundService(i);
        else
            ctx.startService(i);
    }

    public static void stop(Context ctx) {
        ctx.stopService(new Intent(ctx, BackgroundService.class));
    }
}
