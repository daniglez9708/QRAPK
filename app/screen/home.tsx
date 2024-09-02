//i need a page that will display total of the sales and the total of the expenses

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SalesAndExpensesPage: React.FC = () => {
  const [sales, setSales] = useState<number[]>([]);
  const [expenses, setExpenses] = useState<number[]>([]);

  useEffect(() => {
    // Simulación de obtención de datos
    const fetchSales = async () => {
      // Aquí iría la lógica para obtener los datos de ventas
      const salesData = [100, 200, 300]; // Datos simulados
      setSales(salesData);
    };

    const fetchExpenses = async () => {
      // Aquí iría la lógica para obtener los datos de gastos
      const expensesData = [50, 150, 100]; // Datos simulados
      setExpenses(expensesData);
    };

    fetchSales();
    fetchExpenses();
  }, []);

  const totalSales = sales.reduce((acc, sale) => acc + sale, 0);
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Resumen Financiero</Text>
      <Text style={styles.text}>Total de Ventas: ${totalSales}</Text>
      <Text style={styles.text}>Total de Gastos: ${totalExpenses}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});

export default SalesAndExpensesPage;
