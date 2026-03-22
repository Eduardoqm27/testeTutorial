const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Buscar usuário por ID
    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT id, name, email, phone, address, is_admin, created_at FROM users WHERE id = ? AND active = true',
            [id]
        );
        return rows[0];
    }

    // Buscar usuário por email
    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND active = true',
            [email]
        );
        return rows[0];
    }

    // Criar usuário
    static async create(userData) {
        const { name, email, password, phone, address } = userData;
        
        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, address]
        );

        return this.findById(result.insertId);
    }

    // Atualizar usuário
    static async update(id, userData) {
        const fields = [];
        const params = [];

        Object.keys(userData).forEach(key => {
            if (userData[key] !== undefined && key !== 'password') {
                fields.push(`${key} = ?`);
                params.push(userData[key]);
            }
        });

        // Se houver senha, criptografar
        if (userData.password) {
            fields.push('password = ?');
            params.push(await bcrypt.hash(userData.password, 10));
        }

        params.push(id);

        await db.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    // Verificar senha
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Deletar usuário (soft delete)
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE users SET active = false WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;