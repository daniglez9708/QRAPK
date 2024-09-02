import * as SQLite from 'expo-sqlite';

export interface Product {
    id: number;
    name: string;
    price: number;
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
            price REAL
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

export const insertProduct = async (name: string, price: number) => {
    const result = await (await db).runAsync('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
}

export const getProducts = async (): Promise<Product[]> => {
    const rows = await (await db).getAllAsync('SELECT * FROM products') as any[];
    const products: Product[] = rows.map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        // Mapea otros campos según tu esquema de base de datos
    }));
    return products;
}

export const fetchProductById = async (id: number): Promise<Product | null> => {
    const product = await (await db).getFirstAsync('SELECT * FROM products WHERE id = ?', [id]) as Product | null;
    if (product) {
        console.log(product);
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
                name: row.name,
                quantity: row.quantity,
                price: row.price
            });
        });
console.log(Object.values(salesMap));

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
        console.log(`Estructura de la tabla ${tableName}:`, result);
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
        console.log('Tabla eliminada');
        return result;
    } catch (error) {
        console.error('Error al eliminar la tabla:', error);
        throw error;
    }
}
export const sumSalesTotal = async (): Promise<number> => {
    const database = await db;
    try {
        const result: any = await database.getFirstAsync('SELECT SUM(total) as totalSum FROM sales');
        return result.totalSum;
    } catch (error) {
        console.error('Error al sumar los totales de ventas:', error);
        throw error;
    }
}
export const getMostSoldProduct = async (): Promise<{ name: string, quantity: number } | null> => {
    const database = await db;
    try {
        const result: any = await database.getFirstAsync(`
            SELECT p.name, SUM(sp.quantity) as totalQuantity
            FROM sales_products sp
            JOIN products p ON sp.product_id = p.id
            GROUP BY sp.product_id
            ORDER BY totalQuantity DESC
            LIMIT 1
        `);
        return result ? { name: result.name, quantity: result.totalQuantity } : null;
    } catch (error) {
        console.error('Error al obtener el producto más vendido:', error);
        throw error;
    }
}
export const getProductById = async (id: string): Promise<Product | null> => {
    const product = await (await db).getFirstAsync('SELECT * FROM products WHERE id = ?', [id]) as Product | null;
    return product;
}
export const updateProduct = async (id: string, name: string, price: number) => {
    await (await db).runAsync('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, id]);
}