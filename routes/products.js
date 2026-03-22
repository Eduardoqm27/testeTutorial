const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Listar todos os produtos
router.get('/', productController.listProducts);

// GET /api/products/featured - Produtos em destaque
router.get('/featured', productController.getFeaturedProducts);

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', productController.getProduct);

// POST /api/products - Criar novo produto
router.post('/', productController.createProduct);

// PUT /api/products/:id - Atualizar produto
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Deletar produto
router.delete('/:id', productController.deleteProduct);

module.exports = router;