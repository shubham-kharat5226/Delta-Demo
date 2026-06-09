const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");
  await initDB();
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a1ebf7c892ca2e71e68414c",
  }));
  await Listing.insertMany(initData.data);
  console.log("initialized with data");
};

main().catch((err) => {
  console.error("Error:", err);
});
