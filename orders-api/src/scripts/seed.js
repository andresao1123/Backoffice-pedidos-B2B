import { db } from '../db.js';
import fs from 'fs/promises';
import path from 'path';

async function seed() {
    try {
        console.log('Starting seeding...');
        const seedPath = path.resolve('/app/db/seed.sql');
        const seedSql = await fs.readFile(seedPath, 'utf8');

        const queries = seedSql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            try {
                if (query.toLowerCase().startsWith('use ')) {
                    continue;
                }
                await db.query(query);
            } catch (err) {
                // Ignore duplicate entry errors for idempotency
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log('Skipping duplicate entry...');
                } else {
                    console.warn(`Error executing query: ${query.substring(0, 50)}...`, err.message);
                }
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
