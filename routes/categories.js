const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories - Listar todas as categorias
router.get('/', categoryController.listCategories);

// GET /api/categories/featured - Categorias em destaque
router.get('/featured', categoryController.getFeaturedCategories);

// GET /api/categories/:id - Buscar categoria por ID
router.get('/:id', categoryController.getCategory);

// POST /api/categories - Criar nova categoria
router.post('/', categoryController.createCategory);

module.exports = router;