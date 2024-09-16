import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Button,Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getProducts, Product } from '../api/database'; // Asegúrate de ajustar la ruta según tu estructura de proyecto
import { router } from 'expo-router';
import ReusableTable from '@/components/ReusableTable'; // Ajusta la ruta según tu estructura de proyecto
import * as FileSystem from 'expo-file-system';
import { PDFDocument, PDFPage } from 'react-native-pdf-lib';

const AdminProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsFromDB = await getProducts();
        setProducts(productsFromDB);
        setFilteredProducts(productsFromDB);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

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

  const GeneratePDF = () => {
    const createPDF = async () => {
      try {
        // Crea una nueva página PDF
        const page1 = PDFPage
          .create()
          .setMediaBox(200, 200)
          .drawText('Este es un PDF generado dinámicamente', {
            x: 5,
            y: 150,
            color: '#007386',
          })
          .drawRectangle({
            x: 5,
            y: 5,
            width: 190,
            height: 190,
            color: '#FF99CC',
          })
          .drawText('¡Texto dentro de un cuadro!', {
            x: 50,
            y: 75,
            color: '#FFFFFF',
          });
  
        // Crea un documento PDF con la página generada
        const pdfPath = `${FileSystem.documentDirectory}generated.pdf`;
        const pdfDoc = PDFDocument.create(pdfPath)
          .addPages([page1]);
  
        // Escribe el PDF en el sistema de archivos
        await pdfDoc.write();
  
        Alert.alert('PDF generado', `PDF guardado en: ${pdfPath}`);
        console.log(`PDF guardado en: ${pdfPath}`);
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };
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
    backgroundColor: '#2878cf',
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
    backgroundColor: '#ffcccc', // Color rojo claro
  },
});

export default AdminProduct;