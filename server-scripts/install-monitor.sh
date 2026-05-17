#!/bin/bash
# ServerCtrl Monitor - Install Script
# Compatible: Ubuntu, Debian, Arch, CentOS, Rocky, Alpine

set -e

echo "================================"
echo "  ServerCtrl Monitor Installer"
echo "================================"

# Detectare distro
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    DISTRO="unknown"
fi

echo "[*] Distro detectata: $DISTRO"

# Verificare Python3
if ! command -v python3 &>/dev/null; then
    echo "[*] Instalez Python3..."
    case $DISTRO in
        ubuntu|debian|raspbian) apt-get install -y python3 ;;
        arch|manjaro)           pacman -Sy --noconfirm python ;;
        centos|rhel|rocky|fedora) dnf install -y python3 ;;
        alpine)                 apk add --no-cache python3 ;;
        *)                      echo "[!] Instaleaza python3 manual"; exit 1 ;;
    esac
fi

echo "[✓] Python3: $(python3 --version)"

# Copiere script
cp srvctrl-monitor.py /usr/local/bin/srvctrl-monitor.py
chmod +x /usr/local/bin/srvctrl-monitor.py

# Creare director date
mkdir -p /var/lib/srvctrl
chmod 755 /var/lib/srvctrl

# Instalare serviciu systemd (daca e disponibil)
if command -v systemctl &>/dev/null; then
    cp srvctrl-monitor.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable srvctrl-monitor
    systemctl restart srvctrl-monitor
    echo "[✓] Serviciu systemd instalat si pornit"
    echo "[*] Status: $(systemctl is-active srvctrl-monitor)"
else
    # Fallback pentru sisteme fara systemd (Alpine/Docker)
    echo "[*] systemd indisponibil, pornire manuala..."
    nohup python3 /usr/local/bin/srvctrl-monitor.py > /var/log/srvctrl-monitor.log 2>&1 &
    echo "[✓] Monitor pornit in background (PID: $!)"
fi

echo ""
echo "================================"
echo "  [✓] Instalare completa!"
echo "  Date salvate in: /var/lib/srvctrl/history.json"
echo "================================"
