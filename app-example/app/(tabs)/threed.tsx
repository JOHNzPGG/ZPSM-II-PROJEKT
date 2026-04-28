import { StyleSheet, Text, View } from 'react-native';

export default function ThreeDScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Hello World 3D</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7E84A3' },
  box: { padding: 20, borderWidth: 2, borderColor: 'white', borderStyle: 'dashed' },
  text: { fontSize: 20, color: 'white' }
});