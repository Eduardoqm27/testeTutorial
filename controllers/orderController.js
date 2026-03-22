const Order = require('../models/Order');
const Cart = require('../models/Cart');

const orderController = {
    // Criar pedido
    async createOrder(req, res) {
        try {
            const { userId } = req.params;
            const { 
                customer_name, 
                customer_email, 
                customer_phone, 
                shipping_address, 
                payment_method, 
                gift_message 
            } = req.body;

            // Buscar itens do carrinho
            const cartItems = await Cart.findByUserId(userId);
            if (cartItems.length === 0) {
                return res.status(400).json({ error: 'Carrinho vazio' });
            }

            // Calcular totais
            const items = cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.sale_price || item.price,
                total_price: (item.sale_price || item.price) * item.quantity
            }));

            const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);

            // Criar pedido
            const order = await Order.create({
                user_id: userId,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                items,
                total_amount,
                payment_method,
                gift_message
            });

            // Limpar carrinho após criar pedido
            await Cart.clear(userId);

            res.status(201).json({
                message: 'Pedido criado com sucesso',
                order
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Buscar pedido por ID
    async getOrder(req, res) {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
            res.json({ order });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar pedidos do usuário
    async getUserOrders(req, res) {
        try {
            const { userId } = req.params;
            const orders = await Order.findByUser(userId);
            res.json({ orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar todos os pedidos (admin)
    async getAllOrders(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await Order.findAll(parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar status do pedido
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Status inválido' });
            }

            const success = await Order.updateStatus(id, status);
            if (!success) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            res.json({ message: 'Status do pedido atualizado com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Atualizar status de pagamento
    async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;

            const validStatuses = ['pending', 'paid', 'refunded'];
            if (!validStatuses.includes(payment_status)) {
                return res.status(400).json({ error: 'Status de pagamento inválido' });
            }

            const success = await Order.updatePaymentStatus(id, payment_status);
            if (!success) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            res.json({ message: 'Status de pagamento atualizado com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = orderController;