package com.serverctrl.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Properties;

@CapacitorPlugin(name = "CapacitorSsh")
public class SSHPlugin extends Plugin {

    @PluginMethod
    public void execute(PluginCall call) {
        String host     = call.getString("host", "");
        int    port     = call.getInt("port", 22);
        String username = call.getString("username", "");
        String password = call.getString("password", "");
        String command  = call.getString("command", "");

        if (host.isEmpty() || username.isEmpty()) {
            call.reject("Host si username sunt obligatorii");
            return;
        }

        new Thread(() -> {
            Session session = null;
            try {
                JSch jsch = new JSch();
                session = jsch.getSession(username, host, port);
                session.setPassword(password);

                Properties cfg = new Properties();
                cfg.put("StrictHostKeyChecking", "no");
                session.setConfig(cfg);
                session.setTimeout(10000);
                session.connect();

                ChannelExec exec = (ChannelExec) session.openChannel("exec");
                exec.setCommand(command);

                InputStream stdout = exec.getInputStream();
                InputStream stderr = exec.getErrStream();
                exec.connect();

                ByteArrayOutputStream outBuf = new ByteArrayOutputStream();
                ByteArrayOutputStream errBuf = new ByteArrayOutputStream();
                byte[] buf = new byte[4096];
                int len;

                while (true) {
                    while (stdout.available() > 0) {
                        len = stdout.read(buf);
                        if (len > 0) outBuf.write(buf, 0, len);
                    }
                    while (stderr.available() > 0) {
                        len = stderr.read(buf);
                        if (len > 0) errBuf.write(buf, 0, len);
                    }
                    if (exec.isClosed()) break;
                    Thread.sleep(50);
                }

                exec.disconnect();

                JSObject result = new JSObject();
                result.put("output", outBuf.toString("UTF-8"));
                result.put("stderr", errBuf.toString("UTF-8"));
                result.put("exitCode", exec.getExitStatus());
                call.resolve(result);

            } catch (Exception e) {
                call.reject("SSH Error: " + e.getMessage());
            } finally {
                if (session != null && session.isConnected()) {
                    session.disconnect();
                }
            }
        }).start();
    }

    @PluginMethod
    public void sendWOL(PluginCall call) {
        String mac = call.getString("mac", "");
        if (mac.isEmpty()) {
            call.reject("MAC address necesar");
            return;
        }

        new Thread(() -> {
            try {
                String[] hex = mac.split("[:\\-]");
                if (hex.length != 6) {
                    call.reject("Format MAC invalid. Foloseste AA:BB:CC:DD:EE:FF");
                    return;
                }

                byte[] macBytes = new byte[6];
                for (int i = 0; i < 6; i++) {
                    macBytes[i] = (byte) Integer.parseInt(hex[i], 16);
                }

                // Magic packet: 6x 0xFF urmat de MAC de 16 ori
                byte[] packet = new byte[6 + 16 * 6];
                for (int i = 0; i < 6; i++) packet[i] = (byte) 0xFF;
                for (int i = 1; i <= 16; i++) {
                    System.arraycopy(macBytes, 0, packet, i * 6, 6);
                }

                DatagramSocket socket = new DatagramSocket();
                socket.setBroadcast(true);

                // Trimite pe broadcast
                DatagramPacket dp = new DatagramPacket(
                    packet, packet.length,
                    InetAddress.getByName("255.255.255.255"), 9
                );
                socket.send(dp);
                socket.close();

                JSObject result = new JSObject();
                result.put("success", true);
                call.resolve(result);

            } catch (Exception e) {
                call.reject("WOL Error: " + e.getMessage());
            }
        }).start();
    }
}
