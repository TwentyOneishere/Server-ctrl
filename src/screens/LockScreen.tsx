// src/screens/LockScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Vibration, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useStore } from '../store';
import { Colors, Fonts } from '../utils/theme';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function LockScreen() {
  const { settings, setLocked } = useStore();
  const [pin, setPin] = useState('');
  const shakeAnim = new Animated.Value(0);

  const shake = () => {
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start(() => setPin(''));
  };

  const handleKey = useCallback((k: string) => {
    if (k === '⌫') { setPin(p => p.slice(0, -1)); return; }
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      if (next === settings.pin) {
        Vibration.vibrate(50);
        setTimeout(() => setLocked(false), 100);
      } else {
        shake();
      }
    }
  }, [pin, settings.pin]);

  const tryBiometric = useCallback(async () => {
    if (!settings.biometricEnabled) return;
    const rnBiometrics = new ReactNativeBiometrics();
    const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Autentifică-te' });
    if (success) setLocked(false);
  }, [settings.biometricEnabled]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Glow */}
      <View style={s.glow} pointerEvents="none" />

      <Text style={s.appName}>ServerPilot</Text>
      <Text style={s.subtitle}>Introdu PIN pentru acces</Text>

      {/* Dots */}
      <Animated.View style={[s.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[s.dot, { backgroundColor: i < pin.length ? Colors.accent : 'transparent',
            borderColor: i < pin.length ? Colors.accent : Colors.border,
            shadowColor: Colors.accent, shadowOpacity: i < pin.length ? 0.8 : 0,
            shadowRadius: 8, elevation: i < pin.length ? 4 : 0,
          }]} />
        ))}
      </Animated.View>

      {/* Numpad */}
      <View style={s.numpad}>
        {KEYS.map((k, i) => (
          <TouchableOpacity key={i} style={[s.key, !k && s.keyEmpty]}
            onPress={() => k && handleKey(k)} disabled={!k} activeOpacity={0.6}>
            {k ? <Text style={[s.keyText, k === '⌫' && s.keyBackspace]}>{k}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>

      {settings.biometricEnabled && (
        <TouchableOpacity style={s.bioBtn} onPress={tryBiometric}>
          <Text style={s.bioText}>👆 Autentificare biometrică</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 32 },
  glow: { position: 'absolute', top: '15%', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'transparent', shadowColor: Colors.accent, shadowOpacity: 0.15,
    shadowRadius: 80, elevation: 0 },
  appName: { fontFamily: Fonts.displayBlack, fontSize: 36, color: Colors.accent, letterSpacing: -1 },
  subtitle: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.textMuted, marginTop: -20 },
  dots: { flexDirection: 'row', gap: 18 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 12, justifyContent: 'center' },
  key: { width: 72, height: 72, borderRadius: 16, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontFamily: Fonts.displayBlack, fontSize: 26, color: Colors.text },
  keyBackspace: { fontSize: 20, color: Colors.textSub },
  bioBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  bioText: { fontFamily: Fonts.mono, fontSize: 12, color: Colors.accentDim },
});
