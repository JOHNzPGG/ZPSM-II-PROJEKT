import { StyleSheet, Text, View } from 'react-native';

export default function ConfigsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Twoje Konfiguracje</Text>
      <View style={styles.emptyState}>
        <Text style={styles.text}>Nie masz jeszcze zapisanych zestawów.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7E84A3', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 40, marginBottom: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#ccc' }
});