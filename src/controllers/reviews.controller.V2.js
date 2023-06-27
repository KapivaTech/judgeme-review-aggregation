const dotenv = require("dotenv");
const { fetchReviewsJudgeMe } = require("../helpers/fetchReviewsJudgeMe");
dotenv.config();
const { fetchProductsBGC } = require("../helpers/fetchBigcommerce.products");
const { ReviewsModel } = require("../models/reviews.model");

const postReviews = async () => {
  let productsData = [];
  const waitForMs = (ms) =>
    new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
  // number of concurrent requests in one batch
  const batchSize = 2;
  // request counter
  let curReq = 0;
  let totalPages = 2;
  let products = await fetchProductsBGC(1, productsData, totalPages);
  while (curReq < products.length) {
    // a batch is either limited by the batch size or it is smaller than the batch size when there are less items required
    const end =
      products.length < curReq + batchSize
        ? products.length
        : curReq + batchSize;
    // we know the number of concurrent request so reserve memory for this
    const concurrentReq = new Array(batchSize);
    // issue one request for each item in the batch
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
    // wait until all promises are done or one promise is rejected
    await Promise.all(concurrentReq);
    console.log(`requests ${curReq - batchSize}-${curReq} done.`);
    if (curReq + 1 < products.length) {
      // after requests have returned wait for one second
      console.log(
        `[${new Date().toISOString()}] Waiting for five seconds before sending next requests...`
      );
      await waitForMs(5000);
      console.log(
        `[${new Date().toISOString()}] At least five second has gone.`
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
