import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { IconButton, List } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSalesWithProducts, createTables, getUserTenantId } from '../api/database';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ReusableTable from '@/components/ReusableTable'; // Ajusta la ruta según tu estructura de proyecto
import { useRouter } from 'expo-router';
import { supabase } from '../api/supabaseConfig';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

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
    const [tenantId, setTenantId] = useState<number | null>(null);
    const router = useRouter();
    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#183762', // Cambia este color al que prefieras
        },
    };

    useEffect(() => {
        const fetchTenantIdAndSales = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.replace('/screen/login');
                    return;
                }
                if (session?.user?.email) {
                    const tenantId = await getUserTenantId(session.user.email);
                    if (tenantId) {
                        setTenantId(tenantId);
                        const salesData = await getSalesWithProducts(tenantId);
                        setSales(salesData);
                        setFilteredSales(salesData);
                    } else {
                        router.replace('/screen/login');
                    }
                }
            } catch (error) {
                console.error('Error fetching tenant ID or sales data:', error);
                setError('Error fetching tenant ID or sales data');
                router.replace('/screen/login');
            } finally {
                setLoading(false);
            }
        };

        fetchTenantIdAndSales();
    }, [router]);

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

    const handleRowPress = (sale: SaleProduct) => {
        router.push({
            pathname: '/screen/venta_detalles',
            params: { sale: JSON.stringify(sale) },
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    const groupedSales = filteredSales.reduce((groups, sale) => {
        const date = new Date(sale.date).toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(sale);
        return groups;
    }, {} as { [key: string]: SaleProduct[] });

    const columns = [
        { title: 'Venta ID', key: 'id', width: 100 },
        { title: 'Fecha', key: 'date', width: 150 },
        { title: 'Total', key: 'total', numeric: true, width: 100 },
    ];

    return (
        <PaperProvider theme={theme}>
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
                {Object.keys(groupedSales).length === 0 ? (
                    <Text style={styles.noSalesText}>No hay ventas disponibles.</Text>
                ) : (
                    Object.keys(groupedSales).map(date => (
                        <List.Accordion
                            key={date}
                            title={date}
                            left={props => <List.Icon {...props} icon="calendar" />}
                        >
                            <ReusableTable
                                columns={columns}
                                data={groupedSales[date].map(sale => ({
                                    id: sale.id,
                                    date: new Date(sale.date).toLocaleDateString('en-CA'), // Formato YYYY-MM-DD
                                    total: `$${sale.total.toFixed(2)}`,
                                    products: sale.products.map(product => ({
                                        name: product.name,
                                        quantity: product.quantity,
                                        price: product.price,
                                    })),
                                }))}
                                onRowPress={handleRowPress}
                            />
                        </List.Accordion>
                    ))
                )}
                {isDatePickerVisible && (
                    <DateTimePicker
                        value={selectedDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleConfirm}
                        maximumDate={new Date(2030, 10, 20)}
                        minimumDate={new Date(1950, 0, 1)}
                        textColor="#164076" // Cambia este color al que prefieras
                        accentColor="#164076" // Cambia este color al que prefieras
                    />
                )}
            </View>
        </TouchableWithoutFeedback>
        </PaperProvider>
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
        backgroundColor: '#164076',
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
    noSalesText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default SalesList;