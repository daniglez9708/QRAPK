import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Title, Paragraph, Text, Button, Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import PaymentModal from '../../components/VentanaEmergente'; // Importa el nuevo componente

interface Plan {
  name: string;
  price: string;
  features: string[];
  limitations?: string[];
  additionalBenefits?: string[];
}

const { width } = Dimensions.get('window');

const PaymentPlansPage: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const showModal = (plan: any) => {
    setSelectedPlan(plan);
    setVisible(true);
  };
  const hideModal = () => setVisible(false);

  const plans: Plan[] = [
    {
      name: 'Plan Básico',
      price: '$5/mes',
      features: [
        'Escaneo de códigos QR para productos',
        'Registro de ventas diarias',
        'Aviso de bajo stock',
        'Soporte por correo electrónico',
        'Publicidad en la aplicación',
      ],
      limitations: [
        'Máximo de 50 productos registrados',
        'Máximo de 1 dependiente',
        'Sin opción de generar reportes en Excel',
        'Sin copia de seguridad en la nube',
      ],
    },
    {
      name: 'Plan Estándar',
      price: '$15/mes',
      features: [
        'Escaneo de códigos QR para productos',
        'Registro de ventas diarias',
        'Aviso de bajo stock',
        'Generación de reportes en Excel',
        'Soporte por correo electrónico y chat en vivo',
        'Sin publicidad',
      ],
      limitations: [
        'Máximo de 500 productos registrados',
        'Máximo de 5 dependientes',
        'Copia de seguridad en la nube limitada a 1 GB',
      ],
    },
    {
      name: 'Plan Premium',
      price: '$30/mes',
      features: [
        'Escaneo de códigos QR para productos',
        'Registro de ventas diarias',
        'Aviso de bajo stock',
        'Generación de reportes en Excel',
        'Soporte prioritario 24/7',
        'Sin publicidad',
        'Copia de seguridad en la nube ilimitada',
      ],
      additionalBenefits: [
        'Productos registrados ilimitados',
        'Dependientes ilimitados',
        'Funcionalidades exclusivas (por ejemplo, análisis avanzados, personalización de reportes, etc.)',
      ],
    },
  ];

  const renderItem = ({ item }: { item: Plan }) => (
    <View style={styles.cardContainer}>
      <BlurView style={styles.blurView} intensity={100} tint="light">
        <LinearGradient colors={['#164076', '#1a5a9a', '#1e6cc7']} style={styles.gradient}>
          <View style={styles.cardContent}>
            <Title style={styles.planTitle}>{item.name}</Title>
            <Paragraph style={styles.planPrice}>{item.price}</Paragraph>
            <Text style={styles.sectionTitle}>Características:</Text>
            {item.features.map((feature: string, idx: number) => (
              <Text key={idx} style={styles.feature}>• {feature}</Text>
            ))}
            {item.limitations && (
              <>
                <Text style={styles.sectionTitle}>Limitaciones:</Text>
                {item.limitations.map((limitation: string, idx: number) => (
                  <Text key={idx} style={styles.feature}>• {limitation}</Text>
                ))}
              </>
            )}
            {item.additionalBenefits && (
              <>
                <Text style={styles.sectionTitle}>Beneficios Adicionales:</Text>
                {item.additionalBenefits.map((benefit: string, idx: number) => (
                  <Text key={idx} style={styles.feature}>• {benefit}</Text>
                ))}
              </>
            )}
            <Button mode="contained" onPress={() => showModal(item)} style={styles.button}>
              <Text style={styles.buttonText}>Seleccionar</Text>
            </Button>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );

  const onViewRef = React.useRef((viewableItems: any) => {
    if (viewableItems.viewableItems.length > 0) {
      setCurrentIndex(viewableItems.viewableItems[0].index);
    }
  });

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Title style={styles.title}>Selecciona tu Plan de Pago</Title>
        <FlatList
          data={plans}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
        <View style={styles.pagination}>
          {plans.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? '#183762' : '#F5F5DC' },
              ]}
            />
          ))}
        </View>
      </View>
      <PaymentModal visible={visible} hideModal={hideModal} plan={selectedPlan} />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginTop: 66,
    color: '#183762',
  },
  flatListContent: {
    alignItems: 'center',
  },
  cardContainer: {
    width: width * 0.8, // Ajusta el ancho de la tarjeta
    marginHorizontal: width * 0.1, // Centra la tarjeta horizontalmente
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  blurView: {
    borderRadius: 8,
    overflow: 'hidden',
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 4,
    color: '#F5F5DC',
    fontWeight: 'bold',
  },
  feature: {
    fontSize: 16,
    color: '#F5F5DC',
    marginBottom: 4,
    textAlign: 'left', // Alinea el texto a la izquierda
  },
  button: {
    marginTop: 16,
    backgroundColor: '#F5F5DC',
  },
  buttonText: {
    color: '#183762',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 60, // Ajusta esta distancia según sea necesario
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default PaymentPlansPage;