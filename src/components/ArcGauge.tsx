// src/components/ArcGauge.tsx
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts } from '../utils/theme';

interface ArcGaugeProps {
  value: number;
  color: string;
  label: string;
  sub: string;
  size?: number;
}

export default function ArcGauge({ value, color, label, sub, size = 86 }: ArcGaugeProps) {
  const r = 36, cx = 50, cy = 52;
  const pct = Math.min(value, 100) / 100;
  const angle = pct * 220;
  const sa = -110;
  const rad = (d: number) => (d * Math.PI) / 180;
  const ax = (a: number) => cx + r * Math.cos(rad(a));
  const ay = (a: number) => cy + r * Math.sin(rad(a));
  const ea = sa + angle;
  const la = angle > 180 ? 1 : 0;
  const tc = value > 85 ? Colors.red : value > 65 ? Colors.yellow : color;
  const bg = `M ${ax(sa)} ${ay(sa)} A ${r} ${r} 0 1 1 ${ax(sa + 220)} ${ay(sa + 220)}`;
  const vp = angle > 0 ? `M ${ax(sa)} ${ay(sa)} A ${r} ${r} 0 ${la} 1 ${ax(ea)} ${ay(ea)}` : null;

  return (
    <View style={{ alignItems: 'center', width: size }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Path d={bg} fill="none" stroke={Colors.border} strokeWidth={5} strokeLinecap="round" />
        {vp && (
          <Path d={vp} fill="none" stroke={tc} strokeWidth={5} strokeLinecap="round" />
        )}
        <SvgText x={cx} y={cy - 2} textAnchor="middle" fill={tc}
          fontSize="15" fontWeight="700" fontFamily={Fonts.mono}>
          {value}
        </SvgText>
        <SvgText x={cx} y={cy + 12} textAnchor="middle" fill={Colors.textMuted}
          fontSize="8" fontFamily={Fonts.mono}>
          {sub}
        </SvgText>
      </Svg>
      <Text style={{ fontFamily: Fonts.mono, fontSize: 9, color: Colors.textSub, marginTop: -4 }}>
        {label}
      </Text>
    </View>
  );
}
