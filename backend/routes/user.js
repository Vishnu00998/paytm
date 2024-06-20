const express=require('express')
const router=express.Router()
const zod=require('zod')
const { User, Account } = require('../db')
const {JWT_SECRET}=require('../config')
const jwt=require("jsonwebtoken")
const { authMiddleware } = require('../middleware')

const schema=zod.object({
username:zod.string().email(),
firstName:zod.string(),
lastName:zod.string(),
password:zod.string().min(8)
})

const signinSchema=zod.object({
    username:zod.string().email(),
    password:zod.string().min(8)
})

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.use(express.json())

router.post("/signup",async (req,res)=>{
    const username=req.body.username
    const firstName=req.body.firstName
    const lastName=req.body.lastName
    const password=req.body.password
    
 const response=schema.safeParse({username:username,
        firstName:firstName,
        lastName:lastName,
        password:password
    })
   console.log(response.data);

    if(!response.success){
        return res.status(400).json({
            msg:"invalid inputs"
        })
    }
    
    const existingUser = await User.findOne({
        username:username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

   const user=await User.create({username:username,
    firstName:firstName,
    lastName:lastName,
    password:password })

  

      await Account.create({
        userId:user._id,
        balance: 1+ Math.random()*10000
      })
    
 
    const token=jwt.sign({userId:user._id},JWT_SECRET)
    
    return res.status(200).json({
        userId:"User created successfully",
        token:token

    })



})

router.post("/signin",async(req,res)=>{

    const username=req.body.username
    const password=req.body.password

    const response=signinSchema.safeParse({username:username,password:password})

    if(!response){
        return res.status(411).json({
            msg:"invalid inputs"
        })
    }

     const user= await User.findOne({username:username,password:password})

     if(!user){
        return  res.status(200).json({
            message:"user not found"
        })
     }
   

     const token=jwt.sign({userId:user._id},JWT_SECRET)

     return res.status(200).json({
        token:token
     })
}) 


router.put("/",authMiddleware,async (req,res)=>{
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })

})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})


module.exports=router