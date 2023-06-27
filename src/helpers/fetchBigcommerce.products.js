const dotenv = require("dotenv");
const axios = require("axios");
const bgc_api_url = process.env.bgc_api_url;
const kp_x_auth_token = process.env.kp_x_auth_token;
const store_hash = process.env.store_hash;

const fetchProductsBGC = async (currPage, productsData, totalPages) => {
  if (currPage > totalPages) {
    return;
  } else {
    await axios
      .get(
        `${bgc_api_url}${store_hash}/v3/catalog/products?limit=250&page=${currPage}`,
        {
          headers: {
            "X-Auth-Token": kp_x_auth_token,
          },
        }
      )
      .then(async (res) => {
        const data = res.data.data;
        totalPages = res.data.meta.pagination.totalPages;
        productsData.push(...data);
        return await fetchProductsBGC(currPage + 1, productsData, totalPages);
      })
      .catch(async (err) => {
        console.log(err.message, "error");
        let newProductsData = [...productsData];
        return newProductsData;
      });
  }
  return productsData;
};

module.exports = { fetchProductsBGC };
