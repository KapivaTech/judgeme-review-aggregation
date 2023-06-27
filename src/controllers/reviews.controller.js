// const productsData = require("../../products.json");
const CronJob = require("cron").CronJob;
const axios = require("axios");
const dotenv = require("dotenv");
const { ReviewsModel } = require("../models/reviews.model");
dotenv.config();
const shop_domain = process.env.shop_domain;
const api_token = process.env.api_token;
const fs = require("fs");
const { fetchProductsBGC } = require("./fetchBigcommerce.products");
var logger_reviews = fs.createWriteStream("reviews_new_log.txt", {
  flags: "a",
});
var logger_reviews_update = fs.createWriteStream("reviews_update_log.txt", {
  flags: "a",
});
var logger_product_ID = fs.createWriteStream("reviews_product_count_log.txt", {
  flags: "a",
});
var logger_error = fs.createWriteStream("reviews_error_log.txt", {
  flags: "a",
});
const fetchReviews = async () => {
  let productsData = [];
  let total_pages = 4;
  let products = await fetchProductsBGC(1, productsData, total_pages);
  let i = 0;
  const fetchIntervalID = setInterval(() => {
    if (i > products.length - 1) {
      clearInterval(fetchIntervalID);
      return;
    }
    logger_product_ID.write(`\n Product Count : ${JSON.stringify(i + 1)}`);
    fetch(products[i]["id"], products[i]["is_visible"], products[i]["sku"]);
    i++;
  }, 60000);
};

const fetch = async (product_id, product_visibility, product_SKU) => {
  if (!product_visibility) {
    return;
  }
  try {
    axios
      .get(
        `https://judge.me/api/v1/widgets/product_review?api_token=${api_token}&shop_domain=${shop_domain}&external_id=${product_id}`
      )
      .then(async (response) => {
        console.log("fetched successfully:", product_id);
        const longText = response.data.widget.split(" ");
        const rating = longText[3].split("=")[1].split("'")[1];
        const totalReviews = longText[4].split("=")[1].split("'")[1];
        const checkIfExisting = await ReviewsModel.findOne({
          product_id: product_id,
        });
        if (checkIfExisting) {
          try {
            const updateProductReview = await ReviewsModel.updateOne(
              { product_id: product_id },
              {
                $set: {
                  product_rating: rating,
                  product_total_reviews: totalReviews,
                },
              }
            );
            logger_reviews_update.write(
              `\n Product ID :${product_id} updated successfully`
            );
          } catch (e) {
            console.log("failed:", product_id);
            logger_error.write(
              `\n Error caused for product_id :${product_id} : ${JSON.stringify(
                e.message
              )}`
            );
          }
        } else {
          try {
            const newProdcutReview = await ReviewsModel.create({
              product_id: product_id,
              product_SKU: product_SKU,
              product_rating: rating,
              product_total_reviews: totalReviews,
            });
            if (newProdcutReview) {
              logger_reviews.write(
                `\n Product ID :${product_id} created successfully`
              );
            }
          } catch (e) {
            logger_error.write(
              `\n Error caused for product_id :${product_id} : ${JSON.stringify(
                e.message
              )}`
            );
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
        logger_error.write(
          `\n Error caused by judgeme for product_id :${product_id} : ${JSON.stringify(
            err.message
          )}`
        );
      });
  } catch (e) {
    console.log(e.message);
    logger_error.write(
      `\n Error caused by judgeme for product_id :${product_id} : ${JSON.stringify(
        err.message
      )}`
    );
  }
};

// var job = new CronJob(
//   "* 5 17 * * *",
//   function () {
//     let timeStamp = new Date();
//     let day = timeStamp.getDate();
//     let year = timeStamp.getFullYear();
//     let month = timeStamp.getMonth() + 1;
//     let hour = timeStamp.getHours();
//     let minutes = timeStamp.getMinutes();
//     let seconds = timeStamp.getSeconds();
//     logger_cron_job.write(
//       `\n Cron job executed on ${day}-${month}-${year} at ${hour}:${minutes}:${seconds} created successfully`
//     );
//     fetchReviews();
//     job.stop();
//     return;
//   },
//   null,
//   true
// );
module.exports = { fetchReviews, fetch };
