import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';

interface Product {
    name: string;
    quantity: number;
    price: number;
}

interface SaleProduct {
    id: number;
    date: string;
    total: number;
    products: Product[];
}

const SaleDetails: React.FC = () => {
    const params = useLocalSearchParams();
    const saleString = params.sale as string;
    let sale: SaleProduct | null = null;

    try {
        sale = JSON.parse(saleString);

        // Verificar que sale.total sea un número
        if (sale) {
            sale.total = parseFloat(String(sale.total).replace('$', ''));
        }

        // Verificar que sale.products sea un array de objetos con las propiedades correctas
        if (!sale || !Array.isArray(sale.products) || !sale.products.every(product => typeof product.name === 'string' && typeof product.quantity === 'number' && typeof product.price === 'number')) {
            throw new Error('Invalid products structure');
        }
    } catch (error) {
        console.error('Error parsing sale data:', error);
    }

    if (!sale || typeof sale.total !== 'number' || !Array.isArray(sale.products)) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>No se encontraron detalles de la venta.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ marginBottom: 16 }}>
        <View style={styles.titleContainer}>
            <Title style={styles.title}>Detalles de la Venta</Title>
        </View>
    </View>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.row}>
                        <Paragraph style={styles.label}>Fecha:</Paragraph>
                        <Paragraph>{new Date(sale.date).toLocaleDateString('en-CA')}</Paragraph>
                    </View>
                    <Paragraph style={styles.label}>Productos:</Paragraph>
                    {sale.products.map((product, index) => (
                        <View style={styles.row} key={index}>
                            <Paragraph>{product.quantity}x {product.name}</Paragraph>
                            <Paragraph>${product.price.toFixed(2)}</Paragraph>
                        </View>
                    ))}
                    <Divider />
                    <View style={styles.row1}>
                        <Paragraph style={styles.label}>Total:</Paragraph>
                        <Paragraph>${sale.total.toFixed(2)}</Paragraph>
                    </View>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
    },
    titleContainer: {
        backgroundColor: '#2878cf',
        padding: 10,
        borderRadius: 4,
    },
    title: {
        color: 'white',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    row1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
});

export default SaleDetails;