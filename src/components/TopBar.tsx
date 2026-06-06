// src/components/TopBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../utils/theme';
import { useStore } from '../store';

interface TopBarProps {
  onMenu: () => void;
  title?: string;
}

export default function TopBar({ onMenu, title }: TopBarProps) {
  const { servers, activeServerId, alerts } = useStore();
  const server = servers.find(s => s.id === activeServerId);
  const unread = alerts.filter(a => !a.read).length;

  return (
    <View style={s.bar}>
      <TouchableOpacity style={s.menuBtn} onPress={onMenu}>
        <View style={s.hamburger}>
          {[0,1,2].map(i => <View key={i} style={s.line} />)}
        </View>
      </TouchableOpacity>

      {server ? (
        <View style={s.mid}>
          <View style={s.serverRow}>
            <View style={[s.dot, { backgroundColor: server.status === 'online' ? Colors.green : Colors.red }]} />
            <Text style={s.serverName} numberOfLines={1}>{server.name}</Text>
          </View>
          <Text style={s.serverHost}>{server.host}</Text>
        </View>
      ) : (
        <Text style={s.noServer}>Niciun server selectat</Text>
      )}

      <TouchableOpacity style={s.iconBtn}>
        <Text style={{ fontSize: 16 }}>🔔</Text>
        {unread > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  bar:        { flexDirection: 'row', alignItems: 'center', padding: 10, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuBtn:    { width: 36, height: 36, backgroundColor: Colors.surfaceHigh, borderWidth: 1,
    borderColor: Colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  hamburger:  { gap: 3.5 },
  line:       { width: 14, height: 1.5, backgroundColor: Colors.textSub, borderRadius: 1 },
  mid:        { flex: 1, marginHorizontal: 10 },
  serverRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:        { width: 7, height: 7, borderRadius: 3.5 },
  serverName: { fontFamily: 'Syne-Bold', fontSize: 13, color: Colors.text, flex: 1 },
  serverHost: { fontFamily: 'JetBrainsMono-Regular', fontSize: 9, color: Colors.textMuted },
  noServer:   { flex: 1, fontFamily: 'JetBrainsMono-Regular', fontSize: 11, color: Colors.textMuted, marginHorizontal: 10 },
  iconBtn:    { width: 36, height: 36, backgroundColor: Colors.surfaceHigh, borderWidth: 1,
    borderColor: Colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badge:      { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16,
    backgroundColor: Colors.red, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.surface, paddingHorizontal: 2 },
  badgeText:  { fontFamily: 'JetBrainsMono-Regular', fontSize: 8, color: '#fff', fontWeight: '700' },
});
