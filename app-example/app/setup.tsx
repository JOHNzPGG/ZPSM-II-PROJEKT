import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SetupScreen() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Błąd', 'Pseudonim musi mieć co najmniej 3 znaki.');
      return;
    }
    await AsyncStorage.setItem('username', name);
    // Przekierowanie do głównego layoutu tabsów
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PC Upgrade Advisor</Text>
      <Text style={styles.subtitle}>Podaj swój pseudonim, aby zacząć:</Text>
      <TextInput
        style={styles.input}
        placeholder="Np. MasterRace99"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>ZAPISZ I KONTYNUUJ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7E84A3', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#eee', marginBottom: 20 },
  input: { backgroundColor: 'white', width: '100%', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#A52A2A', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});