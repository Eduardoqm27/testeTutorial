CREATE DATABASE IF NOT EXISTS cida_flores;
USE cida_flores;

-- Tabela de Categorias
CREATE TABLE categories (
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
);

-- Tabela de Produtos
CREATE TABLE products (
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
);

-- Inserir categorias principais
INSERT INTO categories (name, description, icon, featured) VALUES
('Flores', 'Flores cortadas e arranjos', 'seedling', true),
('Plantas', 'Plantas em vaso para interior e exterior', 'leaf', true),
('Jardinagem', 'Ferramentas e acessórios para jardinagem', 'spa', true),
('Presentes', 'Kits e presentes especiais', 'gift', true);

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, sale_price, category_id, stock_quantity, sku, care_info, light_requirements, watering_frequency, pet_friendly, featured) VALUES
('Rosa Vermelha', 'Rosa vermelha fresca cortada, perfeita para presentear', 8.90, 7.50, 1, 50, 'FL001', '{"vase_life": "7-10 dias", "care_tips": "Trocar a água a cada 2 dias e cortar a ponta do caule"}', 'meia_sombra', 'Diariamente', true, true),
('Orquídea Phalaenopsis', 'Linda orquídea branca em vaso, fácil de cuidar', 45.90, NULL, 2, 25, 'PL001', '{"flowering": "2-3 vezes ao ano", "temperature": "15-25°C", "humidity": "40-70%"}', 'meia_sombra', '1 vez por semana', true, true),
('Kit Jardinagem Básico', 'Kit completo para iniciantes na jardinagem', 89.90, 75.90, 3, 30, 'KT001', '{"includes": ["Tesoura de poda", "Pá pequena", "Luvas", "Regador"]}', NULL, NULL, true, false);