const express = require('express');
const router = express.Router();
const { addFleets, updateFleets, getFleet, getAllFleets, createFleet, updateEnroute,
    atPickup, intransit, unloadingV, fetchAllTypesCount
} = require("../controllers/fleets");

// Controller


router.route("/test").get(async (req, res) => {
    res.send("hi");
})

router.route("/createtrip").post(createFleet);

router.route("/getFleet").get(getFleet);

router.route("/updateEnroute").post(updateEnroute);

router.route("/atpickup").post(atPickup);

router.route("/intransit").post(intransit);

router.route("/unloading").post(unloadingV);

router.route("/allfleets").get(getAllFleets);

router.route("/add").post(addFleets);

router.route("/update").post(updateFleets);

router.route('/getfleetcounts').get(fetchAllTypesCount);



module.exports = router;