#!/usr/bin/env python3
"""
ServerCtrl Monitor Daemon
Salveaza metrici la fiecare minut in /var/lib/srvctrl/history.json
Compatibil: Ubuntu, Debian, Arch, CentOS, Rocky, Alpine
"""

import json
import os
import time
import subprocess
import sys
import signal
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR  = Path("/var/lib/srvctrl")
HIST_FILE = DATA_DIR / "history.json"
MAX_DAYS  = 7
MAX_PTS   = 60 * 24 * MAX_DAYS  # 1 punct/minut * 7 zile

def run(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, timeout=5).decode().strip()
    except:
        return "0"

def get_cpu():
    try:
        with open("/proc/stat") as f:
            line = f.readline()
        vals = list(map(int, line.split()[1:]))
        idle = vals[3]
        total = sum(vals)
        return total, idle
    except:
        return 0, 0

def get_metrics():
    # CPU (2 sample)
    t1, i1 = get_cpu()
    time.sleep(0.5)
    t2, i2 = get_cpu()
    dt = t2 - t1
    di = i2 - i1
    cpu = round((1 - di/dt) * 100, 1) if dt > 0 else 0

    # RAM
    ram_total = ram_used = ram_free = 0
    try:
        with open("/proc/meminfo") as f:
            mem = {}
            for line in f:
                k, v = line.split(":")
                mem[k.strip()] = int(v.split()[0])
        ram_total = mem.get("MemTotal", 0) // 1024
        ram_free  = (mem.get("MemFree", 0) + mem.get("Buffers", 0) + mem.get("Cached", 0)) // 1024
        ram_used  = ram_total - ram_free
    except:
        pass

    # DISK
    disk_pct = disk_used = disk_total = 0
    try:
        r = run("df / | awk 'NR==2{print $3,$4,$5}'").split()
        if len(r) >= 3:
            disk_used  = int(r[0]) // 1024 // 1024
            disk_avail = int(r[1]) // 1024 // 1024
            disk_total = disk_used + disk_avail
            disk_pct   = round(disk_used / disk_total * 100, 1) if disk_total else 0
    except:
        pass

    # TEMP
    temp = 0
    for path in ["/sys/class/thermal/thermal_zone0/temp",
                 "/sys/class/hwmon/hwmon0/temp1_input"]:
        try:
            temp = int(open(path).read().strip()) // 1000
            break
        except:
            pass

    # NET
    net_rx = net_tx = 0
    try:
        with open("/proc/net/dev") as f:
            for line in f:
                for iface in ["eth0","enp","ens","eno","wlan"]:
                    if iface in line:
                        parts = line.split()
                        net_rx += int(parts[1])
                        net_tx += int(parts[9])
                        break
    except:
        pass

    return {
        "ts":         int(time.time()),
        "cpu":        cpu,
        "ram_pct":    round(ram_used / ram_total * 100, 1) if ram_total else 0,
        "ram_used":   ram_used,
        "ram_total":  ram_total,
        "disk_pct":   disk_pct,
        "disk_used":  disk_used,
        "disk_total": disk_total,
        "temp":       temp,
        "net_rx":     net_rx,
        "net_tx":     net_tx,
    }

def load_history():
    try:
        if HIST_FILE.exists():
            return json.loads(HIST_FILE.read_text())
    except:
        pass
    return []

def save_history(history):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    # Pastreaza doar ultimele MAX_DAYS zile
    cutoff = int(time.time()) - MAX_DAYS * 86400
    history = [p for p in history if p.get("ts", 0) > cutoff]
    # Limita puncte
    if len(history) > MAX_PTS:
        history = history[-MAX_PTS:]
    HIST_FILE.write_text(json.dumps(history, separators=(',', ':')))

def main():
    print(f"[ServerCtrl Monitor] Start - date in {HIST_FILE}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    prev_rx = prev_tx = 0
    history = load_history()

    def handle_signal(sig, frame):
        print("\n[ServerCtrl Monitor] Stop.")
        save_history(history)
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT,  handle_signal)

    while True:
        try:
            metrics = get_metrics()

            # Net speed (bytes/sec fata de punctul anterior)
            if prev_rx and prev_tx:
                metrics["net_rx_speed"] = max(0, metrics["net_rx"] - prev_rx)
                metrics["net_tx_speed"] = max(0, metrics["net_tx"] - prev_tx)
            else:
                metrics["net_rx_speed"] = 0
                metrics["net_tx_speed"] = 0

            prev_rx = metrics["net_rx"]
            prev_tx = metrics["net_tx"]

            history.append(metrics)

            # Salveaza la fiecare 5 minute sau daca >100 puncte noi
            if len(history) % 5 == 0:
                save_history(history)

        except Exception as e:
            print(f"[ServerCtrl Monitor] Eroare: {e}")

        time.sleep(60)

if __name__ == "__main__":
    main()
