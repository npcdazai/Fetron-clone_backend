const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    name: String,
    contact: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    type: String,
    current_fleet: String,
    fleets_done: [String]
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);