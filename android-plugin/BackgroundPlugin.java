package com.serverctrl.app;

import android.content.SharedPreferences;
import android.content.Context;
import android.os.Build;

import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "BackgroundPlugin")
public class BackgroundPlugin extends Plugin {

    // ─── Background Service ───────────────────────────────────────
    @PluginMethod
    public void startMonitoring(PluginCall call) {
        // Save active server prefs for background service
        String ip   = call.getString("ip",   "");
        String user = call.getString("user", "");
        String pass = call.getString("pass", "");
        int    port = call.getInt("port", 22);
        String name = call.getString("name", "Server");
        boolean alertsEnabled = Boolean.TRUE.equals(call.getBoolean("alertsEnabled", false));
        boolean alertCpu      = Boolean.TRUE.equals(call.getBoolean("alertCpu",  false));
        boolean alertDisk     = Boolean.TRUE.equals(call.getBoolean("alertDisk", false));
        boolean alertTemp     = Boolean.TRUE.equals(call.getBoolean("alertTemp", false));

        SharedPreferences prefs = getContext().getSharedPreferences("srvctrl_prefs", Context.MODE_PRIVATE);
        prefs.edit()
            .putString("active_ip",   ip)
            .putString("active_user", user)
            .putString("active_pass", pass)
            .putInt("active_port",    port)
            .putString("active_name", name)
            .putBoolean("alerts_enabled", alertsEnabled)
            .putBoolean("alert_cpu",  alertCpu)
            .putBoolean("alert_disk", alertDisk)
            .putBoolean("alert_temp", alertTemp)
            .apply();

        if (alertsEnabled) {
            BackgroundService.start(getContext());
        } else {
            BackgroundService.stop(getContext());
        }

        JSObject r = new JSObject();
        r.put("success", true);
        call.resolve(r);
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        BackgroundService.stop(getContext());
        JSObject r = new JSObject();
        r.put("success", true);
        call.resolve(r);
    }

    // ─── Biometric Auth ──────────────────────────────────────────
    @PluginMethod
    public void authenticateWithBiometric(PluginCall call) {
        String title    = call.getString("title",    "ServerCtrl");
        String subtitle = call.getString("subtitle", "Authenticate to continue");

        BiometricManager bm = BiometricManager.from(getContext());
        int canAuth = bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG |
                                         BiometricManager.Authenticators.DEVICE_CREDENTIAL);

        if (canAuth != BiometricManager.BIOMETRIC_SUCCESS) {
            JSObject r = new JSObject();
            r.put("success", false);
            r.put("error", "Biometric not available");
            call.resolve(r);
            return;
        }

        Executor executor = ContextCompat.getMainExecutor(getContext());
        BiometricPrompt prompt = new BiometricPrompt(
            (FragmentActivity) getActivity(), executor,
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                    JSObject r = new JSObject();
                    r.put("success", true);
                    call.resolve(r);
                }
                @Override
                public void onAuthenticationError(int code, CharSequence msg) {
                    JSObject r = new JSObject();
                    r.put("success", false);
                    r.put("error", msg.toString());
                    call.resolve(r);
                }
                @Override
                public void onAuthenticationFailed() {
                    JSObject r = new JSObject();
                    r.put("success", false);
                    r.put("error", "Authentication failed");
                    call.resolve(r);
                }
            }
        );

        BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG |
                                       BiometricManager.Authenticators.DEVICE_CREDENTIAL)
            .build();

        getActivity().runOnUiThread(() -> prompt.authenticate(info));
    }

    @PluginMethod
    public void isBiometricAvailable(PluginCall call) {
        BiometricManager bm = BiometricManager.from(getContext());
        int result = bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG |
                                         BiometricManager.Authenticators.DEVICE_CREDENTIAL);
        JSObject r = new JSObject();
        r.put("available", result == BiometricManager.BIOMETRIC_SUCCESS);
        call.resolve(r);
    }
}
