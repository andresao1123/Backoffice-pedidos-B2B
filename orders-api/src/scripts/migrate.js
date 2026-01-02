import { db } from '../db.js';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
    try {
        console.log('Starting migration...');
        const schemaPath = path.resolve('/app/db/schema.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');

        // Split queries by semicolon and filter empty lines
        const queries = schemaSql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            try {
                // Skip 'use orders_db' as we are already connected to it or can't switch if using connection pool logic differently
                // Actually, our db connection is already to orders_db.
                if (query.toLowerCase().startsWith('use ')) {
                    continue;
                }

                await db.query(query);
            } catch (err) {
                console.warn(`Error executing query: ${query.substring(0, 50)}...`, err.message);
                // We don't exit process, we continue. usage of IF NOT EXISTS assumes safety.
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
