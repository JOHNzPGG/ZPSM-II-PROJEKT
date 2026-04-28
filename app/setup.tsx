import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles, colors } from './constants/globalStyles';

export default function SetupScreen() {
  const [name, setName] = useState('');
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Błąd', 'Pseudonim musi mieć co najmniej 3 znaki.');
      return;
    }

    try {
      await AsyncStorage.setItem('username', name.trim());
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać pseudonimu.');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.centeredContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View
        style={[
          globalStyles.setupCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        <Text style={globalStyles.setupAppTitle}>PC Upgrade Advisor</Text>
        <Text style={globalStyles.setupSubtitle}>
          Podaj swój pseudonim, aby rozpocząć korzystanie z aplikacji.
        </Text>

        <TextInput
          style={globalStyles.inputModern}
          placeholder="Np. MasterRace99"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={20}
        />

        <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleSave} activeOpacity={0.85}>
          <Text style={globalStyles.buttonText}>ZAPISZ I KONTYNUUJ</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}