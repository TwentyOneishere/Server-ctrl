#!/bin/bash
# ServerCtrl Monitor Script
# Installs as a systemd service that collects metrics every minute
# Data stored in /var/log/serverctrl/metrics.jsonl (last 7 days)

INSTALL_DIR="/usr/local/bin"
LOG_DIR="/var/log/serverctrl"
SERVICE_NAME="serverctrl-monitor"
SCRIPT_PATH="$INSTALL_DIR/serverctrl-monitor.sh"
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME.service"
TIMER_PATH="/etc/systemd/system/$SERVICE_NAME.timer"

case "$1" in
  install)
    echo "Installing ServerCtrl Monitor..."
    mkdir -p "$LOG_DIR"

    cat > "$SCRIPT_PATH" << 'MONITOR_SCRIPT'
#!/bin/bash
LOG_FILE="/var/log/serverctrl/metrics.jsonl"
MAX_LINES=10080  # 7 days * 24h * 60min

get_cpu() {
  top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d. -f1 2>/dev/null || echo 0
}
get_ram_used() { free -m | awk '/Mem/{print $3}' 2>/dev/null || echo 0; }
get_ram_total() { free -m | awk '/Mem/{print $2}' 2>/dev/null || echo 1; }
get_disk() { df / | awk 'NR==2{printf "%.0f", $5}' | tr -d '%' 2>/dev/null || echo 0; }
get_temp() { cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{printf "%.0f",$1/1000}' || echo 0; }
get_net() {
  IFACE=$(ip route | awk '/default/{print $5}' | head -1)
  cat /proc/net/dev 2>/dev/null | grep "$IFACE" | awk '{print $2,$10}' || echo "0 0"
}

NET=$(get_net)
RX=$(echo $NET | awk '{print $1}')
TX=$(echo $NET | awk '{print $2}')

JSON="{\"ts\":$(date +%s),\"cpu\":$(get_cpu),\"ram_used\":$(get_ram_used),\"ram_total\":$(get_ram_total),\"disk\":$(get_disk),\"temp\":$(get_temp),\"rx\":$RX,\"tx\":$TX}"

echo "$JSON" >> "$LOG_FILE"

# Keep only last 10080 lines (7 days)
if [ $(wc -l < "$LOG_FILE") -gt $MAX_LINES ]; then
  tail -n $MAX_LINES "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi
MONITOR_SCRIPT

    chmod +x "$SCRIPT_PATH"

    cat > "$SERVICE_PATH" << EOF
[Unit]
Description=ServerCtrl Metrics Collector
After=network.target

[Service]
Type=oneshot
ExecStart=$SCRIPT_PATH
User=root
EOF

    cat > "$TIMER_PATH" << EOF
[Unit]
Description=ServerCtrl Metrics Timer

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
AccuracySec=10s

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME.timer"
    systemctl start "$SERVICE_NAME.timer"
    echo "✓ ServerCtrl Monitor installed and running!"
    echo "  Metrics saved to: $LOG_DIR/metrics.jsonl"
    ;;

  uninstall)
    systemctl stop "$SERVICE_NAME.timer" 2>/dev/null
    systemctl disable "$SERVICE_NAME.timer" 2>/dev/null
    rm -f "$SCRIPT_PATH" "$SERVICE_PATH" "$TIMER_PATH"
    systemctl daemon-reload
    echo "✓ ServerCtrl Monitor uninstalled"
    ;;

  status)
    systemctl status "$SERVICE_NAME.timer"
    echo "Log size: $(wc -l < $LOG_DIR/metrics.jsonl 2>/dev/null || echo 0) entries"
    ;;

  read)
    # Output last N entries as JSON array
    N=${2:-1440}  # default 24h
    if [ -f "$LOG_DIR/metrics.jsonl" ]; then
      echo "["
      tail -n $N "$LOG_DIR/metrics.jsonl" | awk 'NR>1{print ","} {print}' 
      echo "]"
    else
      echo "[]"
    fi
    ;;

  *)
    echo "Usage: $0 {install|uninstall|status|read [lines]}"
    exit 1
    ;;
esac
