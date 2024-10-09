import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Button, Alert, Platform } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { IconButton } from 'react-native-paper';
import { getProducts, getUserTenantId, Product } from '../api/database';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../api/supabaseConfig';
import QRCode from 'react-native-qrcode-svg';
import ReusableTable from '@/components/ReusableTable';
//import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Print from 'expo-print';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';

interface QRCodeComponentProps {
  value: string;
  onGenerated: (dataUrl: string) => void;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ value, onGenerated }) => {
  useEffect(() => {
    const qrCodeRef = {
      toDataURL: (callback: (dataUrl: string) => void) => {
        const qrCode = (
          <QRCode
            value={value}
            size={100}
            getRef={(c) => {
              if (c) {
                c.toDataURL((dataUrl: string) => {
                  callback(dataUrl);
                });
              }
            }}
          />
        );
      }
    };

    qrCodeRef.toDataURL((dataUrl) => {
      onGenerated(dataUrl);
    });
  }, [value, onGenerated]);

  return null;
};

const AdminProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);

  const fetchTenantId = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      const tenantId = await getUserTenantId(session.user.email);
      setTenantId(tenantId);
    }
  }, []);

  useEffect(() => {
    fetchTenantId();
  }, [fetchTenantId]);

  useFocusEffect(
    useCallback(() => {
      fetchTenantId();
    }, [fetchTenantId])
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (tenantId !== null) {
          const productsFromDB = await getProducts(tenantId);
          setProducts(productsFromDB);
          setFilteredProducts(productsFromDB);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [tenantId]);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  useEffect(() => {
    if (Object.keys(qrCodes).length === products.length && products.length > 0) {
      setQrGenerated(true);
    }
  }, [qrCodes, products]);

  const columns = [
    { title: 'Nombre', key: 'name' },
    { title: 'Precio', key: 'price', numeric: true },
    { title: 'Acciones', key: 'actions', numeric: true },
  ];

  const data = filteredProducts.map(product => ({
    ...product,
    price: product.price != null ? `$${product.price.toFixed(2)}` : 'N/A',
    actions: (
      <View style={styles.actionButtons}>
        <IconButton
          icon="pencil"
          iconColor="black"
          onPress={() => router.push({ pathname: '/screen/form_product', params: { productId: product.id } })}
        />
        <IconButton
          icon="eye"
          iconColor="black"
          onPress={() => router.push({ pathname: '/screen/product_detail', params: { productId: product.id } })}
        />
      </View>
    ),
  }));

  const rowStyle = (item: Product) => { 
    return item.stock < 10 ? styles.lowStockRow : null;
  };

  const handleQRCodeGenerated = (productId: string, dataUrl: string) => {
    setQrCodes((prevQrCodes) => ({
      ...prevQrCodes,
      [productId]: dataUrl,
    }));
  };

  const GeneratePDF = async () => {
    try {
      console.log('Iniciando generación de PDF...');
      
      // Definir el contenido HTML
      const htmlContent = `
        <h1>Hola, mundo!</h1>
        <p>Este es un PDF generado a partir de HTML.</p>
        <p>Página en blanco</p>
      `;
      
      // Generar el PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('PDF creado en: ' + uri);
      
      // Solicitar permisos de almacenamiento en Android
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se requieren permisos de almacenamiento para guardar el archivo.');
          return;
        }
      }
      
      // Definir una nueva ubicación en la carpeta de descargas
      const downloadDir = `${FileSystem.documentDirectory}Download/`;
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      const newUri = `${downloadDir}downloaded-sample.pdf`;
      
      // Copiar el archivo a la nueva ubicación
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });
      console.log('PDF movido a: ' + newUri);
  
      // Crear un asset y guardarlo en la carpeta de descargas
      const asset = await MediaLibrary.createAssetAsync(newUri);
      const album = await MediaLibrary.getAlbumAsync('Download');
      
      if (!album) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      
      console.log('PDF guardado correctamente en la carpeta de descargas');
      Alert.alert('PDF generado', 'PDF guardado en la carpeta de descargas');
      
      // Abrir el PDF
      if (Platform.OS === 'android') {
        const cUri = await FileSystem.getContentUriAsync(asset.uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri,
          flags: 1,
          type: 'application/pdf',
        });
      } else {
        Alert.alert('Abrir PDF no está soportado en esta plataforma.');
      }
      
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      Alert.alert('Error', 'Hubo un problema al generar el PDF. Inténtalo de nuevo.');
    }
  };
  return (
    <TouchableWithoutFeedback onPress={() => { setIsSearchVisible(false); Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Productos</Text>
          <View style={styles.headerIcons}>
            {isSearchVisible ? (
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                onBlur={() => setIsSearchVisible(false)}
                autoFocus
              />
            ) : (
              <IconButton
                icon="magnify"
                iconColor="white"
                onPress={() => setIsSearchVisible(true)}
              />
            )}
            <IconButton
              icon="plus"
              iconColor="white"
              onPress={() => router.push('/screen/form_product')}
            />
          </View>
        </View>
        <ReusableTable columns={columns} data={data} rowStyle={rowStyle} />
        <Button title="Generar PDF con productos" onPress={GeneratePDF} />
        {products.map(product => (
          <QRCodeComponent
            key={product.id}
            value={JSON.stringify({ id: product.id })}
            onGenerated={(dataUrl) => handleQRCodeGenerated(product.id.toString(), dataUrl)}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#164076',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
    width: 150,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  lowStockRow: {
    backgroundColor: '#ffcccc',
  },
});

export default AdminProduct;