import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    key: '1',
    title: 'Bienvenido a la App',
    text: 'Esta es una breve introducción a nuestra aplicación.',
    image: require('../assets/images/slide1.jpg'), // Asegúrate de tener una imagen en esta ruta
    backgroundColor: '#59b2ab',
  },
  {
    key: '2',
    title: 'Escanea Productos',
    text: 'Escanea los códigos QR de los productos para obtener información.',
    image: require('../assets/images/slide2.jpg'),
    backgroundColor: '#febe29',
  },
  {
    key: '3',
    title: 'Genera Reportes',
    text: 'Genera reportes de ventas en Excel para un mejor control.',
    image: require('../assets/images/slide3.jpg'),
    backgroundColor: '#22bcb5',
  },
];

const TutorialScreen = ({ onDone }: { onDone: () => void }) => {
  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <AppIntroSlider renderItem={renderItem} data={slides} onDone={onDone} />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
});

export default TutorialScreen;