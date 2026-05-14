// taskkill /IM node.exe /F

const dns = require("dns");
const mongoose = require("mongoose");
require("dotenv").config();

function useGoogleDns() {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.log("Unable to connect to MongoDB Atlas with default DNS. Retrying with Google DNS...");
    console.error(error);

    useGoogleDns();

    try {
      await mongoose.connect(process.env.DB_URL);
      console.log("Successfully connected to MongoDB Atlas on retry with Google DNS!");
    } catch (retryError) {
      console.log("Retry with Google DNS also failed.");
      console.error(retryError);
    }
  }
}

module.exports = dbConnect;
