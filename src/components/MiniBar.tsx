// src/components/MiniBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../utils/theme';

interface MiniBarProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  color: string;
}

export default function MiniBar({ label, used, total, unit, color }: MiniBarProps) {
  const pct = Math.round((used / total) * 100);
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.val}>{used}{unit} / {total}{unit} <Text style={s.pct}>({pct}%)</Text></Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { fontFamily: 'JetBrainsMono-Regular', fontSize: 10, color: Colors.textSub },
  val:   { fontFamily: 'JetBrainsMono-Regular', fontSize: 10, color: Colors.text },
  pct:   { color: Colors.textMuted },
  track: { height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  fill:  { height: '100%', borderRadius: 2 },
});
