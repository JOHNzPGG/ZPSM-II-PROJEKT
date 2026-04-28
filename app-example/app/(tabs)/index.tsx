import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [user, setUser] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username').then(v => setUser(v || 'Gość'));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Cześć {user}!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7E84A3' },
  header: {
    backgroundColor: '#D1D1D1',
    marginHorizontal: 30,
    marginTop: 60,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    shadowOpacity: 0.2,
  },
  headerText: { fontSize: 18, fontWeight: 'bold' }
});