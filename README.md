# ServerCtrl

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-green?style=flat-square&logo=android" />
  <img src="https://img.shields.io/badge/Protocol-SSH-blue?style=flat-square&logo=openssh" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/Languages-9-orange?style=flat-square" />
</p>

> A powerful, free Android app for managing your home server or rack from your phone. No cloud, no middleman — direct SSH connection.

---

## Features

### 📊 Monitor
- Live CPU, RAM, Disk, Temperature metrics with progress bars
- CPU frequency (live / min / max MHz)
- RAM: used / free in MB or GB
- Disk: used / total in GB
- Fan speed (RPM)
- Network upload/download speed
- MAC address with one-tap copy
- Uptime, Load average, Active processes, Kernel version
- **Historical graphs** — CPU, RAM, Disk, Temp over last 24h or 7 days (requires monitor script)

### ⚡ Power
- **Wake on LAN** — sends magic packet + auto-verifies if server came online
- **Restart** — with confirmation dialog
- **Shutdown** — with confirmation dialog
- **Suspend** (systemctl suspend) — WoL still works after suspend
- Multi-server switcher — switch active server from Power tab
- **Activity log** — full history of shutdown/restart/connect/kill events with timestamps

### 🖥️ Terminal
- Full SSH terminal with native Android plugin (JSch)
- **Custom keyboard bar** — Tab, Ctrl+C, Ctrl+Z, Ctrl+L, ↑↓ history, sudo, ls, cd, cat, grep, tail -f, systemctl, docker, htop, Clear
- Command history with arrow keys
- Protocol selector: SSH / Mosh / Telnet / SFTP / Port Forwarding
- Auto-scroll, multiline output, selectable text

### 🐳 Docker
- List all containers with status (running / stopped)
- Start / Stop individual containers
- View last 60 lines of container logs inline
- Auto-refresh on tab open

### 📁 Files (SFTP)
- Browse server filesystem
- Upload files from phone (base64 transfer over SSH)
- Download files to phone
- Delete files and folders
- Create new folders
- File type icons (video, audio, image, code, archive, etc.)
- Breadcrumb path bar

### 🌐 Dashboards
- Add any web panel by IP/URL + port
- Custom icon support (URL)
- Persistent WebView sessions
- Back / Reload / Home controls
- Works with: CasaOS, Plex, TrueNAS, Jellyfin, Portainer, Home Assistant, Nextcloud, etc.

### 🔧 Tools
- **Port Scanner** — check open/closed ports on any host via server
- **Speed Test** — runs speedtest-cli on server
- **Samba Manager** — add/remove users, add/remove shares, set permissions

### ⚙️ Settings
- **Multi-server** — add unlimited servers, switch instantly with auto-reconnect
- **SSH Key Auth** — paste private key as alternative to password
- **Language** — 9 languages: English, Română, Français, Deutsch, Español, Italiano, Português, Nederlands, Polski
- **Dark / Light theme**
- **Fingerprint lock** — optional biometric auth on app open
- **Background alerts** — push notifications when CPU >90%, Disk >95%, Temp >80°C (configurable)
- **Backup / Restore** — export/import all settings as JSON
- **Monitor Script installer** — one-tap install on server for historical data

---

## Installation

### Option 1: Download APK
1. Go to **Actions** tab → latest **Build Android APK** run
2. Download **ServerCtrl-APK** artifact
3. Extract and install `app-debug.apk` on Android
4. Enable "Install from unknown sources" if prompted

### Option 2: Build yourself
```bash
git clone https://github.com/TwentyOneishere/Server-ctrl.git
cd Server-ctrl
npm install
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## Monitor Script (Historical Graphs)

Install on your server for 7-day metric history:

```bash
# On your server:
curl -fsSL https://raw.githubusercontent.com/TwentyOneishere/Server-ctrl/main/scripts/serverctrl-monitor.sh -o /tmp/sc-monitor.sh
chmod +x /tmp/sc-monitor.sh
sudo /tmp/sc-monitor.sh install
```

Or use the **Install on Server** button in Settings → Monitor Script.

The script:
- Installs as a systemd timer (runs every minute)
- Stores data in `/var/log/serverctrl/metrics.jsonl`
- Keeps last 7 days (10,080 entries)
- Works on any systemd-based Linux (Ubuntu, Debian, Fedora, Arch, etc.)

---

## Compatibility

Tested on:
- Ubuntu 20.04, 22.04, 24.04
- Debian 11, 12
- Raspberry Pi OS
- CasaOS (Debian base)
- Fedora 38+
- Arch Linux

Commands use multi-distro fallbacks for maximum compatibility.

---

## Requirements

**Server:**
- SSH server running (`sudo systemctl enable --now ssh`)
- User with sudo for shutdown/restart
- Docker (optional, for Docker tab)
- Samba (optional, for Samba manager)

**Android:**
- Android 8.0+ (API 26+)
- Same network as server (for WoL)

---

## Privacy

- **Zero telemetry** — no data leaves your device except direct SSH connections to your own server
- All settings stored locally on device
- No accounts, no cloud, no ads

---

## License

MIT License — free to use, modify, and distribute.

---

## Contributing

PRs welcome. Open an issue for bug reports or feature requests.
