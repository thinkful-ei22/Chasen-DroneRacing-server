'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose= require('mongoose');
const {User, Drone} = require('./models/drone');



const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const { dbConnect } = require('./db-mongoose');


const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// // Create a static webserver
// app.use(express.static('public'));
// // Parse request body
// app.use(express.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/drone/', (req, res, next) =>{
  const id = ObjectId('000000000000000000000001');
  // const id = req.params.id;
  
  const findOpp = Drone.aggregate([
    {$match: {_id: id}}]);
    // { $sample: { size: 1 } }]);
  findOpp.then(result=>{ 
    //////DONT WANT RESULT TO BE SAME ID
    // console.log(typeof result[0]._id.toString());
    console.log(result[0]._id.toString());
    console.log(id);
    console.log(id===result[0]._id.toString());
    
    return result;
  })  
    .then(result => {
      res.json(result);
    })
    .catch(err=> next(err));
});

app.put('/api/drone/:id', (req, res, next) => {
  ///drone speed, acc, ect doing to change
  const id = req.params.id;
  const{speed, acceleration, turning, weight, drag, durablity, handling, pointBalance} = req.body;
  const updateStats = {speed, acceleration, turning, weight, drag, durablity, handling};

  if(pointBalance < 0){
    const err = new Error('Can NOT have a negative point balance');
    return next(err);
  }
  Drone.findByIdAndUpdate(id, updateStats, {new:true})
    .then(result=>{
      res.json(result);
    })
    .catch(err=> next(err));
});


// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
if (process.env.NODE_ENV !== 'test') {
  // Connect to DB and Listen for incoming connections
  mongoose.connect(DATABASE_URL)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(`Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`);
    })
    .catch(err => {
      console.error(err);
    });

}

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
