// src/components/CustomDrawer.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Colors, Fonts } from '../utils/theme';

const NAV_SECTIONS = [
  { label: 'OVERVIEW', items: [
    { name: 'Dashboard',  icon: '🏠', screen: 'MainTabs'    },
    { name: 'Monitoring', icon: '📊', screen: 'Monitor'     },
    { name: 'Terminal',   icon: '⌨',  screen: 'Terminal'    },
  ]},
  { label: 'SISTEM', items: [
    { name: 'Procese',         icon: '⚙',  screen: 'Processes'  },
    { name: 'Docker',          icon: '🐳', screen: 'Docker'     },
    { name: 'Servicii systemd',icon: '🔧', screen: 'Services'   },
    { name: 'Cron Jobs',       icon: '⏰', screen: 'Cron'       },
  ]},
  { label: 'STORAGE & FIȘIERE', items: [
    { name: 'File Manager',  icon: '📁', screen: 'Files'       },
    { name: 'Disk & SMART',  icon: '💾', screen: 'Disk'        },
    { name: 'Samba Manager', icon: '🗂', screen: 'Samba'       },
    { name: 'Backup',        icon: '📦', screen: 'Backup'      },
  ]},
  { label: 'REȚEA', items: [
    { name: 'Rețea & IP-uri',  icon: '🌐', screen: 'Network'     },
    { name: 'Port Forwarding', icon: '🔀', screen: 'PortForward' },
    { name: 'Firewall UFW',    icon: '🛡', screen: 'Firewall'    },
    { name: 'DNS Checker',     icon: '🔍', screen: 'DNS'         },
    { name: 'Speedtest',       icon: '⚡', screen: 'Speedtest'   },
  ]},
  { label: 'APLICAȚII', items: [
    { name: 'Nginx / VHosts',     icon: '🔀', screen: 'Nginx'    },
    { name: 'SSL Certificates',   icon: '🔒', screen: 'SSL'      },
    { name: 'MySQL Manager',      icon: '🐬', screen: 'Database' },
    { name: 'Panele Detectate',   icon: '🖥', screen: 'Panels'   },
    { name: 'Install Center',     icon: '📦', screen: 'Install'  },
  ]},
  { label: 'ADMIN', items: [
    { name: 'Log Viewer',   icon: '📋', screen: 'Logs'     },
    { name: 'Power Control',icon: '⚡', screen: 'Power'    },
    { name: 'Alerturi',     icon: '🔔', screen: 'Alerts'   },
    { name: 'Servere',      icon: '🖥', screen: 'Servers'  },
    { name: 'Setări',       icon: '⚙', screen: 'Settings' },
  ]},
];

export default function CustomDrawer(props: any) {
  const { navigation, state } = props;
  const currentRoute = state?.routeNames?.[state?.index];

  const navigate = (screen: string) => {
    navigation.closeDrawer();
    if (screen === 'MainTabs') navigation.navigate('MainTabs');
    else navigation.navigate(screen);
  };

  return (
    <View style={s.container}>
      {/* Logo */}
      <View style={s.logo}>
        <Text style={s.logoText}>ServerPilot</Text>
        <Text style={s.logoSub}>v1.0.0 · SSH Control</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {NAV_SECTIONS.map(section => (
          <View key={section.label} style={s.section}>
            <Text style={s.sectionLabel}>{section.label}</Text>
            {section.items.map(item => {
              const active = currentRoute === item.screen || (item.screen === 'MainTabs' && currentRoute === 'MainTabs');
              return (
                <TouchableOpacity key={item.name} style={[s.item, active && s.itemActive]}
                  onPress={() => navigate(item.screen)}>
                  <Text style={{ fontSize: 15 }}>{item.icon}</Text>
                  <Text style={[s.itemText, active && s.itemTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.surface },
  logo:          { padding: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceHigh },
  logoText:      { fontFamily: 'Syne-ExtraBold', fontSize: 22, color: Colors.accent, letterSpacing: -0.5 },
  logoSub:       { fontFamily: 'JetBrainsMono-Regular', fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  section:       { paddingTop: 10, paddingBottom: 4 },
  sectionLabel:  { paddingHorizontal: 20, fontSize: 9, color: Colors.textMuted,
    fontFamily: 'JetBrainsMono-Regular', letterSpacing: 1.5, marginBottom: 2 },
  item:          { flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8, paddingHorizontal: 20,
    borderLeftWidth: 2, borderLeftColor: 'transparent' },
  itemActive:    { backgroundColor: Colors.accentGlow, borderLeftColor: Colors.accent },
  itemText:      { fontFamily: 'JetBrainsMono-Regular', fontSize: 12, color: Colors.textSub },
  itemTextActive:{ color: Colors.accent },
});
