import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ContactProps {
  name: string;
  email: string;
  phone: string;
}

const Contact: React.FC<ContactProps> = ({ name, email, phone }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contact Information</Text>
      <Text style={styles.text}>Name: {name}</Text>
      <Text style={styles.text}>Email: {email}</Text>
      <Text style={styles.text}>Phone: {phone}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default Contact;