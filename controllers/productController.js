const Product = require('../models/Product');

const productController = {
    // Listar todos os produtos
    async listProducts(req, res) {
        try {
            const { category_id, featured, search } = req.query;
            const filters = {};

            if (category_id) filters.category_id = category_id;
            if (featured) filters.featured = featured === 'true';
            if (search) filters.search = search;

            const products = await Product.findAll(filters);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar produto por ID
    async getProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Produtos em destaque
    async getFeaturedProducts(req, res) {
        try {
            const products = await Product.findFeatured();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Criar produto
    async createProduct(req, res) {
        try {
            const product = await Product.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Atualizar produto
    async updateProduct(req, res) {
        try {
            const product = await Product.update(req.params.id, req.body);
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json(product);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Deletar produto
    async deleteProduct(req, res) {
        try {
            const success = await Product.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json({ message: 'Produto deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = productController;