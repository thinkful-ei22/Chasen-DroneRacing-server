'use strict';

const express = require('express');
const mongoose= require('mongoose');
const {User, Drone} = require('../models/drone');

const router = express.Router();

router.post('/', (req, res, next) =>{
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  let {username, password, firstName} = req.body;
  
  if (missingField){
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'firstName'];
  const nonStringFields = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string' 
  );

  if (nonStringFields){
    const err = new Error(`Incorrect field type: ${nonStringFields} must be string`);
    err.status = 422;
    return next(err);
  }
    
  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedFields = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedFields){
    const err = new Error(`Need to remove whitespace in ${nonTrimmedFields}`);
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 6, max: 72 }
  };
  const tooSmallFields = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeFields = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallFields){
    const err = new Error (`Field: ${tooSmallFields} must be at least ${sizedFields[tooSmallFields].min} characters long`)
    err.status = 422;
    return next(err);
  }
  if (tooLargeFields){
    const err = new Error (`Field: ${tooLargeFields} must be at most ${sizedFields[tooLargeFields].max} characters long`);
    err.status = 422;
    return next(err);
  }
  let digest;
  User.find({username})      
    .count()
    .then(count => {
      if(count > 0){
        return Promise.reject({
          code: 400,
          reason: 'ValidationError',
          message: `Username ${username} already exist, please pick a new one`,
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(_digest => {
      digest = _digest;
      return Drone.create({});
    })
    .then(drone => {
      const newUser = {
        firstName,
        username, 
        droneId: drone._id,
        password: digest
      };
      return User.create(newUser);
    })
    .then(result => {
      res.status(201).location(`/api/users/${result.id}`).json(result); 
    })
    .catch(err =>{
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err); 
      }
      next(err);
    });
    
});

module.exports = router;