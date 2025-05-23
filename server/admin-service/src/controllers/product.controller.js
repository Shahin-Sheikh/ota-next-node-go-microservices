const Product = require("../models/product.model");

const getAllProducts = async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
};

const createProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const product = await Product.create({ name, description, price });
  res.status(201).json(product);
};

module.exports = { getAllProducts, createProduct };
