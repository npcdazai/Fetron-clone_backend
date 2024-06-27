const express = require("express");
const Vehicle = require("../models/vehicle");
const mongoose = require("mongoose");
const { connectDB, closeConnection } = require("../configdb");
const { findOne, findById } = require("../models/fleet");
var MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require('mongodb');
const { vehicle_status } = require("../data/vehicle_status");


const sortOutVehicles = async (req, res) => {
  // ----Code for updating ERP database----
  // var MongoClient = require("mongodb").MongoClient;
  // const mongoconn = await MongoClient.connect(
  //   process.env.MONGO_URL
  // );
  // var data = await mongoconn.db("ERP").collection("Vehicle").aggregate([
  //   {
  //     '$group': {
  //       '_id': '$VEHNO',
  //       'UPDTON': { '$addToSet': '$UPDTON' },
  //       'data': { '$first': '$$ROOT' }

  //     }
  //   },
  //   {
  //     '$sort': {
  //       UPDTON: -1
  //     }
  //   },
  //   {
  //     '$match': {
  //       VEHNO: { $ne: "TEST" }
  //     }
  //   },
  //   // {
  //   //   '$distinct'
  //   // }
  // ]).toArray();
  // await mongoconn.db("Fetron2").collection("ERPVehicle").insertMany(data, { ordered: true });
  // await mongoconn.db("Fetron2").collection("ERPVehicle").createIndex({ "UpdateOn": -1 }, { name: "vehicle_index" })
  // console.log(data[0].VEHNO);
  res.send("hello");
}

async function searchInput(req, res) {
  try {
    var MongoClient = require("mongodb").MongoClient;
    const mongoconn = await MongoClient.connect(
      process.env.MONGO_URL
    );
    const searchQuery = req.query.search;
    var data = await mongoconn.db("Fetron2").collection("ERPVehicle").aggregate([
      {
        $match: {
          vehicleNumber: { $regex: searchQuery }
        }
      },
    ]
    )
      .toArray();

    // return data;
    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Some error occurred in search.." });
  }

}



async function fetchERPWithSkip(mongoconn, qq, skipParm) {

  var data = await mongoconn.db("Fetron2").collection("ERPVehicle").aggregate([
    {
      $lookup: {
        from: "fleets",
        localField: "current_round",
        foreignField: "_id",
        as: "current_fleet"
      },
    },
    qq,
    {
      $sort: { updatedAt: -1 }
    },
    {
      '$skip': skipParm,
    },
    {

      '$limit': 10
    },

  ]
  )
    .toArray();

  return data;
}

const fetchVehicleLive = async (req, res) => {
  const vehicleNumber = req.query.vehicleNumber;
  try {
    const mongoconn = await MongoClient.connect(
      process.env.MONGO_URL
    );
    const data = await mongoconn.db("Fetron2").collection("live_data").find({ vname: vehicleNumber }).toArray();
    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Some internal error occurred" });
  }
}

const getOneERPVehicle = async (req, res) => {
  const vehicleNumber = req.query.vnum;
  try {
    const mongoconn = await MongoClient.connect(
      process.env.MONGO_URL
    );
    var data = await mongoconn.db("Fetron2").collection("ERPVehicle").aggregate([
      {
        $lookup: {
          from: "fleets",
          localField: "current_round",
          foreignField: "_id",
          as: "current_fleet"
        },
      },
      {
        $match: {
          vehicleNumber: vehicleNumber
        }
      },
    ]
    )
      .toArray();
    if (data.length > 0) {
      var vehicle = data[0];
      if (vehicle && vehicle.current_fleet && vehicle.current_fleet.length > 0 && vehicle.current_fleet[0].fleetstatus
        && Object.keys(vehicle.current_fleet[0].fleetstatus).length > 0
      ) {
        if (vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) {
          var promise = await mongoconn.db("Fetron2").collection("routes").findOne({ _id: new ObjectId(vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) })
            .then((dd) => {
              vehicle.current_fleet[0].fleetstatus.enroute_for_pickup = dd;
              // data[i] = vehicle;
              // return vehicle;
            })
          // promises.push(promise);
          // data[i] = vehicle;
        }
      }
      res.status(200).json({ data: vehicle });
    }
    else {
      res.status(400).json({ error: "No data" })
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Some internal error occurred" });
  }
}

const getERPVehicle = async (req, res) => {

  try {
    var isAll = req.query.isall;

    var skipParm = Number(req.query.skip);
    if (!skipParm) {
      skipParm = 0;
    }
    var status = req.query.status;
    if (!status) {
      status = "available";
    }


    //Note-Remaining | compare query status through array of vehicle status, if not present -> return error 

    const mongoconn = await MongoClient.connect(
      process.env.MONGO_URL
    );
    var qq;
    var dataCount;
    if (status == "available") {
      qq = {
        $match: {
          $or: [
            { current_fleet: { $eq: [] } },
            { current_status: { $eq: 0 } }
          ]
        }
      }
      dataCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({
        $or: [
          { current_status: { $exists: false } },
          { current_status: { $eq: 0 } }
        ]

      })
    }
    else if (status == "all") {
      qq = {
        $match: {
          // $or: [
          //   { current_status: { $exists: false } },
          //   { current_status: { $ne: 100 } }
          // ]
          // current_status: { $ne: 100 }
        }
      }
      dataCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({
        $or: [
          { current_status: { $exists: false } },
          { current_status: { $ne: 100 } }
        ]
        // current_status: { $ne: 100 }
      })
    }
    else {

      if (!vehicle_status.includes(status)) {
        return res.status(402).json({ error: "Invalid status" });
      }
      var ccstatus = vehicle_status.indexOf(status);
      if (ccstatus == 1 || ccstatus == 2) {
        qq = {
          $match: {
            $or: [
              { current_status: { $eq: 1 } },
              { current_status: { $eq: 2 } }
            ]
          }
        }
        dataCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({
          $or: [
            { current_status: { $eq: 1 } },
            { current_status: { $eq: 2 } }
          ]
        })
      }
      else if (ccstatus == 6) {
        qq = {
          $match: {
            completed_rounds: { $exists: true }
          }
        }
        dataCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({ completed_rounds: { $exists: true } })
      }
      else {
        qq = {
          $match: {
            current_status: { $eq: ccstatus }
          }
        }
        dataCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({ current_status: { $eq: ccstatus } })
      }
    }
    // console.log(qq);
    // console.log(qq);
    var data = await fetchERPWithSkip(mongoconn, qq, skipParm);
    // console.log(data);
    var promises = [];



    for (var i = 0; i < data.length; i++) {

      var vehicle = data[i];

      if (!vehicle.updatedAt) {
        var p2 = await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({ vehicleNumber: vehicle.vehicleNumber },
          {
            $set: {
              updatedAt: new Date()
            }
          }
        )
        promises.push(p2);
      }



      // console.log(vehicle);
      var prom2 = await mongoconn.db("Fetron2").collection("live_data2").find({ vehicleNumber: vehicle.vehicleNumber }).toArray()
        .then((live_d) => {
          if (live_d.length) {
            var ld = live_d[0].data;
            var current_location = ld[ld.length - 1];
            // console.log(current_location);
            if (current_location) {
              vehicle.current_location = current_location;
            }
            vehicle.vehicle_path = ld;
            data[i] = vehicle;
          }
          // console.log(ld);
          // console.log(live_d);

          // console.log(current_location);
        })
      promises.push(prom2);
      if (vehicle && vehicle.current_fleet && vehicle.current_fleet.length > 0 && vehicle.current_fleet[0].fleetstatus
        && Object.keys(vehicle.current_fleet[0].fleetstatus).length > 0
      ) {
        if (vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) {
          var promise = await mongoconn.db("Fetron2").collection("routes").findOne({ _id: new ObjectId(vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) })
            .then((dd) => {
              vehicle.current_fleet[0].fleetstatus.enroute_for_pickup = dd;
              data[i] = vehicle;
              // return vehicle;
            })
          promises.push(promise);
          // data[i] = vehicle;
        }
      }
    };

    Promise.all(promises).then((rr) => {
      // pass
    })

    // var dataCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments()

    // console.log(data[0].VEHNO);
    return res.status(200).json({ dataCount: dataCount, data: data });
    //   console.log(error);
    //   res.status(500).json({ error: "Some internal error occurred" });
    // }

    // const ERPVehicles = await mongoose.connection.model("Vehicle").find();
    // console.log(ERPVehicles);
    // await mongoose.connection.close();
    // var conn = new MongoClient(
    //   "mongodb+srv://data_IT:data_IT@apml.6w5pyjg.mongodb.net"
    // );
    // await conn.connect();
    // db = await conn.db("ERP");

    // const VehColl = await db.collection("Vehicle");
    // mongoose.connection.close();
    // const Veh2 = mongoose.model("Vehicle");
    // console.log(VehColl);
    // console.log(VehColl);
    // const data = await VehColl.find();
    // console.log(data);
    // await mongoose.connection.close();
    // connectDB();
    // mongoose.connection.useDb('Fetron2');
    // return res.json({ data: [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error occurred, please try again" });
  }
};


const getVehicle = async (req, res) => {
  const vehicleNum = req.query.vehiclenum;

  await Vehicle.findOne({ vehicleNumber: vehicleNum })
    .then((vehicle) => {
      console.log(vehicle);
      res.send(vehicle);
    })
    .catch((err) => {
      console.log(err);
      res.json({ error: "Some error occurred" });
    });
};

const getAllVehicle = async (req, res) => {
  // const status = "available";

  console.log("API is called");
  try {
    const mongoconn = await MongoClient.connect(
      process.env.MONGO_URL
    );
    console.log("DB connected");
    var data = await mongoconn.db("Fetron2").collection("ERPVehicle").aggregate([
      {
        $lookup: {
          from: "fleets",
          localField: "current_round",
          foreignField: "_id",
          as: "current_fleet"
        },
      },
      {
        $sort: { updatedAt: -1 }
      },
    ]).toArray();

    console.log("All vehicles data fetched");

    var promises = [];


    console.log("Fetching individual vehicle live data");
    for (var i = 0; i < data.length; i++) {

      var vehicle = data[i];

      // if (!vehicle.updatedAt) {
      //   var p2 = await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({ vehicleNumber: vehicle.vehicleNumber },
      //     {
      //       $set: {
      //         updatedAt: new Date()
      //       }
      //     }
      //   )
      //   promises.push(p2);
      // }



      // console.log(vehicle);
      var prom2 = await mongoconn.db("Fetron2").collection("live_data2").find({ vehicleNumber: vehicle.vehicleNumber }).toArray()
        .then((live_d) => {
          if (live_d.length) {
            var ld = live_d[0].data;
            // console.log(ld);
            var current_location = ld[ld.length - 1]
            // console.log(current_location);
            if (current_location) {
              vehicle.current_location = current_location
            }
            vehicle.vehicle_path = ld;
            data[i] = vehicle;
          }

          // console.log(current_location);
        })
      promises.push(prom2);
      // if (vehicle && vehicle.current_fleet && vehicle.current_fleet.length > 0 && vehicle.current_fleet[0].fleetstatus
      //   && Object.keys(vehicle.current_fleet[0].fleetstatus).length > 0
      // ) {
      //   if (vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) {
      //     var promise = await mongoconn.db("Fetron2").collection("routes").findOne({ _id: new ObjectId(vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) })
      //       .then((dd) => {
      //         vehicle.current_fleet[0].fleetstatus.enroute_for_pickup = dd;
      //         data[i] = vehicle;
      //         // return vehicle;
      //       })
      //     promises.push(promise);
      //     // data[i] = vehicle;
      //   }
      // }
    };
    Promise.all(promises).then((rr) => {
      // pass
      console.log("Fetching individual vehicle live data - completed");
    })
    data.forEach((el, i) => {

    })
    console.log("Success!");
    return res.status(200).json({ data: data });
  } catch (error) {
    return res.status(402).json({ error: "Error occurred while fetching vehicles" });
  }


  // await Vehicle.find()
  //   .then((vehicle) => {
  //     res.send(vehicle);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.json({ error: "Some error occurred" });
  //   });
};

const getCompletedVehicle = async (req, res) => {
  // const status = "available";

  console.log("API is called");
  try {
    const mongoconn = await MongoClient.connect(process.env.MONGO_URL);
    console.log("DB connected all vehicle");

    const db = mongoconn.db("Fetron2");
    const collection = db.collection("ERPVehicle");
    //   const aggregationPipeline = [
    //     {
    //       $set: {
    //         lastCompletedRound: { $arrayElemAt: ["$completed_rounds", -1] }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "fleets",
    //         localField: "lastCompletedRound",
    //         foreignField: "_id",
    //         as: "matchedRoundsss"
    //       }
    //     },
    // ]
    const aggregationPipeline = [
      {
        $addFields: {
          newField: {
            $toObjectId: {
              $arrayElemAt: ["$completed_rounds", -1],
            },
          },
        },
      },
      {
        $lookup: {
          from: "fleets",
          localField: "newField",
          foreignField: "_id",
          as: "result",
        },
      },
    ];
    var data = await collection.aggregate(aggregationPipeline).toArray();

    console.log("All vehicles data fetched");

    var promises = [];

    console.log("Fetching individual vehicle live data");
    for (var i = 0; i < data.length; i++) {
      var vehicle = data[i];

 
      var prom2 = await mongoconn
        .db("Fetron2")
        .collection("live_data2")
        .find({ vehicleNumber: vehicle.vehicleNumber })
        .toArray()
        .then((live_d) => {
          if (live_d.length) {
            var ld = live_d[0].data;
            // console.log(ld);
            var current_location = ld[ld.length - 1];
            // console.log(current_location);
            if (current_location) {
              vehicle.current_location = current_location;
            }
            vehicle.vehicle_path = ld;
            data[i] = vehicle;
          }

          // console.log(current_location);
        });
      promises.push(prom2);
      // if (vehicle && vehicle.current_fleet && vehicle.current_fleet.length > 0 && vehicle.current_fleet[0].fleetstatus
      //   && Object.keys(vehicle.current_fleet[0].fleetstatus).length > 0
      // ) {
      //   if (vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) {
      //     var promise = await mongoconn.db("Fetron2").collection("routes").findOne({ _id: new ObjectId(vehicle.current_fleet[0].fleetstatus.enroute_for_pickup) })
      //       .then((dd) => {
      //         vehicle.current_fleet[0].fleetstatus.enroute_for_pickup = dd;
      //         data[i] = vehicle;
      //         // return vehicle;
      //       })
      //     promises.push(promise);
      //     // data[i] = vehicle;
      //   }
      // }
    }
    Promise.all(promises).then((rr) => {
      // pass
      console.log("Fetching individual vehicle live data - completed");
    });
    data.forEach((el, i) => {});
    console.log("Success!");
    return res.status(200).json({ data: data });
  } catch (error) {
    return res
      .status(402)
      .json({ error: "Error occurred while fetching vehicles" });
  }

  // await Vehicle.find()
  //   .then((vehicle) => {
  //     res.send(vehicle);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.json({ error: "Some error occurred" });
  //   });
};


const addVehicle = async (req, res) => {
  const vehicleData = req.body;
  await Vehicle.create({ ...vehicleData })
    .then((rp) => res.send("Success!"))
    .catch((err) => {
      console.log(err);
      res.json({ error: "Some error occurred" });
    });
};

const updateVehicle = async (req, res) => {
  const reqData = req.body;

  await Vehicle.updateOne({ _id: reqData.id }, { ...reqData.upData })
    .then((rp) => res.send("Success!"))
    .catch((err) => {
      console.log(err);
      res.json({ error: "Some error occurred" });
    });
};

const deleteVehicle = async (req, res) => {
  const { vehicleId } = req.body;

  await Vehicle.deleteOne({ _id: vehicleId })
    .then((rp) => res.send("Success!"))
    .catch((err) => {
      console.log(err);
      res.json({ error: "Some error occurred" });
    });
};

module.exports = {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicle,
  getAllVehicle,
  getERPVehicle,
  sortOutVehicles,
  getOneERPVehicle,
  fetchVehicleLive,
  searchInput,
  getCompletedVehicle
};
