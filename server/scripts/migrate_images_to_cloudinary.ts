
import { db, initDb } from '../db';
import { uploadToCloudinary } from '../services/cloudinary';

async function migrateImages() {
    console.log('Starting image migration to Cloudinary...');

    try {
        await initDb();

        // Get all products
        const products = await db.all('SELECT id, name, imageUrl FROM products');
        console.log(`Found ${products.length} products. Checking for Base64 images...`);

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const product of products) {
            // Check if it's a base64 string (starts with data:image)
            if (product.imageUrl && product.imageUrl.startsWith('data:image')) {
                console.log(`Migrating image for product: ${product.name} (${product.id})...`);
                try {
                    const newUrl = await uploadToCloudinary(product.imageUrl);

                    if (newUrl !== product.imageUrl) {
                        await db.query('UPDATE products SET imageUrl = $1 WHERE id = $2', [newUrl, product.id]);
                        console.log(`  -> Success! New URL: ${newUrl}`);
                        migratedCount++;
                    } else {
                        console.log('  -> Skipped (Service returned same string)');
                        skippedCount++;
                    }
                } catch (err) {
                    console.error(`  -> Failed to upload:`, err);
                    errorCount++;
                }
            } else {
                skippedCount++;
            }
        }

        console.log('-----------------------------------');
        console.log(`Migration Complete.`);
        console.log(`Migrated: ${migratedCount}`);
        console.log(`Skipped (Already URL): ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateImages();
