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

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isScanned) {
      setIsScanned(true);
      try {
        const parsedData = JSON.parse(data); // Parsear los datos escaneados
        setScannedData(data);
  
        // Navegar a la otra vista con los datos escaneados
        router.push({
          pathname: '/screen/test',
          params: { scannedData: JSON.stringify(parsedData) } // Enviar los datos parseados como cadena JSON
        });
      } catch (error) {
        console.error('Error parsing QR data:', error);
      }
    }
  };

  const handleRescan = async () => {
    setIsScanned(false);
    setScannedData(null);
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "OverView",
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