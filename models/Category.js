const db = require('../config/database');

class Category {
    // Buscar todas as categorias
    static async findAll() {
        const [rows] = await db.execute(
            'SELECT * FROM categories WHERE active = true ORDER BY name ASC'
        );
        return rows;
    }

    // Buscar categoria por ID
    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM categories WHERE id = ? AND active = true',
            [id]
        );
        return rows[0];
    }

    // Buscar categorias em destaque
    static async findFeatured() {
        const [rows] = await db.execute(
            'SELECT * FROM categories WHERE featured = true AND active = true ORDER BY name ASC'
        );
        return rows;
    }

    // Criar categoria
    static async create(categoryData) {
        const { name, description, icon, parent_id, featured } = categoryData;
        
        const [result] = await db.execute(
            'INSERT INTO categories (name, description, icon, parent_id, featured) VALUES (?, ?, ?, ?, ?)',
            [name, description, icon, parent_id, featured]
        );

        return this.findById(result.insertId);
    }
}

module.exports = Category;