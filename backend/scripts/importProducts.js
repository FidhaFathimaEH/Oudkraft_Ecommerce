const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mongoose = require('mongoose');

const Product = require('../src/models/Product');
const { connectDB, disconnectDB } = require('../src/config/database');

const productsFile = path.resolve(
  __dirname,
  '../../frontend/src/services/products.js'
);

function loadProducts() {
  let source = fs.readFileSync(productsFile, 'utf8');

  // Remove ES module imports
  source = source.replace(
    /^import\s+.*?from\s+['"].*?['"];\s*$/gm,
    ''
  );

  // Replace image imports with simple placeholder values.
  source = source.replace(
    /const imagePool = \[[\s\S]*?\];/,
    'const imagePool = [];'
  );

  // Remove imagePool references from createProduct()
  source = source.replace(
    /images:\s*overrides\.images\.map\(\(index\)\s*=>\s*imagePool\[index\s*-\s*1\]\),/,
    'images: overrides.images || [],'
  );

  source = source.replace(
    /image360:\s*overrides\.image360\s*\?\s*imagePool\[overrides\.image360\s*-\s*1\]\s*:\s*imagePool\[overrides\.images\[0\]\s*-\s*1\],/,
    'image360: overrides.image360 || null,'
  );

  // Convert the export into a normal variable.
  source = source.replace(
    'export const products =',
    'const products ='
  );

  // Remove the helper exports at the bottom.
  source = source.replace(
    /export const getProducts[\s\S]*$/,
    ''
  );

  const context = {};
  vm.createContext(context);

  vm.runInContext(`${source}\nthis.products = products;`, context);

  return context.products;
}

async function importProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log(`Reading products from: ${productsFile}`);

    const products = loadProducts();

    console.log(`Found ${products.length} products.`);

    if (!products.length) {
      throw new Error('No products found in frontend products.js');
    }

    await Product.deleteMany({});

    console.log('Existing products cleared.');

    const inserted = await Product.insertMany(products);

    console.log(`Successfully imported ${inserted.length} products.`);
  } catch (error) {
    console.error('Product import failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

importProducts();