'use strict';
const express = require('express');

const mongoose= require('mongoose');
const {Drone} = require('../models/drone');
const router = express.Router();

router.get('/:id', (req, res, next) =>{
  
  const id = req.params.id;
  
  const findOpp = Drone.aggregate([
    {$match: {_id: {$ne: mongoose.Types.ObjectId(id)}}},
    { $sample: { size: 1 } }]);
  findOpp.then(result=>{ 
    
    return result;
  })  
    .then(result => {
      res.json(result[0]);
    })
    .catch(err=> next(err));
});


router.put('/:id', (req, res, next) => {
  
  const id = req.params.id;
  
  const { speed, acceleration, turning, weight, drag, durability, handling, pointBalance, user} = req.body;
  const updateStats = {speed, acceleration, turning, weight, drag, durability, handling, pointBalance, user};

  if(pointBalance < 0){
    const err = new Error('Can NOT have a negative point balance');
    err.status = 400;
    return next(err);
  }
  Drone.findByIdAndUpdate(id, updateStats, {new:true})
    .then(result=>{
      res.json(result);
    })
    .catch(err=> next(err));
});

module.exports = router;