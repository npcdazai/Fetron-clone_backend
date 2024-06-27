const express=require('express');
const router=express.Router();
const {addDriver, updateDriver,deleteDriver,getDriver, getAllDriver}=require("../controllers/driver");

// Controller


router.route("/test").get(async(req,res)=>{
    res.send("hi");
})

router.route("/getdriver").get(getDriver);

router.route("/alldrivers").get(getAllDriver);

router.route("/add").post(addDriver);

router.route("/update").post(updateDriver);

router.route("/delete").post(deleteDriver);



module.exports = router;