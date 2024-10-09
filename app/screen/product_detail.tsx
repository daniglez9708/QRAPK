import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getProductById, getUserTenantId, Product } from '../api/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../api/supabaseConfig';

const ProductDetails = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const { productId } = useLocalSearchParams<{ productId: string }>();
    const [tenantId, setTenantId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTenantId = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if(!session){
                router.replace('/screen/login')
            }
            if (session?.user?.email) {
                const tenantId = await getUserTenantId(session.user.email);
                setTenantId(tenantId);
            }
        };
      
        fetchTenantId();
    }, []);

    useEffect(() => {
        if (productId && tenantId) {
            
            const loadProduct = async () => {
                const productData = await getProductById(productId, tenantId);
                setProduct(productData);
            };
            loadProduct();
        }
    }, [productId, tenantId]);

    if (!product) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                {product.image && (
                    <Card.Cover source={{ uri: product.image }} style={styles.image} />
                )}
                <Card.Content style={styles.content}>
                    <Title style={styles.header}>Detalles del Producto</Title>
                    <View style={styles.detailRow}>
                        <Paragraph style={styles.label}>Nombre:</Paragraph>
                        <Paragraph style={styles.value}>{product.name}</Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Paragraph style={styles.label}>Precio:</Paragraph>
                        <Paragraph style={styles.value}>${product.price}</Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Paragraph style={styles.label}>Stock:</Paragraph>
                        <Paragraph style={styles.value}>{product.stock}</Paragraph>
                    </View>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 20,
    },
    card: {
        borderRadius: 16,
        elevation: 4,
        overflow: 'hidden',
        backgroundColor: '#c2d9f5', // Cambia el color de fondo aquí
    },
    image: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    content: {
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 18,
    },
    actionsContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#FF4500',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductDetails;