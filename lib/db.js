import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let collection = null;
async function connectDB() {
  try {
    await dbClient.connect();
    console.log("DB Connected!");
    collection = await dbClient.db("A4").collection("Users");
    return collection;
  }
  catch (err) {
    console.error("Failed to connect to DB:", err);
    return null;
  }
}

export default connectDB;