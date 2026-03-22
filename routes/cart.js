const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart/:userId - Buscar carrinho do usuário
router.get('/:userId', cartController.getCart);

// POST /api/cart/:userId/add/:productId - Adicionar item ao carrinho
router.post('/:userId/add/:productId', cartController.addToCart);

// PUT /api/cart/:userId/update/:productId - Atualizar quantidade
router.put('/:userId/update/:productId', cartController.updateQuantity);

// DELETE /api/cart/:userId/remove/:productId - Remover item do carrinho
router.delete('/:userId/remove/:productId', cartController.removeFromCart);

// DELETE /api/cart/:userId/clear - Limpar carrinho
router.delete('/:userId/clear', cartController.clearCart);

module.exports = router;