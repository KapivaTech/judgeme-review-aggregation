const reviewsRoute = require("./src/routes/reviews.route");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { dbConnect } = require("./src/config/dbConnect");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/judgeme-reviews", reviewsRoute);
app.get("/", (req, res) => {
  res.send("API is running");
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  await dbConnect()
    .then((res) => {
      console.log("Database connected successfuly");
    })
    .catch((err) => {
      console.log("Database connection failed");
    });
  console.log(`server started on http://localhost:${PORT}`);
});
