/**
 * One-time fix: drop the old bad compound index  { provider_1_providerId_1 }
 * which caused duplicate-key errors for ALL local users (provider is always set).
 * Run once: node server/scripts/fix-indexes.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

const col = mongoose.connection.collection('registerusers');
const indexes = await col.indexes();
console.log('Current indexes:', indexes.map(i => i.name));

const badIndex = 'provider_1_providerId_1';
if (indexes.find(i => i.name === badIndex)) {
    await col.dropIndex(badIndex);
    console.log(`✅ Dropped bad index: ${badIndex}`);
} else {
    console.log(`ℹ️  Index "${badIndex}" not found — nothing to drop`);
}

// Now ensure the new correct index exists
await col.createIndex({ providerId: 1 }, { unique: true, sparse: true, name: 'providerId_1' });
console.log('✅ Created correct sparse unique index on providerId');

await mongoose.disconnect();
console.log('Done!');
