const path = require("path");

module.exports = {
  entry: {
    index: "./src/index.js",
    confirmation: "./src/confirmation.js",
    product: "./src/product.js",
    cart: "./src/cart.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist/js"),
  },
};
