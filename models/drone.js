'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const droneSchema = mongoose.Schema({
  speed: {type:'number', default: 75},
  acceleration: {type:'number', default: 75},
  turning: {type:'number', default: 75},
  weight: {type:'number', default: 75},
  drag: {type:'number', default: 75},
  durability: {type:'number', default: 75},
  handling: {type:'number', default: 75},
  pointBalance: {type:'number', default: 0}
  // droneLevel: 'number'
});

const userSchema = mongoose.Schema({
  firstName: 'string',
  username: {type:String, unique:true, required:true},
  droneId:{type: mongoose.Schema.Types.ObjectId, ref: 'Drone'},
  password: {type:String, required:true}
  // level: 'number',
  // wins: 'number',
  // losses: 'number',
  // money: 'number'
});

userSchema.pre('find', function(){
  this.populate('droneId');
});

userSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.password;
  }
});
droneSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    ret.id = ret._id;
  }
});

userSchema.methods.validatePassword = function (password){
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

let Drone = mongoose.model('Drone', droneSchema);
let User = mongoose.model('User', userSchema);
module.exports = {Drone, User};