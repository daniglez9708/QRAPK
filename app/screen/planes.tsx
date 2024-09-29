import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, Text, Button, Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import PaymentModal from '../../components/VentanaEmergente'; // Importa el nuevo componente

const PaymentPlansPage: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const showModal = (plan: any) => {
    setSelectedPlan(plan);
    setVisible(true);
  };
  const hideModal = () => setVisible(false);

  const plans = [
    {
      name: 'Plan Básico',
      price: '$10',
      features: ['Acceso ilimitado a las ventas', 'Registro de hasta 10 productos', 'Vender 2 productos por venta'],
    },
    {
      name: 'Plan Estándar',
      price: '$20/mes',
      features: ['Característica 1', 'Característica 2', 'Característica 3', 'Característica 4'],
    },
    {
      name: 'Plan Premium',
      price: '$30/mes',
      features: ['Característica 1', 'Característica 2', 'Característica 3', 'Característica 4', 'Característica 5'],
    },
  ];

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Selecciona tu Plan de Pago</Title>
        {plans.map((plan, index) => (
          <BlurView key={index} style={styles.blurView} intensity={100} tint="light">
            <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={styles.gradient}>
              <View style={styles.cardContent}>
                <Title style={styles.planTitle}>{plan.name}</Title>
                <Paragraph style={styles.planPrice}>{plan.price}</Paragraph>
                {plan.features.map((feature, idx) => (
                  <Text key={idx} style={styles.feature}>{feature}</Text>
                ))}
                <Button mode="contained" onPress={() => showModal(plan)} style={styles.button}>
                  <Text style={styles.buttonText}>Seleccionar</Text>
                </Button>
              </View>
            </LinearGradient>
          </BlurView>
        ))}
      </ScrollView>
      <PaymentModal visible={visible} hideModal={hideModal} plan={selectedPlan} />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: '#183762',
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: '95%', // Ajusta el ancho de la tarjeta
  },
  blurView: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    width: '95%', // Ajusta el ancho del BlurView para que coincida con el gradiente
  },
  cardContent: {
    backgroundColor: 'transparent', // Fondo transparente para ver el blur
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  planTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: '#F5F5DC',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 18,
    marginBottom: 8,
    color: '#F5F5DC',
    textAlign: 'center'
  },
  feature: {
    fontSize: 16,
    color: '#F5F5DC',
    marginBottom: 4,
    textAlign: 'center'
  },
  button: {
    marginTop: 16,
    backgroundColor: '#F5F5DC',
  },
  buttonText: {
    color: '#183762',
  },
});

export default PaymentPlansPage;