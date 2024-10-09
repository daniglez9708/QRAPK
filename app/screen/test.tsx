import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { IconButton, Card, Divider, Dialog, Portal, Button, PaperProvider, Snackbar } from 'react-native-paper';
import { fetchProductById, addSaleWithProducts, deleteTable, getTableInfo, createTables, getUserTenantId } from '../api/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { supabase } from '../api/supabaseConfig';

interface ScannedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string | null; // Allow null as a valid value
}

const ScannedDataScreen = () => {
  const { scannedData } = useLocalSearchParams<{ scannedData: string }>();
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tenantId, setTenantId] = useState<number | null>(null);
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    getTableInfo('sales');
    const fetchTenantId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const tenantId = await getUserTenantId(session.user.email);
        setTenantId(tenantId);
      }
    };

    fetchTenantId();
  }, []);

  useEffect(() => {
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
        setScannedItems(scannedDataList); // Actualizar el estado después de almacenar los datos
      } catch (error) {
        console.error('Error storing scannedData:', error);
      }
    };

    const fetchAndStoreProduct = async (id: number) => {
      try {
        if (tenantId !== null) {
          const fetchedData = await fetchProductById(id, tenantId);
          if (fetchedData) {
            if (fetchedData.stock <= 0) {
              setSnackbarMessage(`El producto ${fetchedData.name} no tiene stock disponible`);
              setAlertVisible(true); // Mostrar el diálogo de alerta
              return;
            }

            if (fetchedData.stock < 20) {
              setSnackbarMessage(`El producto ${fetchedData.name} está bajo de stock. Cantidad disponible: ${fetchedData.stock}`);
              setSnackbarVisible(true); // Mostrar el snackbar
            }

            const productData: ScannedItem = {
              id: fetchedData.id,
              name: fetchedData.name,
              price: fetchedData.price,
              stock: fetchedData.stock,
              quantity: 1, // Asignar una cantidad inicial
              image: fetchedData.image, // Asignar la URL de la imagen
            };

            // Verificar si el producto ya está en la lista
            const isProductAlreadyScanned = scannedItems.some(item => item.id === productData.id);
            if (!isProductAlreadyScanned) {
              setScannedItems((prevItems) => [...prevItems, productData]);
              storeScannedData(productData);
            } else {
              console.log('Producto ya escaneado:', productData.id);
            }
          } else {
            console.error('Fetched data is null');
          }
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
  }, [scannedData, tenantId]); // Eliminar scannedItems como dependencia para evitar recargas innecesarias

  const handleRescan = () => {
    setAlertVisible(false);
    router.push('/(tabs)/two');
  };

  const handleClearData = async () => {
    try {
      const total = scannedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const products = scannedItems.map(item => ({ product_id: item.id, quantity: item.quantity }));
      const date = new Date().toISOString(); // Obtener la fecha actual en formato ISO
      if (tenantId === null) {
        throw new Error('Tenant ID is null');
      }
      await addSaleWithProducts(date, total, tenantId, products);
      await AsyncStorage.clear();
      setVisible(false); // Ocultar el diálogo después de aceptar

      setSnackbarMessage('Venta realizada con éxito');
      setSnackbarVisible(true);

      router.push('/(tabs)'); // Redirigir a la pantalla principal
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

  const handleIncreaseQuantity = (id: number, stock: number) => {
    setScannedItems((prevItems) => {
      const updatedItems = prevItems.map(item =>
        item.id === id && item.quantity < stock ? { ...item, quantity: item.quantity + 1 } : item
      );
      AsyncStorage.setItem('scannedItems', JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const handleRemoveItem = (id: number) => {
    setItemToDelete(id);
    setDeleteVisible(true);
  };

  const confirmRemoveItem = async () => {
    if (itemToDelete !== null) {
      const updatedItems = scannedItems.filter(item => item.id !== itemToDelete);
      setScannedItems(updatedItems);
      await AsyncStorage.setItem('scannedItems', JSON.stringify(updatedItems));
      setDeleteVisible(false);
      setItemToDelete(null);
    }
  };
  
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const hideDeleteDialog = () => setDeleteVisible(false);
  const handleNavigateToTest = () => {
    router.push('/(tabs)/two');
  };

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
                    <Image source={{ uri: item.image ?? '' }} style={styles.image} />
                    <View style={styles.textContainer}>
                      <Text style={styles.dataText}>Name: {item.name}</Text>
                      <Text style={styles.dataText}>Price: ${item.price.toFixed(2)}</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)} style={styles.quantityButton}>
                          <IconButton icon="minus-box" size={20} iconColor="#4f95e1" />
                        </TouchableOpacity>
                        <Text style={styles.dataText}>Cantidad: {item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id,item.stock)} style={styles.quantityButton}>
                          <IconButton icon="plus-box" size={20} iconColor="#183762" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
                        <IconButton icon="delete" size={20} iconColor="#ff0000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              )}
            />
            <Divider />
            <Text style={styles.total}>Total: ${scannedItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</Text>
            <View style={styles.buttonContainer}>
              <Button onPress={handleRescan} icon="qrcode" style={[styles.button, styles.blueButton]} labelStyle={styles.buttonText}>
                Volver a escanear
              </Button>
              <Button onPress={showDialog} icon="check" style={[styles.button, styles.blueButton]} labelStyle={styles.buttonText}>
                Aceptar venta
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.container1}>
              <Text style={styles.infoText}>No hay productos escaneados. Por favor, escanee un producto.</Text>
              <TouchableOpacity style={styles.navigateButton} onPress={handleNavigateToTest}>
                <Text style={styles.buttonText}>Escanear Producto</Text>
              </TouchableOpacity>
          </View>
        )}
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Confirmación</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>¿Está seguro de que desea aceptar la venta?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog} style={styles.dialogButton} labelStyle={styles.dialogButtonText} icon="close">
                Cancelar
              </Button>
              <Button onPress={handleClearData} style={styles.dialogButton} labelStyle={styles.dialogButtonText} icon="check">
                Aceptar
              </Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={deleteVisible} onDismiss={hideDeleteDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Confirmación</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>¿Está seguro de que desea eliminar este producto?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog} style={styles.dialogButton} labelStyle={styles.dialogButtonText} icon="close">
                Cancelar
              </Button>
              <Button onPress={confirmRemoveItem} style={styles.dialogButton} labelStyle={styles.dialogButtonText} icon="check">
                Eliminar
              </Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={alertVisible} onDismiss={() => setAlertVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Alerta</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>{snackbarMessage}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => handleRescan()} style={styles.dialogButton} labelStyle={styles.dialogButtonText} icon="close">
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => {
            setSnackbarVisible(false);
            },
            textColor: 'white',
          }}
          style={styles.snackbarContainer}
        >
          <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
        </Snackbar>
        <Toast />
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
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  snackbarContainer: {
    backgroundColor: '#b71c1c', // Rojo oscuro
  },
  navigateButton: {
    marginTop: 20, // Ajusta este valor para mover el botón más abajo
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#183762',
    borderRadius: 5,
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
  removeButton: {
    marginLeft: 16,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#102341',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  blueButton: {
    backgroundColor: '#2878cf',
  },
  buttonText: {
    color: 'white',
  },
  dialog: {
    backgroundColor: 'white',
  },
  dialogTitle: {
    color: '#2878cf',
  },
  dialogText: {
    color: '#2878cf',
  },
  dialogButton: {
    backgroundColor: '#2878cf',
    marginHorizontal: 8,
  },
  dialogButtonText: {
    color: 'white',
  },
});

export default ScannedDataScreen;