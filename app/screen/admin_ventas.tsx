import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSalesWithProducts, createTables } from '../api/database';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ReusableTable from '@/components/ReusableTable'; // Ajusta la ruta según tu estructura de proyecto
import { useRouter } from 'expo-router';

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

const SalesList: React.FC = () => {
    const [sales, setSales] = useState<SaleProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredSales, setFilteredSales] = useState<SaleProduct[]>([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const router = useRouter();

    useEffect(() => {
        createTables();
        const fetchSales = async () => {
            try {
                const salesData = await getSalesWithProducts();
                setSales(salesData);
                setFilteredSales(salesData);
            } catch (err) {
                setError('Error fetching sales data');
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const results = sales.filter(sale =>
                new Date(sale.date).toDateString() === selectedDate.toDateString()
            );
            setFilteredSales(results);
        } else {
            setFilteredSales(sales);
        }
    }, [selectedDate, sales]);

    const exportToExcel = async () => {
        const data = filteredSales.map(sale => ({
            'Venta ID': sale.id,
            'Fecha': sale.date,
            'Total': sale.total,
            'Productos': sale.products.map(product => `${product.quantity}x ${product.name}`).join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SalesData');

        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        const uri = FileSystem.cacheDirectory + 'SalesData.xlsx';
        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });

        await Sharing.shareAsync(uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Exportar datos de ventas',
            UTI: 'com.microsoft.excel.xlsx'
        });
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (event: any, date?: Date) => {
        if (event.type === 'set' && date) {
            setSelectedDate(date);
        }
        hideDatePicker();
    };

    const handleShowAll = () => {
        setSelectedDate(null);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    const columns = [
        { title: 'Venta ID', key: 'id', width: 100 },
        { title: 'Fecha', key: 'date', width: 150 },
        { title: 'Total', key: 'total', numeric: true, width: 100 },
    ];

    const data = filteredSales.map(sale => ({
        id: sale.id,
        date: new Date(sale.date).toLocaleDateString('en-CA'), // Formato YYYY-MM-DD
        total: `$${sale.total.toFixed(2)}`,
        products: sale.products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
        })),
    }));

    const handleRowPress = (sale: SaleProduct) => {
        router.push({
            pathname: '/screen/venta_detalles',
            params: { sale: JSON.stringify(sale) },
        });
    };

    return (
        <TouchableWithoutFeedback onPress={() => { setDatePickerVisibility(false); Keyboard.dismiss(); }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Ventas</Text>
                    <View style={styles.headerIcons}>
                        <IconButton
                            icon="calendar"
                            iconColor="white"
                            onPress={showDatePicker}
                        />
                        <IconButton
                            icon="microsoft-excel"
                            iconColor="white"
                            onPress={exportToExcel}
                        />
                        <TouchableOpacity onPress={handleShowAll}>
                           <IconButton icon="refresh" iconColor="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                <ReusableTable
                    columns={columns}
                    data={data}
                    onRowPress={handleRowPress}
                />
                {isDatePickerVisible && (
                    <DateTimePicker
                        value={selectedDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleConfirm}
                        maximumDate={new Date(2030, 10, 20)}
                        minimumDate={new Date(1950, 0, 1)}
                    />
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2878cf',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    showAllButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    showAllButtonText: {
        color: '#2878cf',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
});

export default SalesList;