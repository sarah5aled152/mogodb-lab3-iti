import { MongoClient } from "mongodb";
import { config } from "./config.js";

let client = null;
let db;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(config.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      console.log("Connected to MongoDB");
      db = client.db(config.dbName);
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      throw err;
    }
  }
  return db;
}

export async function closeConnection() {
  if (client) {
    await client.close();
    console.log("Disconnected from MongoDB");
    client = null;
  }
}
