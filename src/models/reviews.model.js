const { Schema, model, default: mongoose } = require("mongoose");
const ReviewsSchema=new Schema({
    product_id:{type:String},
    product_SKU:{type:String},
    product_rating:{type:String},
    product_total_reviews:{type:String}
})

const ReviewsModel=model("review",ReviewsSchema)
module.exports={ReviewsModel}