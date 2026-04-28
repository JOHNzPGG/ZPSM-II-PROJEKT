import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { colors, globalStyles } from '../../constants/globalStyles';

// Przykładowe dane podzespołów (wyeksportowane do użytku w configs.tsx)
export const MOCK_COMPONENTS = [
  { id: '1', name: 'NVIDIA RTX 4070', category: 'Grafika', price: '2999 zł', icon: 'expansion-card' },
  { id: '2', name: 'Intel Core i7-13700K', category: 'Procesor', price: '1850 zł', icon: 'cpu-64-bit' },
  { id: '3', name: 'Samsung 980 Pro 1TB', category: 'Dysk SSD', price: '450 zł', icon: 'harddisk' },
  { id: '4', name: 'ASUS ROG STRIX B760', category: 'Płyta Główna', price: '900 zł', icon: 'motherboard' },
];

export default function ComponentsScreen() {
  return (
    // ZMIANA: Dodajemy globalStyles.safeArea do tablicy stylów.
    // To sprawi, że cała zawartość ekranu zjedzie poniżej paska statusu.
    <View style={[globalStyles.container, globalStyles.safeArea]}>
      
      {/* ZMIANA: Używamy globalStyles.headerTitle.
          Ta klasa (z poprawionej wersji z wczoraj) ma biały kolor
          i wyśrodkowanie, ale nie ma sztywnego marginTop, bo załatwia to safeArea. */}
      <Text style={globalStyles.headerTitle}>Baza Podzespołów</Text>
      
      <FlatList
        data={MOCK_COMPONENTS}
        keyExtractor={(item) => item.id}
        // Używamy stylowania z globalStyles i kolorów ze stałych
        renderItem={({ item }) => (
          <View style={[globalStyles.card, { marginHorizontal: 20 }]}>
            <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primary} />
            <Text style={{ marginLeft: 15, fontWeight: '500', color: colors.textDark }}>
              {item.name}
            </Text>
          </View>
        )}
        // Opcjonalnie: padding na dole, żeby ostatni element nie był za blisko navbara
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}