import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Resetowanie danych",
      "Czy na pewno chcesz usunąć pseudonim i wrócić do konfiguracji?",
      [
        { text: "Anuluj", style: "cancel" },
        { 
          text: "Tak", 
          onPress: async () => {
            await AsyncStorage.removeItem('username');
            router.replace('/setup');
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ustawienia</Text>
      
      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Text style={styles.optionText}>Zmień pseudonim / Wyloguj</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>Wersja aplikacji: 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7E84A3', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 40, marginBottom: 30 },
  option: { backgroundColor: '#A52A2A', padding: 15, borderRadius: 10, marginBottom: 10 },
  optionText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  info: { marginTop: 'auto', marginBottom: 20, alignItems: 'center' },
  infoText: { color: '#ccc', fontSize: 12 }
});