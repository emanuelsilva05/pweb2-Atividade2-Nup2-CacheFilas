// Atualizações no productController.js
const { Product } = require('../models');
const multer = require('multer');
const uploadToCloudinary = require('../middlewares/upload-cloud');
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require('uuid');
const cache = require('../middlewares/cache');
const queue = require('../queues/productQueue');

/**
 * Criação de Produto usando Fila
 */
const createProduct = async (req, res) => {
  try {
    // Adiciona a tarefa de criação na fila
    await queue.add('createProduct', req.body);
    return res.status(202).json({ message: 'Criação do produto em processamento.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Listagem de Produtos com Cache
 */
const getAllProducts = async (req, res) => {
  try {
    const cachedProducts = await cache.get('products');

    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });

    // Armazena no cache por 10 minutos
    await cache.set('products', JSON.stringify(products), 'EX', 600);

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Atualização de Produto usando Fila
 */
const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    await queue.add('updateProduct', { id, ...req.body });
    return res.status(202).json({ message: 'Atualização do produto em processamento.' });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  updateProductById,
};