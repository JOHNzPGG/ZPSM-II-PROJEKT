import { ACTIVE_USER_KEY, LEGACY_USERNAME_KEY } from '../../constants/storageKeys';
 import { AppThemeProvider, useAppTheme } from '../../contexts/AppThemeContext';

 export default function TabsLayout() {
   return (
     <Stack screenOptions={{ headerShown: false }}>
       <Stack.Screen name="index" />
     </Stack>
   );
 }