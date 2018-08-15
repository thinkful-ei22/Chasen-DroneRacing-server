'use strict';
const express = require('express');

const mongoose= require('mongoose');
const {Drone} = require('../models/drone');
const router = express.Router();

router.get('/:id', (req, res, next) =>{
  // const id = '000000000000000000000001';
  const id = req.params.id;
  
  const findOpp = Drone.aggregate([
    {$match: {_id: {$ne: mongoose.Types.ObjectId(id)}}},
    { $sample: { size: 1 } }]);
  findOpp.then(result=>{ 
    //////DONT WANT RESULT TO BE SAME ID
    // console.log(typeof result[0]._id.toString());
    console.log(result[0]._id.toString());
    console.log(id);
    console.log(id===result[0]._id.toString());
    
    return result;
  })  
    .then(result => {
      res.json(result[0]);
    })
    .catch(err=> next(err));
});

// router.get('/:id', (req, res, next) => {
//   const id = req.params.id;

//   Drone.findOne({_id:id})
//     .then(result => {
//       if (result) {
//         res.json(result);
//       } else {
//         next();
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
// });

router.put('/:id', (req, res, next) => {
  ///drone speed, acc, ect doing to change
  const id = req.params.id;
  console.log(id);
  console.log('...........');
  console.log(req.body);
  
  const { speed, acceleration, turning, weight, drag, durability, handling, pointBalance} = req.body;
  const updateStats = {speed, acceleration, turning, weight, drag, durability, handling, pointBalance};

  console.log(speed, acceleration, turning, weight, drag, durability, handling, pointBalance);
  
  if(pointBalance < 0){
    const err = new Error('Can NOT have a negative point balance');
    err.status = 400;
    console.log('pointbalance error');
    return next(err);
  }
  Drone.findByIdAndUpdate(id, updateStats, {new:true})
    .then(result=>{
      res.json(result);
    })
    .catch(err=> next(err));
});

module.exports = router;