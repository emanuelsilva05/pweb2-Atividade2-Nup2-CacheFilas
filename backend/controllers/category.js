
const { Category, Product } = require('../models');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../config/nodemailer');
const authMiddleware = require('../middlewares/auth');
const cache = require('../middlewares/cache'); // Configuração de cache (Redis)
const queue = require('../queues/categoryQueue'); // Configuração de filas (Bull)

/**
 * Criação de Categoria usando Fila
 */
const createCategory = async (req, res) => {
  try {
    // Adiciona a tarefa de criação na fila
    await queue.add('createCategory', req.body);
    return res.status(202).json({ message: 'Criação da categoria em processamento.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Listagem de Categorias com Cache
 */
const getAllCategories = async (req, res) => {
  try {
    const cachedCategories = await cache.get('categories');

    if (cachedCategories) {
      return res.status(200).json(JSON.parse(cachedCategories));
    }

    const categories = await Category.findAll({ order: [['createdAt', 'DESC']] });

    // Armazena no cache por 10 minutos
    await cache.set('categories', JSON.stringify(categories), 'EX', 600);

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * Atualização de Categoria usando Fila
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await queue.add('updateCategory', { id, ...req.body });
    return res.status(202).json({ message: 'Atualização da categoria em processamento.' });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
};