import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Avatar, Button, Paragraph } from 'react-native-paper';
import { sumDailySalesTotal, getMostSoldProduct, getSalesDifferenceWithPreviousWeek, Product, getLowStockProducts } from '../api/database';
import { useRouter } from 'expo-router';
import SalesChart from '../../components/Grafico_dash';
import { LinearGradient } from 'expo-linear-gradient';
import { User as SupabaseUser } from '@supabase/supabase-js'; // Import the SupabaseUser type
import { supabase } from '../api/supabaseConfig';

const SalesAndExpensesPage: React.FC = () => {
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [mostSoldProduct, setMostSoldProduct] = useState<{ name: string, quantity: number, price: number } | null>(null);
  const [salesDifference, setSalesDifference] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [totalProductsSold, setTotalProductsSold] = useState<number | null>(null); // Nuevo estado
  const router = useRouter();

  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const { totalSum, totalProductsSold } = await sumDailySalesTotal();
        setTotalSales(totalSum);
        setTotalProductsSold(totalProductsSold); // Asegúrate de tener un estado para esto
      } catch (err) {
        setError('Error al sumar los totales de ventas y la cantidad de productos vendidos');
      }
    };

    const fetchMostSoldProduct = async () => {
      try {
        const product = await getMostSoldProduct();
        setMostSoldProduct(product);
      } catch (err) {
        setError('Error al obtener el producto más vendido');
      }
    };

    const fetchSalesDifference = async () => {
      try {
        const difference = await getSalesDifferenceWithPreviousWeek();
        setSalesDifference(difference);
      } catch (err) {
        setError('Error al calcular la diferencia de ventas con la semana anterior');
      }
    };

    const fetchLowStockProducts = async () => {
      try {
        const products = await getLowStockProducts();
        setLowStock(products);
      } catch (err) {
        setError('Error al obtener los productos con poco stock');
      }
    };

    fetchTotalSales();
    fetchMostSoldProduct();
    fetchSalesDifference();
    fetchLowStockProducts();

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={[styles.card1, { height: 'auto', width: '100%' }]}>
          <View style={styles.cardTitleContainer}>
            <Avatar.Icon icon="finance" size={40} style={styles.icon} color="#102341" />
            <Text style={styles.cardTitle}>Ventas diarias</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Paragraph style={styles.text1}>Productos vendidos: {totalProductsSold}</Paragraph>
            </View>
            <Paragraph style={styles.text1}>Total de Ventas: ${totalSales}</Paragraph>
          </View>
        </LinearGradient>
        
        <View style={styles.row}>
          <TouchableOpacity onPress={() => router.push('/screen/admin_ventas')} style={{ width: '48%' }}>
            <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={[styles.customCard, styles.fixedHeightCard]}>
              <View style={styles.cardTitleContainer}>
                <Avatar.Icon icon="star" size={25} style={styles.icon} color="#102341" />
                <Text style={styles.cardTitle}>Top Ventas</Text>
              </View>
              <View style={styles.cardContent}>
                {mostSoldProduct ? (
                  <View>
                    <Text style={styles.productName}>{mostSoldProduct.name}</Text>
                    <Text style={styles.productQuantity}>Cantidad: {mostSoldProduct.quantity}</Text>
                    <Text style={styles.productImporte}>Importe: ${mostSoldProduct.price * mostSoldProduct.quantity}</Text>
                  </View>
                ) : (
                  <Paragraph style={styles.text}>Calculando...</Paragraph>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/screen/admin_product')} style={{ width: '48%' }}>
            <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={[styles.customCard, styles.fixedHeightCard]}>
              <View style={styles.cardTitleContainer}>
                <Avatar.Icon icon="trending-up" size={25} style={styles.icon} color="#102341" />
                <Text style={styles.cardTitle}>Sin Stock</Text>
              </View>
              <View style={styles.cardContent}>
                {lowStock.length > 0 ? (
                  lowStock.slice(0, 3).map(product => (
                    <Paragraph key={product.id} style={styles.text}>
                      {product.name}: {product.stock}
                    </Paragraph>
                  ))
                ) : (
                  <Paragraph style={styles.text}>Calculando...</Paragraph>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.header2}>Ventas semanales</Text>
      <SalesChart />
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={() => router.push('/(tabs)')} style={styles.button}>
          Vender
        </Button>
        <Button mode="contained" onPress={() => router.push('/screen/planes')} style={styles.button}>
          Productos
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  header2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    color: '#102341', // Asegurar que el color sea negro
  },
  customCard: {
    padding: 16, // Ajustar padding
    marginBottom: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  fixedHeightCard: {
    height: 150, // Establecer una altura fija
  },
  transactionsContainer: {
    backgroundColor: 'transparent',
    padding: 8,
    marginBottom: 8,
    width: '100%',
    borderRadius: 8,
    flex: 1, // Permitir que el contenedor de transacciones ocupe el espacio restante
  },
  listItem: {
    backgroundColor: 'transparent',
    marginBottom: 4, // Reducir margen inferior
    borderRadius: 8,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    padding: 8, // Reducir padding
    marginBottom: 8,
    borderRadius: 8,
  },
  card1: {
    justifyContent: 'flex-start',
    padding: 8, // Reducir padding
    marginBottom: 8,
    borderRadius: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#F5F5DC', // Cambiar color del texto
    fontSize: 22,
    marginLeft: 8,
  },
  cardContent: {
    paddingLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8, // Reducir margen inferior
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8, // Reducir margen superior
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#183762',
  },
  header: {
    fontSize: 18, // Reducir tamaño de fuente
    justifyContent: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 8, // Reducir margen inferior
    color: '#F5F5DC',
    flexShrink: 1, // Permitir que el texto se ajuste al tamaño del contenedor
  },
  text: {
    fontSize: 16, // Reducir tamaño de fuente
    marginBottom: 8,
    color: '#F5F5DC', // Cambiar color del texto
  },
  header1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#F5F5DC',
  },
  text1: {
    fontSize: 16, // Reducir tamaño de fuente
    marginLeft: 8,
    marginBottom: 8,
    color: '#F5F5DC', // Cambiar color del texto
  },
  icon: {
    marginRight: 0,
    backgroundColor: '#F5F5DC', // Color de fondo del icono
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#F5F5DC',
  },
  productQuantity: {
    fontSize: 16,
    marginBottom: 4,
    color: '#F5F5DC',
  },
  productImporte: {
    fontSize: 16,
    color: '#F5F5DC',
  },
});

export default SalesAndExpensesPage;