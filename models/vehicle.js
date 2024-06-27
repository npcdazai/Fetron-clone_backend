const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    name: String,
    vehicle_number: String,
    capacity: String,
    type: String,
    completed_rounds: [String],
    current_round: String
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);