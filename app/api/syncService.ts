import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabaseConfig';
import { getSalesWithProducts, getProducts } from './database';

// Función para sincronizar las ventas locales con Supabase
const syncSalesWithSupabase = async () => {
    try {
        // Obtener las ventas locales con sus productos
        const localSales = await getSalesWithProducts();
        const productos = await getProducts();
        // Sincronizar los productos
        for (const products of productos) {
            const { error: productError } = await supabase
                .from('products')
                .upsert({
                    id: products.id,
                    name: products.name,
                    price: products.price,
                });

            if (productError) {
                console.error('Error al sincronizar el producto con Supabase:', productError);
            }
        }

        console.log('Sincronización de productos completada exitosamente.');
        // Sincronizar cada venta con Supabase
        for (const sale of localSales) {
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .upsert({
                    id: sale.id,
                    date: sale.date,
                    total: sale.total,
                });

            if (saleError) {
                console.error('Error al sincronizar la venta con Supabase:', saleError);
                continue;
            }

            // Sincronizar los productos de la venta
            for (const product of sale.products) {
                const { error: saleProductError } = await supabase
                    .from('sales_products')
                    .upsert({
                        sale_id: sale.id,
                        product_id: product.id,
                        quantity: product.quantity,
                        price: product.price,
                    });

                if (saleProductError) {
                    console.error('Error al sincronizar el producto de la venta con Supabase:', saleProductError);
                }
            }
        }

        console.log('Sincronización de ventas completada exitosamente.');

        
    } catch (error) {
        console.error('Error durante la sincronización:', error);
    }
};

// Función para iniciar la sincronización cuando haya conexión a Internet
export const startSyncService = () => {
    NetInfo.addEventListener(state => {
        if (state.isConnected) {
            console.log('Conexión a Internet detectada. Iniciando sincronización...');
            syncSalesWithSupabase();
        }
    });
};