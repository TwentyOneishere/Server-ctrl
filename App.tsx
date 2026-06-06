// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useStore } from './src/store';
import { Colors } from './src/utils/theme';

// Screens
import LockScreen        from './src/screens/LockScreen';
import DashboardScreen   from './src/screens/DashboardScreen';
import MonitorScreen     from './src/screens/MonitorScreen';
import TerminalScreen    from './src/screens/TerminalScreen';
import DockerScreen      from './src/screens/DockerScreen';
import ProcessScreen     from './src/screens/ProcessScreen';
import FileScreen        from './src/screens/FileScreen';
import SambaScreen       from './src/screens/SambaScreen';
import PortForwardScreen from './src/screens/PortForwardScreen';
import FirewallScreen    from './src/screens/FirewallScreen';
import NetworkScreen     from './src/screens/NetworkScreen';
import DiskScreen        from './src/screens/DiskScreen';
import ServicesScreen    from './src/screens/ServicesScreen';
import CronScreen        from './src/screens/CronScreen';
import LogsScreen        from './src/screens/LogsScreen';
import InstallScreen     from './src/screens/InstallScreen';
import SettingsScreen    from './src/screens/SettingsScreen';
import ServersScreen     from './src/screens/ServersScreen';
import PowerScreen       from './src/screens/PowerScreen';
import BackupScreen      from './src/screens/BackupScreen';
import NginxScreen       from './src/screens/NginxScreen';
import SSLScreen         from './src/screens/SSLScreen';
import DatabaseScreen    from './src/screens/DatabaseScreen';
import AlertsScreen      from './src/screens/AlertsScreen';
import SpeedtestScreen   from './src/screens/SpeedtestScreen';
import DNSScreen         from './src/screens/DNSScreen';
import PanelsScreen      from './src/screens/PanelsScreen';

import CustomDrawer from './src/components/CustomDrawer';

const Drawer = createDrawerNavigator();
const Tab    = createBottomTabNavigator();
const Stack  = createStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary:    Colors.accent,
    background: Colors.bg,
    card:       Colors.surface,
    text:       Colors.text,
    border:     Colors.border,
    notification: Colors.red,
  },
};

// ── Bottom Tab Navigator ───────────────────────────────────────────────────
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontFamily: 'JetBrainsMono-Regular', fontSize: 9 },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen}  options={{ tabBarLabel: 'Home',     tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} /> }} />
      <Tab.Screen name="Monitor"    component={MonitorScreen}    options={{ tabBarLabel: 'Monitor',  tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} /> }} />
      <Tab.Screen name="Terminal"   component={TerminalScreen}   options={{ tabBarLabel: 'Terminal', tabBarIcon: ({ color }) => <TabIcon icon="⌨"  color={color} /> }} />
      <Tab.Screen name="Docker"     component={DockerScreen}     options={{ tabBarLabel: 'Docker',   tabBarIcon: ({ color }) => <TabIcon icon="🐳" color={color} /> }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}   options={{ tabBarLabel: 'Setări',   tabBarIcon: ({ color }) => <TabIcon icon="⚙"  color={color} /> }} />
    </Tab.Navigator>
  );
}

// ── Drawer Navigator (full app) ────────────────────────────────────────────
function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: Colors.surface, width: 280 },
        drawerActiveTintColor: Colors.accent,
        drawerInactiveTintColor: Colors.textSub,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="MainTabs"    component={BottomTabs}       options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Processes"   component={ProcessScreen}    options={{ title: 'Procese' }} />
      <Drawer.Screen name="Files"       component={FileScreen}       options={{ title: 'File Manager' }} />
      <Drawer.Screen name="Samba"       component={SambaScreen}      options={{ title: 'Samba Manager' }} />
      <Drawer.Screen name="Disk"        component={DiskScreen}       options={{ title: 'Disk & SMART' }} />
      <Drawer.Screen name="Backup"      component={BackupScreen}     options={{ title: 'Backup' }} />
      <Drawer.Screen name="Network"     component={NetworkScreen}    options={{ title: 'Rețea & IP-uri' }} />
      <Drawer.Screen name="PortForward" component={PortForwardScreen}options={{ title: 'Port Forwarding' }} />
      <Drawer.Screen name="Firewall"    component={FirewallScreen}   options={{ title: 'Firewall UFW' }} />
      <Drawer.Screen name="DNS"         component={DNSScreen}        options={{ title: 'DNS Checker' }} />
      <Drawer.Screen name="Speedtest"   component={SpeedtestScreen}  options={{ title: 'Speedtest' }} />
      <Drawer.Screen name="Nginx"       component={NginxScreen}      options={{ title: 'Nginx / VHosts' }} />
      <Drawer.Screen name="SSL"         component={SSLScreen}        options={{ title: 'SSL Certificates' }} />
      <Drawer.Screen name="Database"    component={DatabaseScreen}   options={{ title: 'MySQL Manager' }} />
      <Drawer.Screen name="Services"    component={ServicesScreen}   options={{ title: 'Servicii systemd' }} />
      <Drawer.Screen name="Cron"        component={CronScreen}       options={{ title: 'Cron Jobs' }} />
      <Drawer.Screen name="Logs"        component={LogsScreen}       options={{ title: 'Log Viewer' }} />
      <Drawer.Screen name="Install"     component={InstallScreen}    options={{ title: 'Install Center' }} />
      <Drawer.Screen name="Panels"      component={PanelsScreen}     options={{ title: 'Panele Detectate' }} />
      <Drawer.Screen name="Power"       component={PowerScreen}      options={{ title: 'Power Control' }} />
      <Drawer.Screen name="Alerts"      component={AlertsScreen}     options={{ title: 'Alerturi' }} />
      <Drawer.Screen name="Servers"     component={ServersScreen}    options={{ title: 'Servere' }} />
    </Drawer.Navigator>
  );
}

// ── Root Stack (Lock → Main) ───────────────────────────────────────────────
function RootNavigator() {
  const isLocked = useStore(s => s.isLocked);
  const pinEnabled = useStore(s => s.settings.pinEnabled);

  if (isLocked && pinEnabled) {
    return <LockScreen />;
  }
  return <MainDrawer />;
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const hydrate = useStore(s => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────
function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, opacity: color === Colors.accent ? 1 : 0.5 }}>{icon}</Text>;
}
