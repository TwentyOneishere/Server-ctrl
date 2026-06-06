// src/screens/DashboardScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useStore } from '../store';
import { sshManager } from '../utils/ssh';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';
import TopBar from '../components/TopBar';
import ArcGauge from '../components/ArcGauge';
import MiniBar  from '../components/MiniBar';
import StatChip from '../components/StatChip';

const DETECTED_PANELS = [
  { name: 'CasaOS',      port: 81,   icon: '🏠', color: Colors.accent  },
  { name: 'qBittorrent', port: 8080, icon: '⬇',  color: Colors.green   },
  { name: 'Jellyfin',    port: 8096, icon: '🎬', color: Colors.purple  },
  { name: 'Immich',      port: 2283, icon: '📷', color: Colors.yellow  },
];

const QUICK_ACTIONS = [
  { label: 'Terminal',  icon: '⌨',  color: Colors.accent,  screen: 'Terminal'   },
  { label: 'Docker',    icon: '🐳', color: Colors.purple,  screen: 'Docker'     },
  { label: 'Files',     icon: '📁', color: Colors.yellow,  screen: 'Files'      },
  { label: 'Samba',     icon: '🗂', color: Colors.teal,    screen: 'Samba'      },
  { label: 'Firewall',  icon: '🛡', color: Colors.orange,  screen: 'Firewall'   },
  { label: 'Install',   icon: '📦', color: Colors.green,   screen: 'Install'    },
];

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { servers, activeServerId } = useStore();
  const server = servers.find(s => s.id === activeServerId);

  const [stats, setStats] = useState({
    cpu: 34, temp: 61, ramUsed: 5.2, ramTotal: 8,
    diskUsed: 312, diskTotal: 512, fanRpm: 2840,
    netDown: '4.8 MB/s', netUp: '1.2 MB/s', load: '1.23',
    uptime: '14d 6h', ping: 3,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [detected, setDetected] = useState(DETECTED_PANELS);

  const fetchStats = useCallback(async () => {
    if (!activeServerId) return;
    setRefreshing(true);
    try {
      const res = await sshManager.getSystemStats(activeServerId);
      // Parse and update stats from SSH output
      // Real parsing logic goes here
    } catch (e) {}
    setRefreshing(false);
  }, [activeServerId]);

  useEffect(() => { fetchStats(); }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar onMenu={() => navigation.dispatch(DrawerActions.openDrawer())} />

      <ScrollView style={s.scroll} contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats}
          tintColor={Colors.accent} />}>

        {/* Page title */}
        <Text style={s.title}>Dashboard</Text>

        {/* Server card */}
        <View style={s.card}>
          <View style={s.serverRow}>
            <View style={[s.dot, { backgroundColor: server?.status === 'online' ? Colors.green : Colors.red }]} />
            <Text style={s.serverName}>{server?.name || 'Niciun server activ'}</Text>
          </View>
          <Text style={s.serverSub}>{server ? `${server.username}@${server.host} · ${server.port}` : 'Adaugă un server din meniu'}</Text>
          <View style={s.statsRow}>
            {[
              { l: 'UPTIME', v: stats.uptime, c: Colors.green },
              { l: 'PING',   v: `${stats.ping}ms`, c: Colors.accent },
              { l: 'LOAD',   v: stats.load, c: Colors.yellow },
              { l: 'PROC',   v: '247', c: Colors.textSub },
            ].map(item => (
              <View key={item.l}>
                <Text style={s.statLabel}>{item.l}</Text>
                <Text style={[s.statVal, { color: item.c }]}>{item.v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gauges */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>SISTEM LIVE</Text>
          <View style={s.gaugesRow}>
            <ArcGauge value={stats.cpu}  color={Colors.accent} label="CPU"  sub="%" />
            <ArcGauge value={stats.temp} color={stats.temp > 75 ? Colors.red : Colors.yellow} label="TEMP" sub="°C" />
            <ArcGauge value={Math.round(stats.ramUsed/stats.ramTotal*100)} color={Colors.purple} label="RAM" sub="%" />
            <ArcGauge value={Math.round(stats.diskUsed/stats.diskTotal*100)} color={Colors.green} label="DISK" sub="%" />
          </View>
          <View style={{ marginTop: 12 }}>
            <MiniBar label="RAM"  used={stats.ramUsed}  total={stats.ramTotal}  unit=" GB" color={Colors.purple} />
            <MiniBar label="DISK" used={stats.diskUsed} total={stats.diskTotal} unit=" GB" color={Colors.green}  />
          </View>
          <View style={s.netRow}>
            <Text style={s.netText}>FAN: <Text style={{ color: Colors.yellow }}>{stats.fanRpm} RPM</Text></Text>
            <Text style={s.netText}>↓ {stats.netDown}</Text>
            <Text style={s.netText}>↑ {stats.netUp}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>ACȚIUNI RAPIDE</Text>
          <View style={s.quickGrid}>
            {QUICK_ACTIONS.map(q => (
              <TouchableOpacity key={q.label} style={s.quickBtn}
                onPress={() => navigation.navigate(q.screen)}>
                <Text style={{ fontSize: 22 }}>{q.icon}</Text>
                <Text style={[s.quickLabel, { color: q.color }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detected Panels */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>PANELE DETECTATE AUTOMAT</Text>
          {detected.map((p, i) => (
            <View key={p.name} style={[s.panelRow, i < detected.length-1 && s.panelBorder]}>
              <Text style={{ fontSize: 20 }}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.panelName}>{p.name}</Text>
                <Text style={s.panelPort}>:{p.port}</Text>
              </View>
              <TouchableOpacity style={[s.openBtn, { borderColor: p.color + '50', backgroundColor: p.color + '18' }]}>
                <Text style={[s.openText, { color: p.color }]}>DESCHIDE →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  scroll:       { flex: 1 },
  content:      { padding: Spacing.md, paddingBottom: 100, gap: 12 },
  title:        { fontFamily: Fonts.displayBlack, fontSize: 24, color: Colors.text, letterSpacing: -0.5 },
  card:         { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md },
  serverRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  dot:          { width: 8, height: 8, borderRadius: 4 },
  serverName:   { fontFamily: Fonts.display, fontSize: 16, color: Colors.text, flex: 1 },
  serverSub:    { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textMuted, marginBottom: 10 },
  statsRow:     { flexDirection: 'row', gap: 20, marginTop: 4 },
  statLabel:    { fontFamily: Fonts.mono, fontSize: 8, color: Colors.textMuted },
  statVal:      { fontFamily: Fonts.mono, fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.textMuted, letterSpacing: 1.2, marginBottom: 10 },
  gaugesRow:    { flexDirection: 'row', justifyContent: 'space-around' },
  netRow:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  netText:      { fontFamily: Fonts.mono, fontSize: 10, color: Colors.textSub },
  quickGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn:     { flex: 1, minWidth: '30%', alignItems: 'center', gap: 5, padding: 12,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md },
  quickLabel:   { fontFamily: Fonts.mono, fontSize: 9 },
  panelRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  panelBorder:  { borderBottomWidth: 1, borderBottomColor: Colors.border },
  panelName:    { fontFamily: Fonts.display, fontSize: 13, color: Colors.text },
  panelPort:    { fontFamily: Fonts.mono, fontSize: 9, color: Colors.textMuted },
  openBtn:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
  openText:     { fontFamily: Fonts.mono, fontSize: 9, fontWeight: '700' },
});
