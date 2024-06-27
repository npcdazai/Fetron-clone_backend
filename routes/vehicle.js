const express = require("express");
const router = express.Router();
const Vehicle = require("../models/vehicle");

// Controller
const {
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
} = require("../controllers/vehicle");

router.route("/test").get(async (req, res) => {
  res.send("hi");
});

router.route('/sort').get(sortOutVehicles);
router.route("/getvehicle").get(getVehicle);

router.route("/search").get(searchInput);

router.route("/fetchlive").get(fetchVehicleLive);

router.route("/allvehicles").get(getAllVehicle);

router.route("/oneerp").get(getOneERPVehicle);

router.route("/erpvehicles").get(getERPVehicle);

router.route("/resultvehicles").get(getCompletedVehicle);

router.route("/add").post(addVehicle);

router.route("/update").post(updateVehicle);

router.route("/delete").post(deleteVehicle);

module.exports = router;