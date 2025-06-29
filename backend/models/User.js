const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstname:{
    type: String,
    required:true
  },
  middlename:{
    type: String,
    required:false
  },
  lastname:{
    type: String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
   type:String,
   required:true
  },
   gender:{
    type:String,
    required:true
   },
   mobile:{
    type:Number,
    required:true
   },
   address:{
    type:String,
    required:true
   },
    state:{
    type:String,
    required:true
   },
   pin:{
    type:Number,
    required:true
   },
   country:{
    type:String,
    required:true
   },
   cart:{
    type:Array,
    required:false
   },
  date:{
    type:Date,
    default:Date.now
   },

  });
  const User=mongoose.model('users',UserSchema);
  module.exports=User;