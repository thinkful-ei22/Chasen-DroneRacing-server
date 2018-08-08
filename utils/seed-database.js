'use strict';
const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const {User, Drone} = require('../models/drone');

const seedUsers = require('../db/seed/users');
const seedDrones = require('../db/seed/drones');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
mongoose.connect(DATABASE_URL)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([

      User.insertMany(seedUsers),
      Drone.insertMany(seedDrones),
      Drone.createIndexes()

    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });