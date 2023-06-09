const { default: axios } = require("axios");
const { ReviewsModel } = require("../models/reviews.model");
const fs = require("fs");
require("dotenv").config();
const logger_error = fs.createWriteStream("error.txt", {
  flags: "a",
});
const fetchReviewsJudgeMe = async (
  product_id,
  product_visibility,
  product_SKU
) => {
  // if (!product_visibility) {
  //   return;
  // }
  try {
    axios
      .get(
        `https://judge.me/api/v1/widgets/product_review?api_token=${process.env.api_token}&shop_domain=${process.env.shop_domain}&external_id=${product_id}`
      )
      .then(async (response) => {
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
            console.log("success", product_id, product_SKU);
            // logger_reviews_update.write(
            //   `\n Product ID :${product_id} updated successfully`
            // );
          } catch (e) {
            // logger_error.write(
            //   `\n Error caused for product_id :${product_id} : ${JSON.stringify(
            //     e.message
            //   )}`
            // );
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
              console.log("success", product_id, product_SKU);
              //   logger_reviews.write(
              //     `\n Product ID :${product_id} created successfully`
              //   );
            }
          } catch (e) {
            console.error(
              e.message,
              "product ID:",
              product_id,
              "-",
              product_SKU
            );
            // logger_error.write(
            //   `\n Error caused for product_id :${product_id} : ${JSON.stringify(
            //     e.message
            //   )}`
            // );
          }
        }
      })
      .catch((err) => {
        console.error(err.message, "product ID:", product_id, "-", product_SKU);
        logger_error.write(
          `\n Error caused by judgeme for product_id :${product_id}-${product_SKU} : ${JSON.stringify(
            err.message
          )}`
        );
      });
  } catch (e) {
    console.error(e.message, "product ID:", product_id, "-", product_SKU);
    logger_error.write(
      `\n Error caused by judgeme for product_id ::${product_id}-${product_SKU} : ${JSON.stringify(
        err.message
      )}`
    );
  }
};

module.exports = { fetchReviewsJudgeMe };
