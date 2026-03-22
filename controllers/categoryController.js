const Category = require('../models/Category');

const categoryController = {
    // Listar todas as categorias
    async listCategories(req, res) {
        try {
            const categories = await Category.findAll();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar categoria por ID
    async getCategory(req, res) {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Categorias em destaque
    async getFeaturedCategories(req, res) {
        try {
            const categories = await Category.findFeatured();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar categoria
    async createCategory(req, res) {
        try {
            const category = await Category.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = categoryController;