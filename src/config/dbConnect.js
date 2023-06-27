const mongoose=require("mongoose")
require("dotenv").config()
const uri=process.env.MONGO_URI
const dbConnect=async()=>{
    return mongoose.connect(`${uri}/judgeme-reviews-aggregation`)
}

module.exports={dbConnect}