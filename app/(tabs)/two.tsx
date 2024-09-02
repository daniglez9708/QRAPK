import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { sumSalesTotal, getMostSoldProduct } from '../api/database';

const SalesAndExpensesPage: React.FC = () => {
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [mostSoldProduct, setMostSoldProduct] = useState<{ name: string, quantity: number } | null>(null);
  const [expenses, setExpenses] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>(['Bebidas', 'Cigarros', 'Confituras']); // Ejemplo de categorías
  const [error, setError] = useState<string>('');

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

    fetchTotalSales();
    fetchMostSoldProduct();
}, []);
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense, 0);

  return (
    <View style={styles.container}>
      <Card style={[styles.card1, { height: '10%' }]}>
        <Card.Title
          title="Ventas diarias"
          titleVariant="titleLarge"
          titleStyle={{ fontWeight: 'bold', color: '#102341' }} 
          left={(props) => <Avatar.Icon {...props} icon="finance" style={{ backgroundColor: '#183762' }}/>}
        />
        <Card.Content>
          <View style={styles.row}>
            <Paragraph style={styles.text1}>Productos vendidos {totalSales}</Paragraph>
          </View>
          <Paragraph style={styles.text}>Total de Ventas: ${totalSales}</Paragraph>
        </Card.Content>
      </Card>
      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.header}>Producto del dia</Title>
            <Paragraph style={styles.text}>{mostSoldProduct ? `${mostSoldProduct.name} con ${mostSoldProduct.quantity} ventas` : ''}</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.header}>Incremento</Title>
            <Paragraph style={styles.text}>Total de Ventas: ${totalSales}</Paragraph>
          </Card.Content>
        </Card>
      </View>
      {/* Nueva sección para categorías de productos */}
      <Title style={styles.header}>Categorías</Title>
      <ScrollView horizontal>
        <View style={styles.categoriesRow}>
          {categories.map((category, index) => (
            <Card key={index} style={styles.categoryCard}>
              <Card.Content>
                <Paragraph style={styles.text}>{category}</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '45%',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#c2d9f5',
    margin: 8,
  },
  card1: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#c2d9f5',
    margin: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    marginTop: 16,
  },
  categoryCard: {
    width: 200, // Ajusta el ancho según sea necesario
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#c2d9f5',
    margin: 8,
  },
  header: {
    fontSize: 20,
    justifyContent: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#102341',
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
    color: '#183762',
  },
  header1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#f2f7fd',
  },
  text1: {
    fontSize: 18,
    marginLeft: 8,
    color: '#183762',
  },
  icon: {
    marginRight: 0,
  }
});

export default SalesAndExpensesPage;