import { StyleSheet, Text, View } from 'react-native';

export default function ComponentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lista Podzespołów</Text>
      <Text style={styles.subtext}>Tutaj znajdziesz procesory, karty graficzne itd.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7E84A3' },
  text: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtext: { color: '#ddd', marginTop: 10 }
});