import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { insertProduct, getProductById, updateProduct } from '../api/database';
import { TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

const FormProduct = () => {
    const [productName, setProductName] = useState('');
    const router = useRouter();
    const [productPrice, setProductPrice] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const productId = useLocalSearchParams<{ productId: string }>();

    useEffect(() => {
        if (productId && !isEditing) {
            const loadProduct = async () => {
                const product = await getProductById(productId.productId);
                if (product) {
                    setProductName(product.name);
                    setProductPrice(product.price.toString());
                    setIsEditing(true);
                }
            };
            loadProduct();
        }
    }, [productId, isEditing]);

    const handleSaveProduct = async () => {
        if (isEditing && productId !== null) {
            await updateProduct(productId.productId, productName, parseFloat(productPrice));
        } else {
            await insertProduct(productName, parseFloat(productPrice));
        }
        router.push('/screen/admin_product');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{isEditing ? 'Editar Producto' : 'Añadir Producto'}</Text>
            <TextInput
                label="Nombre del Producto"
                value={productName}
                onChangeText={setProductName}
                mode='outlined'
                cursorColor='#164076'
                outlineColor='#164076'
                activeOutlineColor='#164076'
                style={styles.input}
            />
            <TextInput
                label="Precio"
                value={productPrice}
                onChangeText={setProductPrice}
                mode='outlined'
                cursorColor='#164076'
                outlineColor='#164076'
                activeOutlineColor='#164076'
                style={styles.input}
                keyboardType="numeric"
            />
            <Button title={isEditing ? "Actualizar Producto" : "Añadir Producto"} onPress={handleSaveProduct} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: 'black',
    },
});

export default FormProduct;