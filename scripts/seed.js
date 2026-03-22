const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Limpar collections
        await Category.deleteMany({});
        await Product.deleteMany({});
        
        // Criar categorias
        const categories = await Category.insertMany([
            {
                name: 'Flores',
                description: 'Flores cortadas e arranjos',
                icon: 'seedling',
                featured: true
            },
            {
                name: 'Plantas',
                description: 'Plantas em vaso para interior e exterior',
                icon: 'leaf',
                featured: true
            },
            {
                name: 'Jardinagem',
                description: 'Ferramentas e acessórios para jardinagem',
                icon: 'spa',
                featured: true
            },
            {
                name: 'Presentes',
                description: 'Kits e presentes especiais',
                icon: 'gift',
                featured: true
            }
        ]);
        
        // Criar produtos
        await Product.insertMany([
            {
                name: 'Rosa Vermelha Premium',
                description: 'Rosas vermelhas frescas cortadas, perfeitas para presentear',
                price: 12.90,
                salePrice: 9.90,
                category: categories[0]._id,
                stock: 50,
                sku: 'ROS001',
                careInfo: {
                    light: 'meia_sombra',
                    watering: 'Trocar água a cada 2 dias',
                    difficulty: 'fácil'
                },
                features: {
                    petFriendly: true,
                    flowering: true
                },
                tags: ['rosa', 'vermelha', 'cortada', 'presente'],
                featured: true
            },
            {
                name: 'Orquídea Phalaenopsis Branca',
                description: 'Linda orquídea branca em vaso, fácil de cuidar e muito elegante',
                price: 59.90,
                category: categories[1]._id,
                stock: 25,
                sku: 'ORQ001',
                careInfo: {
                    light: 'meia_sombra',
                    watering: '1 vez por semana',
                    temperature: '15-25°C',
                    humidity: '40-70%',
                    difficulty: 'médio'
                },
                features: {
                    petFriendly: true,
                    indoor: true,
                    flowering: true
                },
                tags: ['orquídea', 'phalaenopsis', 'vaso', 'interior'],
                featured: true
            }
        ]);
        
        console.log('✅ Dados iniciais inseridos com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao inserir dados:', error);
        process.exit(1);
    }
};

seedData();