import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

dotenv.config();

if (!process.env.MONGODB_URI || !process.env.PORT) {
  console.error(
    `Missing required environment variables.\nMake sure you have a .env file in the root directory.\nCheck the .env.example file for an example configuration.`
  );
  process.exit(1);
}
const { MONGODB_URI, PORT } = process.env;

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connection successful");

    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  } catch (err) {
    console.error("Server not running. Error", err.message);
    process.exit(1);
  }
};

startServer();
