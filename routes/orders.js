const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET /api/orders - Listar todos os pedidos (admin)
router.get('/', orderController.getAllOrders);

// GET /api/orders/user/:userId - Buscar pedidos do usuário
router.get('/user/:userId', orderController.getUserOrders);

// GET /api/orders/:id - Buscar pedido por ID
router.get('/:id', orderController.getOrder);

// POST /api/orders/:userId - Criar pedido
router.post('/:userId', orderController.createOrder);

// PUT /api/orders/:id/status - Atualizar status do pedido
router.put('/:id/status', orderController.updateOrderStatus);

// PUT /api/orders/:id/payment - Atualizar status de pagamento
router.put('/:id/payment', orderController.updatePaymentStatus);

module.exports = router;