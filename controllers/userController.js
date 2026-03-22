const User = require('../models/User');

const userController = {
    // Registrar usuário
    async register(req, res) {
        try {
            const { name, email, password, phone, address } = req.body;

            // Validações básicas
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
            }

            // Verificar se email já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            const user = await User.create({ name, email, password, phone, address });
            
            res.status(201).json({
                message: 'Usuário criado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Login de usuário
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const isPasswordValid = await User.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Em produção, aqui você geraria um token JWT
            res.json({
                message: 'Login realizado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    is_admin: user.is_admin
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar perfil do usuário
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json({ user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar perfil
    async updateProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await User.update(id, req.body);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json({ message: 'Perfil atualizado com sucesso', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = userController;