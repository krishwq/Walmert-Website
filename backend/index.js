const ConnectToMongo=require('./db');
const express = require('express');
var cors=require('cors');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

ConnectToMongo();
const app = express()
const port = 5000
app.use(cors()) 
app.use(express.json())

app.use('/api/auth',require('./routes/auth'));



app.listen(port, () => {
  console.log(`iNotebook backend listening on port http://localhost:${port}`)
})