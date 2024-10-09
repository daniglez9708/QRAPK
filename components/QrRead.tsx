import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { Overlay } from './Overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanned, setIsScanned] = useState(false); // Estado para controlar si el QR ya ha sido escaneado
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!hasPermission?.granted) {
        await requestPermission();
      }
    })();
  }, [hasPermission]);

  useEffect(() => {
    (async () => {
      const storedData = await AsyncStorage.getItem('scannedData');
      if (storedData) {
        setScannedData(storedData);
      }
    })();
  }, []);

  if (!hasPermission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!hasPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!isScanned) {
      setIsScanned(true);
      try {
        const parsedData = JSON.parse(data); // Parsear los datos escaneados
        setScannedData(data);

        if (parsedData.link === 'tenant') {
          // Manejar el tenant_id
          const tenantId = parsedData.tenant_id;
          await AsyncStorage.setItem('tenantId', tenantId);

          // Navegar a la vista de vinculación de empleados
          /*router.push({
            pathname: '/screen/employeeLink',
            params: { tenantId }
          });*/
        } if (parsedData.id) {
          // Manejar el producto
          router.push({
            pathname: '/screen/test',
            params: { scannedData: JSON.stringify(parsedData) } // Enviar los datos del producto como cadena JSON
          });
        } else {
          console.error('Tipo de QR desconocido:', parsedData);
        }
      } catch (error) {
        console.error('Error parsing QR data:', error);
      }
    }
  };

  const handleRescan = async () => {
    setIsScanned(false);
    setScannedData(null);
  };
  const handleNavigateToTest = () => {
    router.push('/screen/test');
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Vender Producto",
          headerShown: false
        }}
      />
      
      {!isScanned ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing='back'
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : (
        <View style={styles.container}>
          <Text style={styles.scannedText}>QR Code scanned successfully!</Text>
          <TouchableOpacity style={styles.button} onPress={handleRescan}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
      <Overlay />
      <TouchableOpacity style={styles.navigateButton} onPress={handleNavigateToTest}>
        <Text style={styles.buttonText}>Ir al carrito</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  navigateButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    transform: [{ translateX: -50 }],
    backgroundColor: '#183762',
    borderRadius: 5,
  },
  scannedText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});