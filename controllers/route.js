const RouteModel=require("../models/route");


const getRoute=async(req,res)=>{
    const routeId=req.query.id;
    await RouteModel.findOne({_id: routeId})
    .then((route)=>{res.send(route)})
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const getAllRoutes=async(req,res)=>{
    await RouteModel.find()
    .then((route)=>{res.send(route)})
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const addRoute=async(req,res)=>{
    const routeData = req.body;
    await RouteModel.create({...routeData})
    .then((rp)=>res.send("Success!"))
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const updateRoute=async(req,res)=>{
    const reqData = req.body;
    
    await RouteModel.updateOne({_id: reqData.id}, {...reqData.upData})
    .then((rp)=>res.send("Success!"))
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

const deleteRoute=async(req,res)=>{
    const {routeId} = req.body;
    
    await RouteModel.deleteOne({_id: routeId})
    .then((rp)=>res.send("Success!"))
    .catch((err)=>{console.log(err); res.json({error: "Some error occurred"})});
}

module.exports = {addRoute, updateRoute, deleteRoute, getRoute, getAllRoutes}