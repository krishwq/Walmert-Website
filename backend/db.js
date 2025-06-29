require('dotenv').config(); 
const mongoURI = process.env.MONGO_URI;
const mongoose=require('mongoose');

const ConnectToMongo=()=>{
    mongoose.connect(mongoURI,).then(()=>console.log("connected"))
}
module.exports=ConnectToMongo