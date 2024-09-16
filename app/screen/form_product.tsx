import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Switch, Image, TouchableOpacity, Alert } from 'react-native';
import { insertProduct, getProductById, updateProduct } from '../api/database';
import { TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

const FormProduct = () => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [stock, setStock] = useState('');
    const [isAvailable, setIsAvailable] = useState(false);
    const [image, setImage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { productId } = useLocalSearchParams<{ productId: string }>();
    const router = useRouter();
    const [errors, setErrors] = useState({ name: '', price: '', stock: '' });

    useEffect(() => {
        if (productId && !isEditing) {
            const loadProduct = async () => {
                const product = await getProductById(productId);
                if (product) {
                    setProductName(product.name);
                    setProductPrice(product.price.toString());
                    setStock(product.stock.toString());
                    setIsAvailable(product.isAvailable);
                    setImage(product.image || '');
                    setIsEditing(true);
                }
            };
            loadProduct();
        }
    }, [productId, isEditing]);

    const validate = () => {
        let valid = true;
        let errors = { name: '', price: '', stock: '' };

        if (!productName) {
            errors.name = 'El nombre es obligatorio';
            valid = false;
        }
        if (!productPrice || isNaN(Number(productPrice))) {
            errors.price = 'El precio debe ser un número';
            valid = false;
        }
        if (!stock || isNaN(Number(stock))) {
            errors.stock = 'El stock debe ser un número';
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    const handleSaveProduct = async () => {
        if (validate()) {
            const productData = {
                name: productName,
                price: parseFloat(productPrice),
                stock: parseInt(stock),
                isAvailable,
                image,
            };

            if (isEditing && productId !== null) {
                await updateProduct(productId, productData.name, productData.price, productData.stock, productData.isAvailable, productData.image);
                await saveImage(productData.name);
            } else {
                const newProductId = await insertProduct(productData.name, productData.price, productData.stock, productData.isAvailable, productData.image);
                await saveImage(productData.name);
            }
            router.push('/screen/admin_product');
        } else {
            Alert.alert('Error', 'Por favor, corrige los errores antes de guardar.');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            const removedBgUri = await removeBackground(uri);
            setImage(removedBgUri);
        }
    };

    const removeBackground = async (uri: string) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 200, height: 200 } }, { crop: { originX: 0, originY: 0, width: 200, height: 200 } }],
                { compress: 1, format: ImageManipulator.SaveFormat.PNG }
            );
            return manipResult.uri;
        } catch (error) {
            console.error('Error removing background:', error);
            Alert.alert('Error', 'No se pudo eliminar el fondo de la imagen.');
            return uri;
        }
    };

    const saveImage = async (productName: string) => {
        if (image && FileSystem.documentDirectory) {
            const imagePath = `${FileSystem.documentDirectory}assets/images/productos/${productName}/foto.png`;
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}assets/images/productos/${productName}`, { intermediates: true });

            try {
                const manipResult = await ImageManipulator.manipulateAsync(
                    image,
                    [{ resize: { width: 267, height: 267 } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.PNG }
                );
                console.log(manipResult.uri); // Añadir log para verificar la URI de la imagen redimensionada
                await FileSystem.moveAsync({
                    from: manipResult.uri,
                    to: imagePath,
                });
            } catch (error) {
                console.error('Error resizing image:', error);
            }
        } else {
            console.error('Error: FileSystem.documentDirectory is null or image is not set');
        }
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
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
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
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            <TextInput
                label="Stock"
                value={stock}
                onChangeText={setStock}
                mode='outlined'
                cursorColor='#164076'
                outlineColor='#164076'
                activeOutlineColor='#164076'
                style={styles.input}
                keyboardType="numeric"
            />
            {errors.stock ? <Text style={styles.errorText}>{errors.stock}</Text> : null}
            <View style={styles.switchContainer}>
                <Text>Disponible</Text>
                <Switch
                    value={isAvailable}
                    onValueChange={setIsAvailable}
                />
            </View>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="#fff" />
                <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            {image && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                </View>
            )}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
                <Text style={styles.saveButtonText}>{isEditing ? "Actualizar Producto" : "Añadir Producto"}</Text>
            </TouchableOpacity>
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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    imagePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#164076',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    imagePickerText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: '#164076',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
    },
});

export default FormProduct;