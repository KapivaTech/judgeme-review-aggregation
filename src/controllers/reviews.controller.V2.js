const dotenv = require("dotenv");
const { fetchReviewsJudgeMe } = require("../helpers/fetchReviewsJudgeMe");
dotenv.config();
const { fetchProductsBGC } = require("../helpers/fetchBigcommerce.products");
const { ReviewsModel } = require("../models/reviews.model");

const postReviews = async () => {
  let productsData = [];
  const delayInMS = (ms) =>
    new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
  const batchSize = 2;
  let curReq = 0;
  let totalPages = 2;
  let products = await fetchProductsBGC(1, productsData, totalPages);
  while (curReq < products.length) {
    const end =
      products.length < curReq + batchSize
        ? products.length
        : curReq + batchSize;
    const concurrentReq = new Array(batchSize);
    for (let index = curReq; index < end; index++) {
      concurrentReq.push(
        fetchReviewsJudgeMe(
          products[index]["id"],
          products[index]["is_visible"],
          products[index]["sku"]
        )
      );
      console.log(`sending request ${curReq}...`);
      curReq++;
    }
    await Promise.all(concurrentReq);
    console.log(`requests ${curReq - batchSize}-${curReq} done.`);
    if (curReq + 1 < products.length) {
      console.log(
        `[${new Date().toLocaleString()}] Waiting for five seconds before sending next requests...`
      );
      await delayInMS(5000);
      console.log(
        `[${new Date().toLocaleString()}] At least five second has gone.`
      );
    }
  }
};

const getReviewsById = async (product_id) => {
  let response = {};
  try {
    const review = await ReviewsModel.find({ product_id: product_id });
    if (review.length > 0) {
      response = {
        message: "review fetched successfully",
        data: review[0],
        statusCode: 200,
        success: true,
      };
    } else {
      response = {
        message: "invalid product Id or product does not exist",
        statusCode: 404,
        success: false,
      };
    }
  } catch (err) {
    response = { message: err.message, statusCode: 404, success: false };
  }
  return response;
};
module.exports = { postReviews, getReviewsById };
