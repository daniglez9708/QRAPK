import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabaseConfig';
import * as SQLite from 'expo-sqlite';
import { getSalesWithProducts, getProducts } from './database';

const db = SQLite.openDatabaseAsync('sales.db');

// Función para obtener el último valor de cada tabla en SQLite para un tenant específico
const getLastValuesFromSQLite = async (tenant_id: number) => {
    const tables = [
        { name: 'user', column: 'id' },
        { name: 'products', column: 'id' },
        { name: 'sales', column: 'id' },
        { name: 'sales_products', column: 'sale_id' },
        { name: 'plans', column: 'id' },
    ];

    const lastValues: { [key: string]: any } = {};

    for (const table of tables) {
        const rows = await (await db).getAllAsync(
            `SELECT MAX(${table.column}) as lastValue FROM ${table.name} WHERE tenant_id = ?`,
            [tenant_id]
        ) as any[];

        if (rows.length > 0) {
            lastValues[table.name] = rows[0].lastValue;
        } else {
            lastValues[table.name] = null;
        }
    }

    return lastValues;
};
// Función para obtener el último valor de cada tabla en Supabase para un tenant específico
const getLastValuesFromSupabase = async (tenant_id: number) => {
    const tables = [
        { name: 'user', column: 'id' },
        { name: 'products', column: 'id' },
        { name: 'sales', column: 'id' },
        { name: 'sales_products', column: 'sale_id' },
        { name: 'plans', column: 'id' },
    ];

    const lastValues: { [key: string]: any } = {};

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table.name)
            .select(`MAX(${table.column}) as lastValue`)
            .eq('tenant_id', tenant_id)
            .single();

        if (error) {
            console.error(`Error fetching last value from Supabase for table ${table.name}:`, error);
            lastValues[table.name] = null;
        } else {
            const result = data as unknown as { lastValue: any };
            lastValues[table.name] = result.lastValue;
        }
    }

    return lastValues;
};


// Función para iniciar la sincronización cuando haya conexión a Internet
/*export const startSyncService = (tenant_id: number) => {
    NetInfo.addEventListener(state => {
        if (state.isConnected) {
            console.log('Conexión a Internet detectada. Iniciando sincronización...');
            syncSalesWithSupabase(tenant_id);
            syncDatabase(tenant_id);
        }
    });
};*/