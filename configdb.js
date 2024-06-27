const mongoose = require("mongoose");

var connection;
const connectDB = async () => {
  try {
    connection = await mongoose.connect(process.env.MONGO_URL);
    mongoose.connection.useDb('Fetron2');
    console.log("Database connected");
    // console.log(connection.modelNames());
  } catch (err) {
    console.log(err);
  }
};

const closeConnection = async () => {
  console.log(connection);
  mongoose.connection.close();
};

module.exports = { connectDB, closeConnection };
