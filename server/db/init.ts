import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function initializeDatabase() {
    // Enable verbose mode for debugging
    sqlite3.verbose();

    try {
        const db = await open({
            filename: path.join(__dirname, '../database.sqlite'),
            driver: sqlite3.Database
        });

        console.log('Database connected successfully');

        // Users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                leg TEXT CHECK (leg IN ('Bonus', 'Incentive') OR leg IS NULL),
                added_under_id INTEGER,
                mobile_no TEXT,
                address TEXT,
                work TEXT,
                remarks TEXT,
                FOREIGN KEY (added_under_id) REFERENCES users(id)
            )
        `);

        console.log('Users table created successfully');

        // Products table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT NOT NULL,
                mrp DECIMAL(10,2) NOT NULL,
                dp DECIMAL(10,2) NOT NULL,
                sp DECIMAL(10,2) NOT NULL,
                description TEXT,
                link TEXT
            )
        `);

        console.log('Products table created successfully');

        // Sales table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                mrp DECIMAL(10,2) NOT NULL,
                dp DECIMAL(10,2) NOT NULL,
                sp DECIMAL(10,2) NOT NULL,
                date DATE NOT NULL,
                sold_rate DECIMAL(10,2) NOT NULL,
                quantity INTEGER NOT NULL,
                final_amount DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        console.log('Sales table created successfully');

        // Payments table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        console.log('Payments table created successfully');

        // Prescriptions table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS prescriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date DATE NOT NULL,
                remarks TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS prescription_medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prescription_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                morning_dose TEXT,
                evening_dose TEXT,
                FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        return db;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
} 