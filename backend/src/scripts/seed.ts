import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { query, testConnection, closePool } from '../config/database';
import { logger } from '../utils/logger';
import { CreateQuoteInput } from '../types/quote';

// Load environment variables
dotenv.config();

/**
 * Read JSON file
 */
function readJSONFile<T>(filePath: string): T[] {
  try {
    const fullPath = path.resolve(__dirname, '../../data', filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    logger.error(`Error reading file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Insert quotes into database
 */
async function insertQuotes(quotes: CreateQuoteInput[]): Promise<number> {
  let inserted = 0;

  for (const quote of quotes) {
    try {
      const result = await query(
        `INSERT INTO quotes (text, author, source, source_url, language, category, is_public_domain, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          quote.text,
          quote.author,
          quote.source || null,
          quote.source_url || null,
          quote.language || 'ko',
          quote.category || null,
          quote.is_public_domain !== false,
          true, // MVP: all quotes are pre-approved
        ]
      );

      if (result.rowCount && result.rowCount > 0) {
        inserted++;
        logger.info(`Inserted quote: "${quote.text.substring(0, 50)}..." by ${quote.author}`);
      }
    } catch (error) {
      logger.error('Error inserting quote', { quote, error });
    }
  }

  return inserted;
}

/**
 * Main seeding function
 */
async function seed() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Read quote files
    logger.info('📖 Reading quote data files...');
    const koreanQuotes = readJSONFile<CreateQuoteInput>('quotes-ko.json');
    const englishQuotes = readJSONFile<CreateQuoteInput>('quotes-en.json');

    logger.info(`Found ${koreanQuotes.length} Korean quotes`);
    logger.info(`Found ${englishQuotes.length} English quotes`);

    // Insert Korean quotes
    logger.info('💾 Inserting Korean quotes...');
    const koInserted = await insertQuotes(koreanQuotes);
    logger.info(`✅ Inserted ${koInserted} Korean quotes`);

    // Insert English quotes
    logger.info('💾 Inserting English quotes...');
    const enInserted = await insertQuotes(englishQuotes);
    logger.info(`✅ Inserted ${enInserted} English quotes`);

    // Get total count
    const result = await query('SELECT COUNT(*) as count FROM quotes');
    const totalCount = parseInt(result.rows[0].count, 10);

    logger.info('✅ Database seeding completed!');
    logger.info(`📊 Total quotes in database: ${totalCount}`);
    logger.info(`📊 Newly inserted: ${koInserted + enInserted}`);

    // Close database connection
    await closePool();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed', error);
    await closePool();
    process.exit(1);
  }
}

// Run seeding
seed();
