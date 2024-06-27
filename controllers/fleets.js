const express = require('express');
const Fleet = require("../models/fleet");
var MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require('mongodb');
const { vehicle_status } = require("../data/vehicle_status");


const getFleet = async (req, res) => {
    const vehicle_number = req.query.vehicle_number;
    const vehicleNum = req.query.vehiclenum;
    try {
        var data = await mongoconn.db("Fetron2").collection("fleets").findOne({ vehicleNum: vehicleNum });
        // console.log(data);
        res.send(data);
    } catch (error) {
        res.json({ error: "Some error occurred" });
    }
}

const createFleet = async (req, res) => {
    const mongoconn = await MongoClient.connect(
        process.env.MONGO_URL
    );
    const vehicle = req.body.vehicle;
    const fleet = req.body.fleet;
    const fleetData = {
        vehicleNumber: vehicle.vehicleNumber,
        origin: fleet.origin,
        destination: fleet.destination,
        waypoints: fleet.waypoints,
        fleetstatus: {
            available: "false"
        },
        insertedAt: new Date()
    }
    // console.log(fleetData);
    try {
        var data = await mongoconn.db("Fetron2").collection("ERPVehicle").aggregate([
            { $match: { vehicleNumber: vehicle.vehicleNumber } },
            {
                $lookup: {
                    from: "fleets",
                    localField: "current_round",
                    foreignField: "_id",
                    as: "current_fleet"
                }
            }
        ]).toArray();
        data = data[0];
        // console.log(data);
        // console.log(data.current_fleet[0].fleetstatus.available);
        if (data) {
            if (data && data.current_fleet[0] && data.current_fleet[0].fleetstatus.available === "false") {
                return res.status(402).json({ error: "Fleet already created!" });
            }
            // data.current_round=inD.insertedId;
            const inD = await mongoconn.db("Fetron2").collection("fleets").insertOne(fleetData);
            var dd = await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({ vehicleNumber: data.vehicleNumber },
                {
                    $set: { current_round: inD.insertedId, updatedAt: new Date(), UPDTON: [new Date()], current_status: 1 }
                }
            )
            if (dd) {
                // console.log(dd);
                return res.status(200).json({ msg: "DONE" });
            }
        }
        else {
            const inD = await mongoconn.db("Fetron2").collection("fleets").insertOne(fleetData);
            var updVehicle = {
                $set: {
                    ...vehicle, current_round: inD.insertedId, insertedAt: new Date(), updatedAt: new Date(),
                    UPDTON: [new Date()], current_status: 1
                }
            }
            const vehicleCreated = await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({ vehicleNumber: data.vehicleNumber }, { ...updVehicle });
            if (vehicleCreated) {
                // console.log(vehicleCreated);
                return res.status(200).json({ msg: "DONE" });
            }
            else {
                return res.status(402).json({ error: "Some error occurred" });
            }

        }
        // if (data && Object.keys(data).length > 0)  {
        //     if()
        //     return res.status(402).json({ error: "Fleet already created" });
        // }
        // console.log(data);
        // res.send(data);
    } catch (error) {
        console.log(error);
        res.status(402).json({ error: "Some error occurred" });
    }
}

const updateEnroute = async (req, res) => {
    const mongoconn = await MongoClient.connect(
        process.env.MONGO_URL
    );
    var option = req.body.option;

    if (option == 0) {
        var data = req.body.data;
        var vehicleNumber = req.body.vehicleNumber;
        var dataEntered = {}
        var current_round = req.body.current_round;
        try {
            var routeInserted = await mongoconn.db("Fetron2").collection("routes").insertOne(
                {
                    origin: data.origin,
                    destination: data.destination,
                    waypoints: [data.origin],
                    journey_status: true,
                    insertedAt: new Date()
                }
            )
            dataEntered = {
                $set: {
                    "fleetstatus.enroute_for_pickup": routeInserted.insertedId
                }
            }
            // console.log(dataEntered);
            var dd = await mongoconn.db("Fetron2").collection("fleets").findOneAndUpdate({ _id: new ObjectId(current_round) },
                {
                    ...dataEntered
                });
            // console.log(dd);
            var vehUp = await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate(
                { vehicleNumber: vehicleNumber },
                {
                    $set: {
                        current_status: 2,
                        updatedAt: new Date()
                    }
                }
            )
            console.log(vehUp);
            return res.status(200).json({ data: "DONE" });
        } catch (error) {
            return res.status(402).json({ error: "Some error occurred" });
        }
    }
    else if (option == 1) {
        var pickupData = req.body.pickupData;
        var routeId = req.body.routeId;
        var vehicleNumber = req.body.vehicleNumber;

        var dataEntered = {
            $push: { waypoints: pickupData },
            $set: { updatedAt: new Date(), journey_status: false }
        }
        try {
            var dd = await mongoconn.db("Fetron2").collection("routes").findOneAndUpdate(
                { _id: new ObjectId(routeId) },
                {
                    ...dataEntered
                }
            )
            var vehUp = await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate(
                { vehicleNumber: vehicleNumber },
                {
                    $set: {
                        current_status: 3,
                        updatedAt: new Date()
                    }
                }
            )
            return res.status(200).json({ data: "DONE" });
        } catch (error) {
            res.json({ error: "Some error occurred" })
        }
    }
}

const atPickup = async (req, res) => {
    const fleetId = req.body.fleetId;
    const data = req.body.data;
    const vehicleNumber = req.body.vehicleNumber;
    const mongoconn = await MongoClient.connect(
        process.env.MONGO_URL
    );
    try {
        await mongoconn.db("Fetron2").collection("fleets").findOneAndUpdate({
            _id: new ObjectId(fleetId)
        }, {
            $set: {
                "fleetstatus.at_pickup": data
            }
        })
        await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({
            vehicleNumber: vehicleNumber
        }, {
            $set: {
                current_status: 4,
                updatedAt: new Date()
            }
        })
        return res.status(200).json({ data: "DONE" });
    } catch (error) {
        res.status(402).json({ error: "Some error occurred" });
    }
}

const intransit = async (req, res) => {
    const fleetId = req.body.fleetId;
    const data = req.body.data;
    const vehicleNumber = req.body.vehicleNumber;
    const mongoconn = await MongoClient.connect(
        process.env.MONGO_URL
    );
    try {
        await mongoconn.db("Fetron2").collection("fleets").findOneAndUpdate({
            _id: new ObjectId(fleetId)
        }, {
            $set: {
                "fleetstatus.intransit": data
            }
        })
        await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({
            vehicleNumber: vehicleNumber
        }, {
            $set: {
                current_status: 5,
                updatedAt: new Date()
            }
        })
        return res.status(200).json({ data: "DONE" });
    } catch (error) {
        res.status(402).json({ error: "Some error occurred" });
    }
}

const unloadingV = async (req, res) => {
    const fleetId = req.body.fleetId;
    const data = req.body.data;
    const vehicleNumber = req.body.vehicleNumber;
    const mongoconn = await MongoClient.connect(
        process.env.MONGO_URL
    );
    // console.log(fleetId);
    try {
        await mongoconn.db("Fetron2").collection("fleets").findOneAndUpdate({
            _id: new ObjectId(fleetId)
        }, {
            $set: {
                "fleetstatus.unloading": data
            }
        })
        await mongoconn.db("Fetron2").collection("ERPVehicle").findOneAndUpdate({
            vehicleNumber: vehicleNumber
        }, {
            $push: {
                completed_rounds: fleetId,
            },
            $set: {
                current_status: 0,
                current_round: null,
                updatedAt: new Date()
            }
        })
        return res.status(200).json({ data: "DONE" });
    } catch (error) {
        res.status(402).json({ error: "Some error occurred" });
    }
}

const fetchAllTypesCount = async (req, res) => {
    try {
        const mongoconn = await MongoClient.connect(
            process.env.MONGO_URL
        );
        var promises = []
        var data = [];

        const allCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({})
        data.push({ field: "All Vehicles", count: allCount });
        promises.push(allCount);

        const availableCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({
            $or: [
                { current_status: { $eq: 0 } },
                { current_status: { $exists: false } }
            ]
        })
        data.push({ field: "Available", count: availableCount });
        promises.push(availableCount);

        const enrouteForPickupCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({
            $or: [
                { current_status: { $eq: 1 } },
                { current_status: { $eq: 2 } }
            ]
        })
        data.push({ field: "Enroute for pickup", count: enrouteForPickupCount });
        promises.push(enrouteForPickupCount);
        const atPickupCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({ current_status: { $eq: 3 } });
        data.push({ field: "At pickup", count: atPickupCount });
        promises.push(atPickupCount);
        const inTransitCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({ current_status: { $eq: 4 } });
        data.push({ field: "Intransit", count: inTransitCount });
        promises.push(inTransitCount);
        const unloadingCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({ current_status: { $eq: 5 } });
        data.push({ field: "At Unloading", count: unloadingCount });
        promises.push(unloadingCount);
        const completedCount = await mongoconn.db("Fetron2").collection("ERPVehicle").countDocuments({
            completed_rounds: { $exists: true }
        });
        data.push({ field: "Completed", count: completedCount });
        promises.push(completedCount);

        Promise.all(promises).then((rr) => {
            // 
        })

        res.status(200).json({
            data: data,
            obj: {
                all: allCount,
                available: availableCount,
                enrouteForPickup: enrouteForPickupCount,
                atPickup: atPickupCount,
                inTransit: inTransitCount,
                unloading: unloadingCount,
                completed: completedCount
            }
        })
    } catch (error) {
        res.status(402).json({ error: "Some error occurred!" });
    }

}

const getAllFleets = async (req, res) => {
    await Fleet.find()
        .then((fleet) => { res.send(fleet) })
        .catch((err) => { console.log(err); res.json({ error: "Some error occurred" }) });
}

const addFleets = async (req, res) => {
    const fleetData = req.body;
    await Fleet.create({ ...fleetData })
        .then((rp) => res.send("Success!"))
        .catch((err) => { console.log(err); res.json({ error: "Some error occurred" }) });
}

const updateFleets = async (req, res) => {
    const { fleetId, fleetData } = req.body;
    await Fleet.updateOne({ _id: fleetId }, { ...fleetData })
        .then((rp) => res.send("Success!"))
        .catch((err) => { console.log(err); res.json({ error: "Some error occurred" }) });
}




module.exports = {
    addFleets, updateFleets, getFleet, getAllFleets, createFleet, updateEnroute,
    atPickup, intransit, unloadingV, fetchAllTypesCount
}