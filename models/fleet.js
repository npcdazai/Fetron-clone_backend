const mongoose = require("mongoose");


const GoodsSchema = new mongoose.Schema({
    name: String,
    quantity: String,
    description: String
});

const FleetStatusSchema = new mongoose.Schema({
    available: String,
    enroute_for_pickup: String,
    at_pickup: String,
    intransit: String,
    unloading: String,
    completed: String
});
// if(true==="true")
const FleetSchema = new mongoose.Schema({
    vehicleNumber: String,
    driverIds: [String],
    origin: String,
    destination: String,
    fleetstatus: FleetStatusSchema,
    goods: [GoodsSchema]
}, { timestamps: true });

const fleets = mongoose.model("Fleets", FleetSchema);

module.exports = fleets;