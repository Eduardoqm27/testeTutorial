const db = require('../config/database');

class Order {
    // Gerar número do pedido único
    static generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `CF${timestamp}${random.toString().padStart(3, '0')}`;
    }

    // Criar pedido
    static async create(orderData) {
        const {
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            items,
            total_amount,
            payment_method,
            gift_message
        } = orderData;

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Criar o pedido
            const orderNumber = this.generateOrderNumber();
            const [orderResult] = await connection.execute(
                `INSERT INTO orders 
                 (user_id, order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, gift_message) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, orderNumber, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, gift_message]
            );

            const orderId = orderResult.insertId;

            // Adicionar itens do pedido
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]
                );
            }

            await connection.commit();
            return this.findById(orderId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Buscar pedido por ID
    static async findById(id) {
        const [orders] = await db.execute(
            `SELECT o.*, 
             JSON_ARRAYAGG(
                 JSON_OBJECT(
                     'id', oi.id,
                     'product_id', oi.product_id,
                     'quantity', oi.quantity,
                     'unit_price', oi.unit_price,
                     'total_price', oi.total_price,
                     'name', p.name,
                     'category_icon', c.icon
                 )
             ) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE o.id = ?
             GROUP BY o.id`,
            [id]
        );

        if (orders.length === 0) return null;

        const order = orders[0];
        order.items = JSON.parse(order.items);
        return order;
    }

    // Buscar pedidos por usuário
    static async findByUser(userId) {
        const [rows] = await db.execute(
            `SELECT o.*, 
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
             FROM orders o 
             WHERE o.user_id = ? 
             ORDER BY o.created_at DESC`,
            [userId]
        );
        return rows;
    }

    // Listar todos os pedidos (admin)
    static async findAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        const [orders] = await db.execute(
            `SELECT o.*, 
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
             FROM orders o 
             ORDER BY o.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [total] = await db.execute('SELECT COUNT(*) as count FROM orders');
        
        return {
            orders,
            total: total[0].count,
            page,
            totalPages: Math.ceil(total[0].count / limit)
        };
    }

    // Atualizar status do pedido
    static async updateStatus(id, status) {
        const [result] = await db.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    // Atualizar status de pagamento
    static async updatePaymentStatus(id, paymentStatus) {
        const [result] = await db.execute(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            [paymentStatus, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Order;