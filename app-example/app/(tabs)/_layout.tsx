import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#A52A2A', height: 70 },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#cccccc',
    }}>
      <Tabs.Screen name="components" options={{ 
        title: 'Części',
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="cart" size={28} color={color} /> 
      }} />
      <Tabs.Screen name="threed" options={{ 
        title: '3D',
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="cube-outline" size={28} color={color} /> 
      }} />
      <Tabs.Screen name="index" options={{ 
        title: 'Główny',
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="arrow-up-circle" size={40} color={color} /> 
      }} />
      <Tabs.Screen name="configs" options={{ 
        title: 'Zapisane',
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="monitor-cellphone" size={28} color={color} /> 
      }} />
      <Tabs.Screen name="settings" options={{ 
        title: 'Profil',
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="account" size={28} color={color} /> 
      }} />
    </Tabs>
  );
}