const Cart = require('../models/Cart');

const cartController = {
    // Buscar carrinho do usuário
    async getCart(req, res) {
        try {
            const { userId } = req.params;
            const cartItems = await Cart.findByUserId(userId);
            
            // Calcular totais
            const total = cartItems.reduce((sum, item) => {
                const price = item.sale_price || item.price;
                return sum + (price * item.quantity);
            }, 0);

            res.json({
                items: cartItems,
                total: parseFloat(total.toFixed(2)),
                itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Adicionar item ao carrinho
    async addToCart(req, res) {
        try {
            const { userId, productId } = req.params;
            const { quantity = 1 } = req.body;

            const success = await Cart.addItem(userId, productId, quantity);
            if (!success) {
                return res.status(400).json({ error: 'Erro ao adicionar item ao carrinho' });
            }

            const itemCount = await Cart.getItemCount(userId);
            res.json({ 
                message: 'Item adicionado ao carrinho',
                itemCount 
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Atualizar quantidade
    async updateQuantity(req, res) {
        try {
            const { userId, productId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity < 0) {
                return res.status(400).json({ error: 'Quantidade inválida' });
            }

            const success = await Cart.updateQuantity(userId, productId, quantity);
            if (!success) {
                return res.status(400).json({ error: 'Erro ao atualizar quantidade' });
            }

            res.json({ message: 'Quantidade atualizada com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Remover item do carrinho
    async removeFromCart(req, res) {
        try {
            const { userId, productId } = req.params;

            const success = await Cart.removeItem(userId, productId);
            if (!success) {
                return res.status(400).json({ error: 'Erro ao remover item do carrinho' });
            }

            res.json({ message: 'Item removido do carrinho' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Limpar carrinho
    async clearCart(req, res) {
        try {
            const { userId } = req.params;

            const success = await Cart.clear(userId);
            if (!success) {
                return res.status(400).json({ error: 'Erro ao limpar carrinho' });
            }

            res.json({ message: 'Carrinho limpo com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = cartController;