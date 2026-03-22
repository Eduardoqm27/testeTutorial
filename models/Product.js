const db = require('../config/database');

class Product {
    // Buscar todos os produtos
    static async findAll(filters = {}) {
        let query = `
            SELECT p.*, c.name as category_name, c.icon as category_icon 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.active = true
        `;
        const params = [];

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.featured) {
            query += ' AND p.featured = true';
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY p.featured DESC, p.name ASC';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Buscar produto por ID
    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT p.*, c.name as category_name, c.icon as category_icon 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ? AND p.active = true`,
            [id]
        );
        return rows[0];
    }

    // Buscar produtos em destaque
    static async findFeatured() {
        const [rows] = await db.execute(
            `SELECT p.*, c.name as category_name, c.icon as category_icon 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.featured = true AND p.active = true 
             ORDER BY p.created_at DESC 
             LIMIT 8`
        );
        return rows;
    }

    // Criar produto
    static async create(productData) {
        const {
            name, description, price, sale_price, category_id,
            stock_quantity, sku, care_info, light_requirements,
            watering_frequency, pet_friendly, featured
        } = productData;

        const [result] = await db.execute(
            `INSERT INTO products 
             (name, description, price, sale_price, category_id, stock_quantity, sku, care_info, light_requirements, watering_frequency, pet_friendly, featured) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, price, sale_price, category_id, stock_quantity, sku, 
             JSON.stringify(care_info), light_requirements, watering_frequency, pet_friendly, featured]
        );

        return this.findById(result.insertId);
    }

    // Atualizar produto
    static async update(id, productData) {
        const fields = [];
        const params = [];

        Object.keys(productData).forEach(key => {
            if (productData[key] !== undefined) {
                fields.push(`${key} = ?`);
                if (key === 'care_info') {
                    params.push(JSON.stringify(productData[key]));
                } else {
                    params.push(productData[key]);
                }
            }
        });

        params.push(id);

        await db.execute(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    // Deletar produto (soft delete)
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE products SET active = false WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Product;