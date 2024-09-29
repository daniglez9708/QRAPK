import * as SQLite from 'expo-sqlite';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    isAvailable: boolean;
    image: string | null;
}

export interface Sale {
    id: number;
    date: string;
    total: number;
    
}
export interface SaleProduct {
    id: number;
    date: string;
    total: number;
    products: {
        id: number;
        name: string;
        quantity: number;
        price: number;
    }[];
    
}


const db = SQLite.openDatabaseAsync('sales.db');

export const createTables = async () => {
    (await db).execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            stock INTEGER,
            isAvailable INTEGER,
            image TEXT
        );
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            total REAL
        );
        CREATE TABLE IF NOT EXISTS sales_products (
            sale_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            FOREIGN KEY (sale_id) REFERENCES sales(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `);
}

export const insertProduct = async (name: string, price: number, stock: number, isAvailable: boolean, image: string | null) => {
    const result = await (await db).runAsync('INSERT INTO products (name, price, stock, isAvailable, image) VALUES (?, ?, ?, ?, ?)', [name, price, stock, isAvailable ? 1 : 0, image]);
}

export const getProducts = async (): Promise<Product[]> => {
    const rows = await (await db).getAllAsync('SELECT * FROM products') as any[];
    const products: Product[] = rows.map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.isAvailable === 1,
        image: row.image,
        // Mapea otros campos según tu esquema de base de datos
    }));
    return products;
}

export const fetchProductById = async (id: number): Promise<Product | null> => {
    const product = await (await db).getFirstAsync('SELECT * FROM products WHERE id = ?', [id]) as Product | null;
    if (product) {
        return product;
    } else {
        console.error('Product not found');
        return null;
    }
}
export const insertSale = async (date: string, total: number) => {
    const result = await (await db).runAsync('INSERT INTO sales (date, total) VALUES (?, ?)', [date, total]);
}

export const insertSaleProduct = async (sale_id: number, product_id: number, quantity: number) => {
    const result = await (await db).runAsync('INSERT INTO sales_products (sale_id, product_id, quantity) VALUES (?, ?, ?)', [sale_id, product_id, quantity]);
}

export const addSaleWithProducts = async (date: string, total: number, products: { product_id: number, quantity: number }[]) => {
    // Insertar la venta
    const saleResult = await (await db).runAsync('INSERT INTO sales (date, total) VALUES (?, ?)', [date, total]);
    
    // Obtener el ID de la venta recién insertada
    const saleId = saleResult.lastInsertRowId;

    // Insertar los productos de la venta
    for (const product of products) {
        await (await db).runAsync('INSERT INTO sales_products (sale_id, product_id, quantity) VALUES (?, ?, ?)', [saleId, product.product_id, product.quantity]);
        await (await db).runAsync('UPDATE products SET stock = stock - ? WHERE id = ?', [product.quantity, product.product_id]);
    }
}
export const getSales = async (): Promise<Sale[]> => {
    const rows = await (await db).getAllAsync('SELECT * FROM sales') as any[];
    const sales: Sale[] = rows.map(row => ({
        id: row.id,
        date: row.date,
        total: row.total,
    }));
    return sales;
}
export const getSalesWithProducts = async (): Promise<SaleProduct[]> => {
    const database = await db;
    try {
        const rows = await database.getAllAsync(`
            SELECT 
                s.id as sale_id, 
                s.date, 
                s.total, 
                sp.product_id, 
                p.name, 
                sp.quantity, 
                p.price
            FROM sales s
            JOIN sales_products sp ON s.id = sp.sale_id
            JOIN products p ON sp.product_id = p.id
        `) as any[];

        const salesMap: { [key: number]: SaleProduct } = {};

        rows.forEach(row => {
            if (!salesMap[row.sale_id]) {
                salesMap[row.sale_id] = {
                    id: row.sale_id,
                    date: row.date,
                    total: row.total,
                    products: []
                };
            }
            salesMap[row.sale_id].products.push({
                id: row.product_id,
                name: row.name,
                quantity: row.quantity,
                price: row.price
            });
        });

        return Object.values(salesMap);
    } catch (error) {
        console.error('Error fetching sales with products:', error);
        throw error;
    }
};
export const getTableInfo = async (tableName: string) => {
    const database = await db;
    try {
        const result = await database.getAllAsync(`PRAGMA table_info(${tableName});`);
        
        return result;
    } catch (error) {
        console.error(`Error al obtener la estructura de la tabla ${tableName}:`, error);
        throw error;
    }
}
export  const deleteTable = async() =>{
    const database = await db;
    try {
        const result = await database.runAsync('DROP TABLE IF EXISTS sales_products');
        const result1 = await database.runAsync('DROP TABLE IF EXISTS sales');
        const result2 = await database.runAsync('DROP TABLE IF EXISTS products');
        return result;
    } catch (error) {
        console.error('Error al eliminar la tabla:', error);
        throw error;
    }
}
export const logSalesDates = async () => {
    const database = await db;
    try {
        const results: any[] = await database.getAllAsync('SELECT date FROM sales LIMIT 5');
        console.log('Fechas de ventas:', results);
    } catch (error) {
        console.error('Error al obtener las fechas de ventas:', error);
        throw error;
    }
}

export const sumDailySalesTotal = async (): Promise<{ totalSum: number, totalProductsSold: number }> => {
    const database = await db;
    try {
        const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
        const result: any = await database.getFirstAsync(`
            SELECT 
                SUM(s.total) as totalSum, 
                SUM(sp.quantity) as totalProductsSold 
            FROM 
                sales s
            JOIN 
                sales_products sp ON s.id = sp.sale_id
            WHERE 
                DATE(s.date) = DATE(?)
        `, [today]);
        return {
            totalSum: result.totalSum,
            totalProductsSold: result.totalProductsSold
        };
    } catch (error) {
        console.error('Error al sumar los totales de ventas y la cantidad de productos vendidos del día:', error);
        throw error;
    }
}
export const getMostSoldProduct = async (): Promise<{ name: string, quantity: number, price: number } | null> => {
    const database = await db;
    try {
        const result: any = await database.getFirstAsync(`
            SELECT p.name, SUM(sp.quantity) as totalQuantity, p.price
            FROM sales_products sp
            JOIN products p ON sp.product_id = p.id
            GROUP BY sp.product_id, p.price
            ORDER BY totalQuantity DESC
            LIMIT 1
        `);
        
        return result ? { name: result.name, quantity: result.totalQuantity, price: result.price } : null;
    } catch (error) {
        console.error('Error al obtener el producto más vendido:', error);
        throw error;
    }
}
export const getProductById = async (id: string): Promise<Product | null> => {
    const product = await (await db).getFirstAsync('SELECT * FROM products WHERE id = ?', [id]) as Product | null;
    return product;
}
export const updateProduct = async (id: string, name: string, price: number, stock: number, isAvailable: boolean, image: string | null) => {
    await (await db).runAsync('UPDATE products SET name = ?, price = ?, stock = ?, isAvailable = ?, image = ? WHERE id = ?', [name, price, stock, isAvailable ? 1 : 0, image, id]);
}


export const getTotalSalesByCurrentWeek = async (): Promise<{ date: string, total: number }[]> => {
    const database = await db;
    const today = new Date();
    const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 }); // La semana empieza el lunes
    const formattedStartOfWeekDate = format(startOfWeekDate, 'yyyy-MM-dd');
    const formattedTodayDate = format(today, 'yyyy-MM-dd');

    try {
        const rows = await database.getAllAsync(`
            SELECT strftime('%Y-%m-%d', date) as date, SUM(total) as total
            FROM sales
            WHERE date(date) BETWEEN date(?) AND date(?)
            GROUP BY strftime('%Y-%m-%d', date)
            ORDER BY date
        `, [formattedStartOfWeekDate, formattedTodayDate]) as any[];

        // Mapea los resultados de la consulta a un formato más manejable
        const totalSalesByCurrentWeek = rows.map(row => ({
            date: row.date,
            total: row.total,
        }));
        
        return totalSalesByCurrentWeek;
    } catch (error) {
        console.error('Error al obtener el total de ventas de la semana actual:', error);
        throw error;
    }
};

export const getTotalSalesByWeek = async (date: Date): Promise<number> => {
    const database = await db;
    const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 }); // La semana empieza el lunes
    const endOfWeekDate = endOfWeek(date, { weekStartsOn: 1 });
    const formattedStartOfWeekDate = format(startOfWeekDate, 'yyyy-MM-dd');
    const formattedEndOfWeekDate = format(endOfWeekDate, 'yyyy-MM-dd');

    try {
        const result: any = await database.getFirstAsync(`
            SELECT SUM(total) as totalSum
            FROM sales
            WHERE date BETWEEN ? AND ?
        `, [formattedStartOfWeekDate, formattedEndOfWeekDate]);

        return result.totalSum || 0;
    } catch (error) {
        console.error('Error al obtener el total de ventas de la semana:', error);
        throw error;
    }
};
export const getSalesDifferenceWithPreviousWeek = async (): Promise<number> => {
    const today = new Date();
    const previousWeekDate = subWeeks(today, 1);

    try {
        const currentWeekSales = await getTotalSalesByWeek(today);
        const previousWeekSales = await getTotalSalesByWeek(previousWeekDate);

        const difference = currentWeekSales - previousWeekSales;
        return difference;
    } catch (error) {
        console.error('Error al calcular la diferencia de ventas con la semana anterior:', error);
        throw error;
    }
};
export const deleteProduct = async () => {
    await (await db).runAsync('DELETE FROM products WHERE id = 9');
}
export const getLowStockProducts = async (): Promise<Product[]> => {
    const database = await db;
    const threshold = 20; // Umbral de stock bajo
    try {
        const rows = await database.getAllAsync('SELECT * FROM products WHERE stock < ? ORDER BY stock ASC', [threshold]) as any[];
        const lowStockProducts: Product[] = rows.map(row => ({
            id: row.id,
            name: row.name,
            price: row.price,
            stock: row.stock,
            isAvailable: row.isAvailable === 1,
            image: row.image,
        }));
        return lowStockProducts;
    } catch (error) {
        console.error('Error al obtener los productos con poco stock:', error);
        throw error;
    }
};