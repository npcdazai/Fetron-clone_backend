const mongoose = require('mongoose');

const WaypointSchema = new mongoose.Schema({
    latitude: String,
    longitude: String,
    place_name: String,
    time: String
});

const RouteSchema = new mongoose.Schema({
    origin: WaypointSchema,
    destination: WaypointSchema,
    waypoints: [WaypointSchema],
    journey_status: [String]
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);