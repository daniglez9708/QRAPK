import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getTotalSalesByCurrentWeek } from '../app/api/database';

interface SalesChartProps {
  tenantId: number;
}

const SalesChart: React.FC<SalesChartProps> = ({ tenantId }) => {
  const [salesData, setSalesData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [labels, setLabels] = useState<string[]>(["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]);

  const fetchTotalSalesByCurrentWeek = async (tenantId: number) => {
    try {
      const totalSalesByCurrentWeek = await getTotalSalesByCurrentWeek(tenantId);
      const sales = [0, 0, 0, 0, 0, 0, 0]; // Inicializa las ventas en cero para cada día de la semana

      const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Mapea los días de la semana: Domingo -> 6, Lunes -> 0, ..., Sábado -> 5

      totalSalesByCurrentWeek.forEach(sale => {
        const date = new Date(sale.date);
        const dayOfWeek = date.getDay(); // Obtiene el día de la semana
        sales[dayOfWeek] = sale.total;
      });
  
      setSalesData(sales);
    } catch (error) {
      console.error('Error al obtener el total de ventas de la semana actual:', error);
    }
  };

  useEffect(() => {
    fetchTotalSalesByCurrentWeek(tenantId);
  }, [tenantId]);

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: labels, // Usa los labels de los días de la semana
          datasets: [
            {
              data: salesData, // Datos de las ventas
              color: (opacity = 1) => `rgba(22, 64, 118, ${opacity})`, // Color de la línea
              strokeWidth: 2, // Ancho de la línea
            },
          ],
        }}
        width={Dimensions.get("window").width - 40} // Ancho del gráfico
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#000",
          backgroundGradientFrom: "#fff", // Fondo blanco
          backgroundGradientTo: "#c2d9f5", // Fondo blanco
          decimalPlaces: 0, // Sin decimales
          color: (opacity = 1) => `rgba(22, 64, 118, ${opacity})`, // Color de la línea
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
            paddingRight: 20, // Aumentar el espacio a la derecha
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#183762", // Color de los círculos
          },
          fillShadowGradient: "#183762", // Color del área debajo de la línea
          fillShadowGradientOpacity: 0.4, // Opacidad del área debajo de la línea
        }}
        bezier
        formatXLabel={(label) => label.replace(/,/g, '')} // Eliminar comas de los números del eje X
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'transparent', // Fondo transparente
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SalesChart;