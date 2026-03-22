const db = require('../config/database');

class Cart {
    // Buscar carrinho do usuário
    static async findByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT ci.*, p.name, p.price, p.sale_price, p.stock_quantity, 
                    c.name as category_name, c.icon as category_icon 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             JOIN categories c ON p.category_id = c.id
             WHERE ci.user_id = ? AND p.active = true`,
            [userId]
        );
        return rows;
    }

    // Adicionar item ao carrinho
    static async addItem(userId, productId, quantity = 1) {
        // Verificar se o item já existe no carrinho
        const [existing] = await db.execute(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Atualizar quantidade
            const [result] = await db.execute(
                'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, userId, productId]
            );
            return result.affectedRows > 0;
        } else {
            // Inserir novo item
            const [result] = await db.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
            return result.affectedRows > 0;
        }
    }

    // Atualizar quantidade do item
    static async updateQuantity(userId, productId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(userId, productId);
        }

        const [result] = await db.execute(
            'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        return result.affectedRows > 0;
    }

    // Remover item do carrinho
    static async removeItem(userId, productId) {
        const [result] = await db.execute(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows > 0;
    }

    // Limpar carrinho
    static async clear(userId) {
        const [result] = await db.execute(
            'DELETE FROM cart_items WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }

    // Contar itens no carrinho
    static async getItemCount(userId) {
        const [rows] = await db.execute(
            'SELECT SUM(quantity) as total FROM cart_items WHERE user_id = ?',
            [userId]
        );
        return rows[0].total || 0;
    }
}

module.exports = Cart;