# ServerPilot — SSH Server Manager

Aplicație mobilă React Native pentru administrarea serverelor prin SSH.  
100% locală pe telefon — **fără cloud, fără intermediari**.

---

## 📱 Funcționalități (37 module)

| Categorie | Module |
|-----------|--------|
| **Overview** | Dashboard live, Monitoring (CPU/Temp/RAM/Disk/Net), Terminal SSH multi-sesiune |
| **Sistem** | Process Manager (kill/renice), Docker Manager, Servicii systemd, Cron Jobs |
| **Storage** | File Manager + chmod vizual, Disk & SMART health, Samba Manager, Backup scheduler |
| **Rețea** | Network & IP, Port Forwarding UI, Firewall UFW, DNS Checker, Speedtest |
| **Aplicații** | Nginx VHosts, SSL Certificates, MySQL Manager, Panele auto-detectate, Install Center |
| **Admin** | Log Viewer live, Power Control (WoL/shutdown), Alerturi, Multi-server manager, Setări |

---

## 🚀 Instalare & Build

### Cerințe
- Node.js ≥ 18
- React Native 0.73
- Android Studio (pentru APK) sau Xcode (pentru iOS)
- JDK 17

### Setup rapid

```bash
# 1. Instalează dependențele
npm install

# 2. Android
npx react-native run-android

# 3. Build APK Release
cd android && ./gradlew assembleRelease
# APK se găsește în: android/app/build/outputs/apk/release/app-release.apk
```

### Configurare fonturi (obligatoriu)

Adaugă fonturile `JetBrains Mono` și `Syne` în `android/app/src/main/assets/fonts/`:
```
JetBrainsMono-Regular.ttf
JetBrainsMono-SemiBold.ttf
Syne-Bold.ttf
Syne-ExtraBold.ttf
```

Apoi în `android/app/build.gradle` adaugă:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

Și în `react-native.config.js`:
```js
module.exports = {
  assets: ['./src/assets/fonts'],
};
```

Rulează: `npx react-native-asset`

---

## 📁 Structură proiect

```
ServerPilot/
├── App.tsx                     # Entry point, navigare root
├── src/
│   ├── screens/
│   │   ├── LockScreen.tsx      # PIN + biometrie
│   │   ├── DashboardScreen.tsx # Overview principal
│   │   ├── MonitorScreen.tsx   # Grafice live
│   │   ├── TerminalScreen.tsx  # SSH Terminal
│   │   ├── DockerScreen.tsx    # Docker Manager
│   │   ├── ProcessScreen.tsx   # Process Manager
│   │   ├── FileScreen.tsx      # File Manager
│   │   ├── SambaScreen.tsx     # Samba
│   │   ├── PortForwardScreen.tsx
│   │   ├── FirewallScreen.tsx  # UFW
│   │   ├── NetworkScreen.tsx
│   │   ├── DiskScreen.tsx      # SMART
│   │   ├── ServicesScreen.tsx  # systemd
│   │   ├── CronScreen.tsx
│   │   ├── LogsScreen.tsx
│   │   ├── InstallScreen.tsx   # Install Center
│   │   ├── SettingsScreen.tsx  # Setări
│   │   ├── ServersScreen.tsx   # Multi-server
│   │   ├── PowerScreen.tsx     # WoL / shutdown
│   │   └── ...
│   ├── components/
│   │   ├── TopBar.tsx
│   │   ├── CustomDrawer.tsx
│   │   ├── ArcGauge.tsx
│   │   ├── MiniBar.tsx
│   │   ├── Toggle.tsx
│   │   └── ...
│   ├── utils/
│   │   ├── ssh.ts              # SSH Manager (toate comenzile)
│   │   └── theme.ts            # Design tokens
│   └── store/
│       └── index.ts            # Zustand global state + persist
├── package.json
└── tsconfig.json
```

---

## 🔐 Securitate

- Credențialele serverelor sunt stocate cu **react-native-encrypted-storage** (Keychain iOS / Keystore Android)
- Parolele SSH nu sunt niciodată exportate în JSON
- PIN-ul aplicației este stocat hash-uit local
- Conexiunile SSH sunt end-to-end encrypted (SSH protocol)

---

## 📤 Import / Export

Din **Setări → Backup** poți exporta un fișier `serverpilot_backup.json` care conține:
- Lista serverelor (fără parole)
- Toate setările
- Istoricul comenzilor
- Reguli personalizate

---

## 🎨 Design System

| Token | Valoare |
|-------|---------|
| Background | `#0A0C10` |
| Surface | `#111318` |
| Accent | `#00D4FF` |
| Green | `#00E57A` |
| Font display | Syne ExtraBold |
| Font mono | JetBrains Mono |

---

## 📋 Dependențe principale

| Pachet | Rol |
|--------|-----|
| `react-native-ssh-sftp` | Conexiuni SSH/SFTP |
| `react-native-biometrics` | Autentificare biometrică |
| `react-native-encrypted-storage` | Stocare securizată credențiale |
| `@react-navigation/drawer` | Navigare cu side drawer |
| `zustand` | State management global |
| `react-native-svg` | Gauge-uri și grafice |
| `@react-native-async-storage/async-storage` | Persistență setări |
| `react-native-fs` | Acces sistem fișiere (import/export) |
| `react-native-wake-on-lan` | Wake-on-LAN |

---

## 🐛 Troubleshooting

**Build eșuat cu `JetBrainsMono not found`**  
→ Verifică că fonturile sunt în `src/assets/fonts/` și ai rulat `npx react-native-asset`

**SSH connection refused**  
→ Verifică că portul SSH e deschis: `nc -zv IP PORT`  
→ Verifică firewall-ul serverului: `sudo ufw status`

**Biometria nu funcționează**  
→ Activează din Setări → Securitate → Biometrie  
→ Necesită PIN activat mai întâi

---

*ServerPilot v1.0.0 · MIT License · 2026*
