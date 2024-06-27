const Driver = require("../models/driver");

const getDriver=async(req,res)=>{
    const driverId=req.query.id;
    await Driver.findOne({_id: driverId})
    .then((driver)=>{res.send(driver)})
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const getAllDriver=async(req,res)=>{
    await Driver.find()
    .then((driver)=>{res.send(driver)})
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const addDriver=async(req,res)=>{
    const driverData = req.body;
    await Driver.create({...driverData})
    .then((rp)=>res.send("Success!"))
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const updateDriver=async(req,res)=>{
    const reqData = req.body;
    await Driver.updateOne({_id: reqData.id}, {...reqData.upData})
    .then((rp)=>res.send("Success!"))
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const deleteDriver=async(req,res)=>{
    const {driverId} = req.body;
    await Driver.deleteOne({_id: driverId})
    .then((rp)=>res.send("Success!"))
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

module.exports={addDriver, updateDriver,deleteDriver,getDriver, getAllDriver}