import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Avatar, Button, Paragraph } from 'react-native-paper';
import { sumSalesTotal, getMostSoldProduct, getSalesDifferenceWithPreviousWeek } from '../api/database';
import { useRouter } from 'expo-router';
import SalesChart from '../../components/Grafico_dash';
import { LinearGradient } from 'expo-linear-gradient';

const SalesAndExpensesPage: React.FC = () => {
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [mostSoldProduct, setMostSoldProduct] = useState<{ name: string, quantity: number, price: number } | null>(null);
  const [salesDifference, setSalesDifference] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const total = await sumSalesTotal();
        setTotalSales(total);
      } catch (err) {
        setError('Error al sumar los totales de ventas');
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

    fetchTotalSales();
    fetchMostSoldProduct();
    fetchSalesDifference();
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
              <Paragraph style={styles.text1}>Productos vendidos {totalSales}</Paragraph>
            </View>
            <Paragraph style={styles.text}>Total de Ventas: ${totalSales}</Paragraph>
          </View>
        </LinearGradient>
        
        <View style={styles.row}>
          <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={[styles.customCard, { width: '48%' }]}>
            <View style={styles.cardTitleContainer}>
              <Avatar.Icon icon="star" size={25} style={styles.icon} color="#102341" />
              <Text style={styles.cardTitle}>Top Ventas</Text>
            </View>
            <View style={styles.cardContent}>
              <Paragraph style={styles.text}>
                {mostSoldProduct ? `${mostSoldProduct.name} : ${mostSoldProduct.quantity}\nImporte : $${mostSoldProduct.price * mostSoldProduct.quantity}` : ''}
              </Paragraph>
            </View>
          </LinearGradient>
          <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={[styles.customCard, { width: '48%' }]}>
            <View style={styles.cardTitleContainer}>
              <Avatar.Icon icon="trending-up" size={25} style={styles.icon} color="#102341" />
              <Text style={styles.cardTitle}>Incremento</Text>
            </View>
            <View style={styles.cardContent}>
              <Paragraph style={styles.text}>
                {salesDifference !== null ? `Balance con la semana anterior: ${salesDifference > 0 ? '+' : ''}${salesDifference}` : 'Calculando...'}
              </Paragraph>
            </View>
          </LinearGradient>
        </View>
      </View>
      <Text style={styles.header2}>Ventas semanales</Text>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={() => router.push('/(tabs)')} style={styles.button}>
          Vender
        </Button>
        <Button mode="contained" onPress={() => router.push('/screen/admin_product')} style={styles.button}>
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
    fontSize: 16,
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
    color: '#F5F5DC', // Cambiar color del texto
  },
  icon: {
    marginRight: 0,
    backgroundColor: '#F5F5DC', // Color de fondo del icono
  }
});

export default SalesAndExpensesPage;