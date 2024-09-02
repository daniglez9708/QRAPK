import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { IconButton, Card, Divider, Dialog, Portal, Button, PaperProvider } from 'react-native-paper';
import { fetchProductById, addSaleWithProducts, deleteTable, getTableInfo, createTables } from '../api/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScannedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const productImage = require('../../assets/images/productos/frijoles.png');

const ScannedDataScreen = () => {
  const { scannedData } = useLocalSearchParams<{ scannedData: string }>();
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    createTables();
    const loadStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('scannedItems');
        if (storedData) {
          setScannedItems(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    const storeScannedData = async (data: ScannedItem) => {
      try {
        const storedData = await AsyncStorage.getItem('scannedItems');
        const scannedDataList: ScannedItem[] = storedData ? JSON.parse(storedData) : [];
        scannedDataList.push(data);
        await AsyncStorage.setItem('scannedItems', JSON.stringify(scannedDataList));
      } catch (error) {
        console.error('Error storing scannedData:', error);
      }
    };

    const fetchAndStoreProduct = async (id: number) => {
      try {
        const fetchedData = await fetchProductById(id);
        if (fetchedData) {
          const productData: ScannedItem = {
            id: fetchedData.id,
            name: fetchedData.name,
            price: fetchedData.price,
            quantity: 1 // Asignar una cantidad inicial
          };
          setScannedItems((prevItems) => [...prevItems, productData]);
          storeScannedData(productData);
        } else {
          console.error('Fetched data is null');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    if (scannedData) {
      try {
        const { id } = JSON.parse(scannedData);
        fetchAndStoreProduct(id);
      } catch (error) {
        console.error('Error parsing scannedData:', error);
      }
    }
  }, [scannedData]);

  const handleRescan = () => {
    router.push('/(tabs)');
  };

  const handleClearData = async () => {
    try {
      const total = scannedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const products = scannedItems.map(item => ({ product_id: item.id, quantity: item.quantity }));
      const date = new Date().toISOString(); // Obtener la fecha actual en formato ISO
      await addSaleWithProducts(date, total, products);
      await AsyncStorage.clear();
      setVisible(false); // Ocultar el diálogo después de aceptar
      ToastAndroid.show('Venta realizada con éxito!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const handleDecreaseQuantity = (id: number) => {
    setScannedItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      );
      AsyncStorage.setItem('scannedItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const handleIncreaseQuantity = (id: number) => {
    setScannedItems((prevItems) => {
      const updatedItems = prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      AsyncStorage.setItem('scannedItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  return (
    <PaperProvider>
      <View style={styles.container}>
        {scannedItems.length > 0 ? (
          <>
            <FlatList
              data={scannedItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <View style={styles.dataContainer}>
                    <Image source={productImage} style={styles.image} />
                    <View style={styles.textContainer}>
                      <Text style={styles.dataText}>Name: {item.name}</Text>
                      <Text style={styles.dataText}>Price: ${item.price.toFixed(2)}</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)} style={styles.quantityButton}>
                          <IconButton icon="minus-box" size={20} iconColor="#4f95e1" />
                        </TouchableOpacity>
                        <Text style={styles.dataText}>Cantidad: {item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id)} style={styles.quantityButton}>
                          <IconButton icon="plus-box" size={20} iconColor="#183762" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              )}
            />
            <Divider />
            <Text style={styles.total}>Total: ${scannedItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</Text>
            <Button onPress={handleRescan}>Volver a escanear</Button>
            <Button onPress={showDialog}>Aceptar venta</Button>
          </>
        ) : (
          <Text style={styles.errorText}>No data received</Text>
        )}
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Confirmación</Dialog.Title>
            <Dialog.Content>
              <Text>¿Está seguro de que desea aceptar la venta?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancelar</Button>
              <Button onPress={handleClearData}>Aceptar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginVertical: 16,
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#102341',
  },
  dataContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dataText: {
    fontSize: 16,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 40,
    marginHorizontal: 8,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#102341',
  },
});

export default ScannedDataScreen;