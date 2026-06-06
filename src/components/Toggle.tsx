// src/components/Toggle.tsx
import React from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors } from '../utils/theme';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

export default function Toggle({ value, onChange, color = Colors.accent }: ToggleProps) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 21] });
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, color] });

  return (
    <TouchableOpacity onPress={() => onChange(!value)} activeOpacity={0.8}>
      <Animated.View style={[s.track, { backgroundColor: bg }]}>
        <Animated.View style={[s.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  track: { width: 42, height: 23, borderRadius: 12, justifyContent: 'center' },
  thumb: { width: 17, height: 17, borderRadius: 8.5, backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3, elevation: 2 },
});
