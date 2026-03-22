const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    
    try {
        // Conectar sem especificar o banco de dados primeiro
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('🔧 Inicializando banco de dados completo...');

        // Criar banco de dados se não existir
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'cida_flores'}`);
        console.log('✅ Banco de dados criado/verificado');

        // Usar o banco de dados
        await connection.execute(`USE ${process.env.DB_NAME || 'cida_flores'}`);

        // Criar tabela de usuários
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                is_admin BOOLEAN DEFAULT false,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela users criada');

        // Criar tabela de categorias
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                icon VARCHAR(50) DEFAULT 'leaf',
                parent_id INT NULL,
                featured BOOLEAN DEFAULT false,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
        `);
        console.log('✅ Tabela categories criada');

        // Criar tabela de produtos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                sale_price DECIMAL(10,2),
                category_id INT NOT NULL,
                stock_quantity INT DEFAULT 0,
                sku VARCHAR(100) UNIQUE,
                care_info JSON,
                light_requirements ENUM('sol_pleno', 'meia_sombra', 'sombra'),
                watering_frequency VARCHAR(100),
                pet_friendly BOOLEAN DEFAULT true,
                featured BOOLEAN DEFAULT false,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        `);
        console.log('✅ Tabela products criada');

        // Criar tabela de pedidos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                order_number VARCHAR(50) UNIQUE,
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(150) NOT NULL,
                customer_phone VARCHAR(20),
                shipping_address TEXT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                payment_method ENUM('credit_card', 'debit_card', 'pix', 'boleto'),
                payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
                delivery_date DATE,
                gift_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Tabela orders criada');

        // Criar tabela de itens do pedido
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('✅ Tabela order_items criada');

        // Criar tabela de carrinho de compras
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id),
                UNIQUE KEY unique_user_product (user_id, product_id)
            )
        `);
        console.log('✅ Tabela cart_items criada');

        // Inserir categorias iniciais
        const [existingCategories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        if (existingCategories[0].count === 0) {
            await connection.execute(`
                INSERT INTO categories (name, description, icon, featured) VALUES
                ('Flores', 'Flores cortadas e arranjos', 'seedling', true),
                ('Plantas', 'Plantas em vaso para interior e exterior', 'leaf', true),
                ('Jardinagem', 'Ferramentas e acessórios para jardinagem', 'spa', true),
                ('Presentes', 'Kits e presentes especiais', 'gift', true),
                ('Flores Cortadas', 'Flores frescas cortadas', 'flower', false),
                ('Arranjos Prontos', 'Arranjos montados para presentes', 'bowling-ball', false),
                ('Plantas de Interior', 'Plantas para ambientes internos', 'home', false),
                ('Plantas de Exterior', 'Plantas para jardim e varanda', 'tree', false),
                ('Suculentas', 'Suculentas e cactos', 'pagelines', false),
                ('Ferramentas', 'Ferramentas de jardinagem', 'tools', false),
                ('Substratos', 'Terra, adubos e fertilizantes', 'mountain', false),
                ('Vasos', 'Vasos e cachepôs', 'chess-rook', false)
            `);
            console.log('✅ Categorias iniciais inseridas');
        }

        // Inserir produtos iniciais
        const [existingProducts] = await connection.execute('SELECT COUNT(*) as count FROM products');
        if (existingProducts[0].count === 0) {
            await connection.execute(`
                INSERT INTO products (name, description, price, sale_price, category_id, stock_quantity, sku, care_info, light_requirements, watering_frequency, pet_friendly, featured) VALUES
                ('Rosa Vermelha Premium', 'Rosas vermelhas frescas cortadas, perfeitas para presentear', 12.90, 9.90, 5, 50, 'ROS001', '{"vase_life": "7-10 dias", "care_tips": "Trocar a água a cada 2 dias e cortar a ponta do caule"}', 'meia_sombra', 'Diariamente', true, true),
                ('Orquídea Phalaenopsis Branca', 'Linda orquídea branca em vaso, fácil de cuidar e muito elegante', 59.90, NULL, 7, 25, 'ORQ001', '{"flowering": "2-3 vezes ao ano", "temperature": "15-25°C", "humidity": "40-70%"}', 'meia_sombra', '1 vez por semana', true, true),
                ('Kit Jardinagem Iniciante', 'Kit completo com tesoura de poda, luvas, pá pequena e regador', 89.90, 75.90, 10, 30, 'KIT001', '{"includes": ["Tesoura de poda", "Luvas", "Pá pequena", "Regador"]}', NULL, NULL, true, true),
                ('Suculenta Mix', 'Seleção de 3 suculentas diferentes e resistentes', 22.90, NULL, 9, 60, 'SUC001', '{"care_level": "fácil", "watering": "Pouca água"}', 'sol_pleno', '1 vez a cada 15 dias', true, true),
                ('Vaso Cerâmica Artesanal', 'Vaso de cerâmica artesanal tamanho médio com acabamento único', 35.90, 29.90, 12, 40, 'VAS001', '{"material": "Cerâmica artesanal", "drainage": "Furo no fundo incluído"}', NULL, NULL, true, false),
                ('Terra Adubada Premium', 'Substrato especial para plantas ornamentais, 5kg', 18.90, NULL, 11, 100, 'TER001', '{"composition": "Terra vegetal, húmus, areia", "ph": "6.0-6.5"}', NULL, NULL, true, false),
                ('Lírio da Paz', 'Planta de interior purificadora de ar, muito resistente', 32.90, 27.90, 7, 35, 'LIR001', '{"air_purifying": true, "light": "Indireta"}', 'sombra', '2-3 vezes por semana', true, true),
                ('Hortênsia Azul', 'Arbusto florífero perfeito para jardins', 45.90, NULL, 8, 20, 'HOR001', '{"flowering_season": "Primavera-Verão", "pruning": "Após floração"}', 'meia_sombra', 'Regularmente', true, false)
            `);
            console.log('✅ Produtos iniciais inseridos');
        }

        // Inserir usuário admin inicial
        const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
        if (existingUsers[0].count === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                'INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)',
                ['Administrador', 'admin@cidaflores.com', hashedPassword, '(11) 9999-9999', true]
            );
            console.log('✅ Usuário admin criado (email: admin@cidaflores.com, senha: admin123)');
        }

        console.log('🎉 Banco de dados completamente inicializado!');

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();