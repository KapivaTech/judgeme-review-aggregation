const express = require("express");
const route = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");

const {
  postReviews,
  getReviewsById,
} = require("../controllers/reviews.controller.V2");

/*CACHE PRODUCT REVIEW*/
route.post("/cache-reviews", async (req, res) => {
  const response = postReviews();
  res.status(202).send({
    message: "caching reviews started",
  });
});

/*READ ALL PRODUCT REVIEW*/
route.get("/getAll", async (req, res) => {
  res.status(403).send({ message: "invalid request" });
});

/*READ PARTICULAR PRODUCT REVIEW*/
route.get("/get-review", async (req, res) => {
  const { product_id } = req.query;
  const response = await getReviewsById(product_id);
  if (response.success) {
    res.status(response.statusCode).send(response);
  } else {
    res.status(response.statusCode).send(response);
  }
});

/*UPDATE PRODUCT REVIEW*/
route.patch("/update-review/:id", (req, res) => {
  res.status(403).send({ message: "invalid request" });
});

/*REMOVE PRODUCT REVIEW*/
route.delete("/delete-review/:id", (req, res) => {
  res.status(403).send({ message: "invalid request" });
});

module.exports = route;
