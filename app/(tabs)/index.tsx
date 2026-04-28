import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  Text,
  View,
} from 'react-native';
import DummyBottomNav from '../../components/DummyBottomNav';
import { globalStyles } from '../constants/globalStyles';

export default function HomeScreen() {
  const [username, setUsername] = useState('użytkowniku');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const loadUser = async () => {
      const savedName = await AsyncStorage.getItem('username');
      if (savedName) setUsername(savedName);
    };

    loadUser();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={globalStyles.container}>
      <ScrollView
        contentContainerStyle={globalStyles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={globalStyles.greetingCard}>
            <Text style={globalStyles.greetingText}>Cześć, {username}!</Text>
            <Text style={globalStyles.greetingSubtext}>
              Sprawdź komponenty, zestawy i sugestie ulepszeń.
            </Text>
          </View>

          <View style={globalStyles.section}>
            <Text style={globalStyles.sectionTitle}>Szybkie akcje</Text>

            <View style={globalStyles.cardGrid}>
              <View style={globalStyles.dashboardCard}>
                <Text style={globalStyles.dashboardCardTitle}>Komponenty</Text>
                <Text style={globalStyles.dashboardCardText}>
                  Przeglądaj CPU, GPU, RAM i dyski.
                </Text>
              </View>

              <View style={globalStyles.dashboardCard}>
                <Text style={globalStyles.dashboardCardTitle}>Konfiguracje</Text>
                <Text style={globalStyles.dashboardCardText}>
                  Zarządzaj swoimi zestawami.
                </Text>
              </View>

              <View style={globalStyles.dashboardCard}>
                <Text style={globalStyles.dashboardCardTitle}>Kompatybilność</Text>
                <Text style={globalStyles.dashboardCardText}>
                  Sprawdź zgodność wybranych podzespołów.
                </Text>
              </View>

              <View style={globalStyles.dashboardCard}>
                <Text style={globalStyles.dashboardCardTitle}>Ulepszenia</Text>
                <Text style={globalStyles.dashboardCardText}>
                  Zobacz możliwe propozycje modernizacji.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <DummyBottomNav active="home" />
    </View>
  );
}