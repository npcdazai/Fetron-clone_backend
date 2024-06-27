require("dotenv").config();

// imports
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./configdb");
const fleet_routes = require("./routes/fleets");
const vehicle_routes = require("./routes/vehicle");
const driver_routes = require("./routes/driver");
const { default: axios } = require("axios");
const { exec } = require('child_process');

const cron = require('node-cron');


// Connect Database
connectDB();

// console.log(process.env.MONGO_URL);
const pythonFilePath = path.join(__dirname, "python/index.py");
// console.log(pythonFilePath);



const app = express();
const port = 5050;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ credentials: true, origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL1, process.env.FRONTEND_URL2] }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/y/fleets", fleet_routes);
app.use("/y/vehicle", vehicle_routes);
app.use("/y/driver", driver_routes);





// while (true) {

// setTimeout(() => {
// cron.schedule('* * * * *', () => {
//   console.log("\n--------------------------------------------------");
//   const dd = new Date();
//   console.log(`${dd}  -  Python file executing...`);
//   const command = `python3 ${pythonFilePath}`;
//   try {
//     exec(command, (error, stdout, stderr) => {
//       const dd = new Date();
//       console.log(`${dd}  -  Python file executed....`);
//       if (error) {
//         console.error(`Error: ${error.message}`);
//         return;
//       }
//       if (stderr) {
//         console.error(`stderr: ${stderr}`);
//         setTimeout(() => { }, 60000)
//         return;
//       }
//       console.log(`Logs: ${stdout}`);
//     })
//   } catch (error) {
//     console.log(error);
//   }

// })
// console.log("--------------------------------------------------");
// }, 60000)



// setTimeout(async () => {
//   console.log("\n--------------------------------------------------");
//   console.log("Fetching data from API...");
//   try {
//     await axios.get(`http://203.115.101.54/mobileapp/vehilestatus_api.php?token=54478`)
//       .then(async (res) => {
//         // console.log(res.data);
//         // console.log(res.data);
//         console.log("Data Fetched...");
//         const ttdata = res.data;
//         ttdata.replace("\\\\\n", "");
//         ttdata.replace("\\\\n", "");
//         ttdata.replace("\\\n", "");
//         ttdata.replace("\\n", "");
//         ttdata.replace("\n", "");


//         const jsonData = JSON.parse(ttdata);
//         console.log("Data Parsed...");
//         var MongoClient = require("mongodb").MongoClient;
//         const mongoconn = await MongoClient.connect(
//           process.env.MONGO_URL
//         );
//         // const searchQuery = req.query.search;
//         console.log("Inserting data into database...");
//         var data = await mongoconn.db("Fetron2").collection("live_data").insertMany(jsonData);
//         if (data) {
//           console.log("Successfully Inserted");
//         }
//         else {
//           console.log("Some error occurred in inserting data!!");
//         }
//         console.log("--------------------------------------------------");
//       })
//   } catch (error) {
//     console.log(error);
//   }
// }, 1000)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
