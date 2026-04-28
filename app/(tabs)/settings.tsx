import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../constants/globalStyles';

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
    <View style={[globalStyles.container, { padding: 20 }]}>
      <Text style={globalStyles.headerTitle}>Ustawienia</Text>
      
      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleLogout}>
        <Text style={globalStyles.buttonText}>Zmień pseudonim / Wyloguj</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 'auto', marginBottom: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.textLight, fontSize: 12 }}>Wersja aplikacji: 1.0.0</Text>
      </View>
    </View>
  );
}