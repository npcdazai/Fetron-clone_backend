const express=require('express');
const router=express.Router();
const {addRoute, updateRoute, deleteRoute, getRoute, getAllRoutes}=require("../controllers/route");

// Controller


router.route("/test").get(async(req,res)=>{
    res.send("hi");
})

router.route("/getroute").get(getRoute);

router.route("/allroutes").get(getAllRoutes);

router.route("/add").post(addRoute);

router.route("/update").post(updateRoute);

router.route("/delete").post(deleteRoute);

module.exports = router;