import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';

//import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6a51ae" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="screen/admin_product" options={{ title: 'Admin Product' }} />
        <Stack.Screen name="screen/admin_ventas" options={{ title: 'Admin Ventas' }} />
        <Stack.Screen name="screen/form_product" options={{ title: 'Form Product' }} />
        <Stack.Screen name="screen/home" options={{ title: 'Home' }} />
        <Stack.Screen name="screen/reporte_ventas" options={{ title: 'Reporte Ventas' }} />
        <Stack.Screen name="screen/test" options={{ title: 'Test' }} />
        <Stack.Screen name="screen/venta_detalles" options={{ title: 'Venta Detalles' }} />
      </Stack>
    </>
  );
}