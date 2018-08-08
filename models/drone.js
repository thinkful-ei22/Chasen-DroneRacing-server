'use strict';

const mongoose = require('mongoose');

const droneSchema = mongoose.Schema({
  speed: 'number',
  acceleration: 'number',
  turning: 'number',
  weight: 'number',
  drag: 'number',
  durability: 'number',
  handling: 'number'
  // droneLevel: 'number'
});

const userSchema = mongoose.Schema({
  username: 'string',
  droneId:{type: mongoose.Schema.Types.ObjectId, ref: 'Drone'},
  // level: 'number',
  // wins: 'number',
  // losses: 'number',
  // money: 'number',
  pointBalance: 'number'
});

userSchema.pre('find', function(){
  this.populate('drone');
});

userSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    ret.id = ret._id;
  }
});
droneSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    ret.id = ret._id;
  }
});

let Drone = mongoose.model('Drone', droneSchema);
let User = mongoose.model('User', userSchema);
module.exports = {Drone, User};