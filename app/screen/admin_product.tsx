import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getProducts, Product } from '../api/database'; // Asegúrate de ajustar la ruta según tu estructura de proyecto
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import ReusableTable from '@/components/ReusableTable'; // Ajusta la ruta según tu estructura de proyecto

const AdminProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const navigation = useNavigation();

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
    price: `$${product.price.toFixed(2)}`,
    actions: (
      <IconButton
        icon="pencil"
        iconColor="black"
        onPress={() => router.push({ pathname: '/screen/form_product', params: { productId: product.id.toString() } })}
      />
    ),
  }));

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
        <ReusableTable columns={columns} data={data} />
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
});

export default AdminProduct;