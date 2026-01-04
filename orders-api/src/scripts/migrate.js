import { db } from '../db.js';
import fs from 'fs/promises';
import path from 'path';

async function migrate() {
    try {
        console.log('Starting migration...');
        const schemaPath = path.resolve('/app/db/schema.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');

        const queries = schemaSql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        console.log(queries)

        for (const query of queries) {
            try {

                if (query.toLowerCase().startsWith('use ')) {
                    continue;
                }

                await db.query(query);
            } catch (err) {
                console.warn(`Error executing query: ${query.substring(0, 50)}...`, err.message);

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
