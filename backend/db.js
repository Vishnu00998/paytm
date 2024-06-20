const mongoose=require("mongoose")
const { number } = require("zod")
mongoose.connect("mongodb+srv://admin:Zurich@cluster0.uey1a7j.mongodb.net/paytm")

const userSchema=new mongoose.Schema({
    username:String,
    firstName:String,
    lastName:String,
    password:String})

    const accountSchema= new mongoose.Schema({
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        balance:{
         type:Number,
         required:true
        }
    })


const User=mongoose.model('user',userSchema)
const Account=mongoose.model('account',accountSchema)

module.exports={User,Account}
