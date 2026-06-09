const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB');
  const count = await Listing.countDocuments();
  const sample = await Listing.findOne();
  console.log('count=', count);
  console.log('sample=', sample ? { title: sample.title, price: sample.price, imageType: typeof sample.image, imageVal: sample.image } : null);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
