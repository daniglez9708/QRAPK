import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Provider as PaperProvider, Snackbar } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

type PaymentModalProps = {
  visible: boolean;
  hideModal: () => void;
  plan: {
    name: string;
    price: number;
  } | null;
};

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, hideModal, plan }) => {
  const containerStyle = { 
    backgroundColor: 'white', 
    padding: 20, 
    margin: 20, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#183762' 
  };

  const [copiedText, setCopiedText] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setSnackbarVisible(true);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
        <Text style={styles.title}>Proceder al Pago</Text>
        <Text style={styles.planName}>Plan Seleccionado: {plan?.name}</Text>
        <Text style={styles.planPrice}>Precio: {plan?.price}</Text>
        <Text style={styles.instructions}>Para proceder con el pago, sigue las instrucciones a continuación:</Text>
        <Text style={styles.step}>1. Transfiera {plan?.price} por Transfermovil a la siguiente cuenta.</Text>
        <Text style={styles.step} onPress={() => copyToClipboard('1234-4566-7894-7895')}>2. Tarjeta: 1234-4566-7894-7895.</Text>
        <Text style={styles.step}>3. Disfruta de tu plan.</Text>
        <Button mode="contained" onPress={hideModal} style={styles.button}>
          <Text style={styles.buttonText}>Cerrar</Text>
        </Button>
      </Modal>
      <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          action={{
            label: 'OK',
            textColor: '#183762',
            rippleColor: '#183762',
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}
        >
          Número de tarjeta copiado al portapapeles
        </Snackbar>
      </Portal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#183762',
  },
  planName: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
    color: '#183762',
  },
  planPrice: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#183762',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#183762',
  },
  step: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
    color: '#183762',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#183762',
  },
  buttonText: {
    color: '#fff',
  },
});

export default PaymentModal;