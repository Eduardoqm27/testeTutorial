// API Base URL
const API_BASE = '/api';

// Elementos DOM
const featuredProductsEl = document.getElementById('featured-products');
const categoriesGridEl = document.getElementById('categories-grid');
const navIconsEl = document.querySelector('.nav-icons');

// Estado da aplicação
let currentUser = JSON.parse(localStorage.getItem('cidaflores-user')) || null;
let cartItems = JSON.parse(localStorage.getItem('cidaflores-cart')) || [];

// Inicialização da interface
function initializeUI() {
    updateCartCounter();
    updateUserUI();
    createAuthModal();
    createCartModal();
}

// Funções da API (COMPLETAS)
class CidaFloresAPI {
    // Produtos
    static async getFeaturedProducts() {
        try {
            const response = await fetch(`${API_BASE}/products/featured`);
            if (!response.ok) throw new Error('Erro na API');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            throw error;
        }
    }

    static async getCategories() {
        try {
            const response = await fetch(`${API_BASE}/categories`);
            if (!response.ok) throw new Error('Erro na API');
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            throw error;
        }
    }

    static async getProductsByCategory(categoryId) {
        try {
            const response = await fetch(`${API_BASE}/products?category_id=${categoryId}`);
            if (!response.ok) throw new Error('Erro na API');
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }
    }

    static async getProductById(productId) {
        try {
            const response = await fetch(`${API_BASE}/products/${productId}`);
            if (!response.ok) throw new Error('Erro na API');
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
    }

    // Autenticação
    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro no registro');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    }

    static async login(credentials) {
        try {
            const response = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro no login');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    // Carrinho
    static async getCart(userId) {
        try {
            const response = await fetch(`${API_BASE}/cart/${userId}`);
            if (!response.ok) throw new Error('Erro ao buscar carrinho');
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar carrinho:', error);
            return { items: [], total: 0, itemCount: 0 };
        }
    }

    static async addToCart(userId, productId, quantity = 1) {
        try {
            const response = await fetch(`${API_BASE}/cart/${userId}/add/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity })
            });
            
            if (!response.ok) throw new Error('Erro ao adicionar ao carrinho');
            return await response.json();
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            throw error;
        }
    }

    static async removeFromCart(userId, productId) {
        try {
            const response = await fetch(`${API_BASE}/cart/${userId}/remove/${productId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erro ao remover do carrinho');
            return await response.json();
        } catch (error) {
            console.error('Erro ao remover do carrinho:', error);
            throw error;
        }
    }

    static async clearCart(userId) {
        try {
            const response = await fetch(`${API_BASE}/cart/${userId}/clear`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erro ao limpar carrinho');
            return await response.json();
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            throw error;
        }
    }

    // Pedidos
    static async createOrder(userId, orderData) {
        try {
            const response = await fetch(`${API_BASE}/orders/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar pedido');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    }

    static async getUserOrders(userId) {
        try {
            const response = await fetch(`${API_BASE}/orders/user/${userId}`);
            if (!response.ok) throw new Error('Erro ao buscar pedidos');
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            return { orders: [] };
        }
    }
}

// Sistema de Renderização
class ProductRenderer {
    static renderFeaturedProducts(products) {
        if (!products || products.length === 0) {
            return '<div class="loading"><p>Nenhum produto em destaque encontrado.</p></div>';
        }

        return products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${product.sale_price ? '<div class="product-badge">Oferta</div>' : ''}
                ${product.stock_quantity === 0 ? '<div class="product-badge" style="background: var(--text-light);">Esgotado</div>' : ''}
                <div class="product-image">
                    <i class="fas fa-${product.category_icon || 'leaf'}"></i>
                </div>
                <div class="product-info">
                    <div class="product-category">
                        <i class="fas fa-${product.category_icon}"></i> 
                        ${product.category_name || 'Geral'}
                    </div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        ${product.sale_price ? `
                            <span class="old-price">R$ ${parseFloat(product.price).toFixed(2)}</span>
                            R$ ${parseFloat(product.sale_price).toFixed(2)}
                        ` : `R$ ${parseFloat(product.price).toFixed(2)}`}
                    </div>
                    <div class="product-features">
                        ${product.light_requirements ? `
                            <div class="feature">
                                <i class="fas fa-sun"></i> ${this.formatLightRequirement(product.light_requirements)}
                            </div>
                        ` : ''}
                        ${product.pet_friendly ? `
                            <div class="feature">
                                <i class="fas fa-paw"></i> Pet Friendly
                            </div>
                        ` : ''}
                        ${product.watering_frequency ? `
                            <div class="feature">
                                <i class="fas fa-tint"></i> ${product.watering_frequency}
                            </div>
                        ` : ''}
                    </div>
                    <button class="add-to-cart" 
                            onclick="addToCart(${product.id})"
                            ${product.stock_quantity === 0 ? 'disabled style="background: var(--text-light);"' : ''}>
                        <i class="fas fa-cart-plus"></i> 
                        ${product.stock_quantity === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    static renderCategories(categories) {
        if (!categories || categories.length === 0) {
            return '<div class="loading"><p>Nenhuma categoria encontrada.</p></div>';
        }

        return categories.map(category => `
            <div class="category-card" onclick="viewCategory(${category.id})">
                <div class="category-icon">
                    <i class="fas fa-${category.icon}"></i>
                </div>
                <h3 class="category-name">${category.name}</h3>
                <p class="category-description">${category.description}</p>
                <button class="btn" style="margin-top: 1rem;">
                    <i class="fas fa-eye"></i> Ver Produtos
                </button>
            </div>
        `).join('');
    }

    static renderCartItems(items) {
        if (!items || items.length === 0) {
            return `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Seu carrinho está vazio</p>
                    <a href="#products" class="btn" onclick="closeCartModal()">Continuar Comprando</a>
                </div>
            `;
        }

        return items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="fas fa-${item.category_icon || 'leaf'}"></i>
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">
                        R$ ${parseFloat(item.sale_price || item.price).toFixed(2)}
                    </p>
                    <div class="cart-item-quantity">
                        <button onclick="updateCartQuantity(${item.product_id || item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.product_id || item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.product_id || item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    static formatLightRequirement(light) {
        const lightMap = {
            'sol_pleno': 'Sol Pleno',
            'meia_sombra': 'Meia Sombra',
            'sombra': 'Sombra'
        };
        return lightMap[light] || light;
    }
}

// Sistema de Autenticação
class AuthManager {
    static async register(userData) {
        try {
            const result = await CidaFloresAPI.register(userData);
            showNotification('Conta criada com sucesso! Faça login.', 'success');
            return result;
        } catch (error) {
            showNotification(error.message, 'error');
            throw error;
        }
    }

    static async login(credentials) {
        try {
            const result = await CidaFloresAPI.login(credentials);
            
            // Salvar usuário no localStorage
            currentUser = result.user;
            localStorage.setItem('cidaflores-user', JSON.stringify(currentUser));
            
            // Sincronizar carrinho local com o servidor
            await CartManager.syncLocalCartWithServer();
            
            showNotification(`Bem-vindo(a), ${currentUser.name}!`, 'success');
            updateUserUI();
            closeAuthModal();
            
            return result;
        } catch (error) {
            showNotification(error.message, 'error');
            throw error;
        }
    }

    static logout() {
        currentUser = null;
        localStorage.removeItem('cidaflores-user');
        localStorage.removeItem('cidaflores-cart');
        cartItems = [];
        
        updateUserUI();
        updateCartCounter();
        showNotification('Logout realizado com sucesso', 'info');
    }
}

// Sistema de Carrinho
class CartManager {
    // Adicionar item ao carrinho
    static async addToCart(productId, quantity = 1) {
        try {
            const product = await CidaFloresAPI.getProductById(productId);
            if (!product) {
                throw new Error('Produto não encontrado');
            }

            if (product.stock_quantity === 0) {
                showNotification('Produto esgotado', 'error');
                return;
            }

            if (currentUser) {
                // Usuário logado - usar API
                await CidaFloresAPI.addToCart(currentUser.id, productId, quantity);
                showNotification('Produto adicionado ao carrinho!', 'success');
            } else {
                // Usuário não logado - usar localStorage
                const existingItem = cartItems.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cartItems.push({
                        id: productId,
                        product_id: productId,
                        name: product.name,
                        price: product.price,
                        sale_price: product.sale_price,
                        category_icon: product.category_icon,
                        quantity: quantity
                    });
                }
                
                localStorage.setItem('cidaflores-cart', JSON.stringify(cartItems));
                showNotification('Produto adicionado ao carrinho!', 'success');
            }

            await this.updateCartCounter();
            
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            showNotification('Erro ao adicionar produto ao carrinho', 'error');
        }
    }

    // Remover item do carrinho
    static async removeFromCart(productId) {
        try {
            if (currentUser) {
                await CidaFloresAPI.removeFromCart(currentUser.id, productId);
            } else {
                cartItems = cartItems.filter(item => item.id !== productId);
                localStorage.setItem('cidaflores-cart', JSON.stringify(cartItems));
            }

            showNotification('Produto removido do carrinho', 'info');
            await this.updateCartCounter();
            
            // Recarregar modal do carrinho se estiver aberto
            if (document.getElementById('cart-modal').style.display === 'block') {
                await loadCartModal();
            }
            
        } catch (error) {
            console.error('Erro ao remover do carrinho:', error);
            showNotification('Erro ao remover produto do carrinho', 'error');
        }
    }

    // Atualizar quantidade
    static async updateQuantity(productId, newQuantity) {
        try {
            if (newQuantity <= 0) {
                await this.removeFromCart(productId);
                return;
            }

            if (currentUser) {
                // Para usuário logado, precisamos de uma rota de update
                // Por enquanto, vamos remover e adicionar novamente
                await CidaFloresAPI.removeFromCart(currentUser.id, productId);
                await CidaFloresAPI.addToCart(currentUser.id, productId, newQuantity);
            } else {
                const item = cartItems.find(item => item.id === productId);
                if (item) {
                    item.quantity = newQuantity;
                    localStorage.setItem('cidaflores-cart', JSON.stringify(cartItems));
                }
            }

            // Recarregar modal do carrinho se estiver aberto
            if (document.getElementById('cart-modal').style.display === 'block') {
                await loadCartModal();
            }
            
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            showNotification('Erro ao atualizar quantidade', 'error');
        }
    }

    // Buscar itens do carrinho
    static async getCartItems() {
        try {
            if (currentUser) {
                const cartData = await CidaFloresAPI.getCart(currentUser.id);
                return cartData.items || [];
            } else {
                return cartItems;
            }
        } catch (error) {
            console.error('Erro ao buscar carrinho:', error);
            return [];
        }
    }

    // Calcular total do carrinho
    static async getCartTotal() {
        const items = await this.getCartItems();
        return items.reduce((total, item) => {
            const price = item.sale_price || item.price;
            return total + (price * item.quantity);
        }, 0);
    }

    // Sincronizar carrinho local com servidor após login
    static async syncLocalCartWithServer() {
        if (!currentUser || cartItems.length === 0) return;

        try {
            for (const item of cartItems) {
                await CidaFloresAPI.addToCart(currentUser.id, item.id, item.quantity);
            }
            
            // Limpar carrinho local após sincronização
            cartItems = [];
            localStorage.removeItem('cidaflores-cart');
            
            showNotification('Carrinho sincronizado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao sincronizar carrinho:', error);
        }
    }

    // Atualizar contador do carrinho
    static async updateCartCounter() {
        const cartCounter = document.getElementById('cart-counter');
        if (!cartCounter) return;

        const items = await this.getCartItems();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Funções Globais
async function loadFeaturedProducts() {
    try {
        featuredProductsEl.innerHTML = '<div class="loading"><i class="fas fa-spinner loading-spinner"></i> Carregando produtos...</div>';
        
        const products = await CidaFloresAPI.getFeaturedProducts();
        featuredProductsEl.innerHTML = ProductRenderer.renderFeaturedProducts(products);
    } catch (error) {
        featuredProductsEl.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar produtos. Verifique se o servidor está rodando.</p>
                <button onclick="loadFeaturedProducts()" class="btn" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

async function loadCategories() {
    try {
        categoriesGridEl.innerHTML = '<div class="loading"><i class="fas fa-spinner loading-spinner"></i> Carregando categorias...</div>';
        
        const categories = await CidaFloresAPI.getCategories();
        categoriesGridEl.innerHTML = ProductRenderer.renderCategories(categories);
    } catch (error) {
        categoriesGridEl.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar categorias. Verifique se o servidor está rodando.</p>
                <button onclick="loadCategories()" class="btn" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

async function loadCartModal() {
    const cartModal = document.getElementById('cart-modal');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    try {
        const items = await CartManager.getCartItems();
        const total = await CartManager.getCartTotal();

        cartItemsEl.innerHTML = ProductRenderer.renderCartItems(items);
        cartTotalEl.textContent = `R$ ${total.toFixed(2)}`;

        // Atualizar botão de checkout
        if (checkoutBtn) {
            if (items.length === 0) {
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Carrinho Vazio';
            } else if (!currentUser) {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Fazer Login para Finalizar';
                checkoutBtn.onclick = openAuthModal;
            } else {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Finalizar Compra';
                checkoutBtn.onclick = openCheckoutModal;
            }
        }

    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        cartItemsEl.innerHTML = '<div class="loading"><p>Erro ao carregar carrinho.</p></div>';
    }
}

// Funções de UI
function updateUserUI() {
    const userIcon = document.querySelector('.fa-user').closest('.icon-btn');
    
    if (currentUser) {
        userIcon.innerHTML = `
            <i class="fas fa-user"></i>
            <div class="user-menu">
                <span>Olá, ${currentUser.name.split(' ')[0]}</span>
                <button onclick="openProfileModal()">Meu Perfil</button>
                <button onclick="openOrdersModal()">Meus Pedidos</button>
                <button onclick="AuthManager.logout()">Sair</button>
            </div>
        `;
    } else {
        userIcon.innerHTML = '<i class="fas fa-user"></i>';
        userIcon.onclick = openAuthModal;
    }
}

function updateCartCounter() {
    CartManager.updateCartCounter();
}

// Modal de Autenticação
function createAuthModal() {
    const modalHTML = `
        <div id="auth-modal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeAuthModal()">&times;</span>
                <div class="auth-tabs">
                    <button class="tab-button active" onclick="openTab('login')">Login</button>
                    <button class="tab-button" onclick="openTab('register')">Cadastro</button>
                </div>
                
                <div id="login" class="tab-content active">
                    <h3>Entrar na Minha Conta</h3>
                    <form id="login-form">
                        <input type="email" placeholder="Email" required>
                        <input type="password" placeholder="Senha" required>
                        <button type="submit" class="btn">Entrar</button>
                    </form>
                </div>
                
                <div id="register" class="tab-content">
                    <h3>Criar Nova Conta</h3>
                    <form id="register-form">
                        <input type="text" placeholder="Nome Completo" required>
                        <input type="email" placeholder="Email" required>
                        <input type="password" placeholder="Senha" required>
                        <input type="tel" placeholder="Telefone">
                        <textarea placeholder="Endereço"></textarea>
                        <button type="submit" class="btn">Cadastrar</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

function openAuthModal() {
    document.getElementById('auth-modal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function openTab(tabName) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Mostrar a tab selecionada
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        await AuthManager.login(credentials);
    } catch (error) {
        // Erro já tratado no AuthManager
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };

    try {
        await AuthManager.register(userData);
    } catch (error) {
        // Erro já tratado no AuthManager
    }
}

// Modal do Carrinho
function createCartModal() {
    const modalHTML = `
        <div id="cart-modal" class="modal">
            <div class="modal-content cart-modal">
                <span class="close" onclick="closeCartModal()">&times;</span>
                <h3><i class="fas fa-shopping-cart"></i> Meu Carrinho</h3>
                <div id="cart-items" class="cart-items">
                    <!-- Itens serão carregados aqui -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <strong>Total: R$ <span id="cart-total">0.00</span></strong>
                    </div>
                    <button id="checkout-btn" class="btn btn-checkout">
                        <i class="fas fa-credit-card"></i> Finalizar Compra
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openCartModal() {
    loadCartModal();
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Funções de Ação
async function addToCart(productId) {
    await CartManager.addToCart(productId, 1);
}

async function removeFromCart(productId) {
    await CartManager.removeFromCart(productId);
}

async function updateCartQuantity(productId, newQuantity) {
    await CartManager.updateQuantity(productId, newQuantity);
}

function viewCategory(categoryId) {
    showNotification(`Carregando produtos da categoria...`, 'info');
    // Em uma implementação completa, isso redirecionaria para uma página de categoria
    // window.location.href = `/categoria.html?id=${categoryId}`;
}

function openCheckoutModal() {
    showNotification('Funcionalidade de checkout em desenvolvimento...', 'info');
    // Implementar modal de checkout
}

function openProfileModal() {
    showNotification('Funcionalidade de perfil em desenvolvimento...', 'info');
    // Implementar modal de perfil
}

function openOrdersModal() {
    showNotification('Funcionalidade de pedidos em desenvolvimento...', 'info');
    // Implementar modal de pedidos
}

// Sistema de Notificações
function showNotification(message, type = 'info') {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Adicionar estilos dinâmicos
const dynamicStyles = `
    <style>
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--white);
            color: var(--text);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-hover);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid var(--primary);
            max-width: 300px;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification-success {
            border-left-color: var(--primary);
        }

        .notification-error {
            border-left-color: #f44336;
        }

        .notification-warning {
            border-left-color: var(--secondary);
        }

        .notification-info {
            border-left-color: #2196F3;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }

        .modal-content {
            background-color: var(--white);
            margin: 5% auto;
            padding: 2rem;
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 500px;
            position: relative;
        }

        .cart-modal {
            max-width: 600px;
        }

        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        }

        .close:hover {
            color: var(--text);
        }

        .auth-tabs {
            display: flex;
            margin-bottom: 2rem;
            border-bottom: 2px solid var(--gray-light);
        }

        .tab-button {
            padding: 1rem 2rem;
            background: none;
            border: none;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
        }

        .tab-button.active {
            border-bottom-color: var(--primary);
            color: var(--primary);
            font-weight: bold;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .auth-tabs input, .auth-tabs textarea {
            width: 100%;
            padding: 12px;
            margin-bottom: 1rem;
            border: 1px solid var(--gray);
            border-radius: var(--border-radius);
            font-size: 1rem;
        }

        .auth-tabs button {
            width: 100%;
        }

        .cart-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid var(--gray-light);
        }

        .cart-item-image {
            width: 60px;
            height: 60px;
            background: var(--gray-light);
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 1.5rem;
        }

        .cart-item-info {
            flex: 1;
        }

        .cart-item-info h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
        }

        .cart-item-price {
            color: var(--primary);
            font-weight: bold;
            margin: 0 0 0.5rem 0;
        }

        .cart-item-quantity {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .cart-item-quantity button {
            width: 30px;
            height: 30px;
            border: 1px solid var(--gray);
            background: var(--white);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cart-item-remove {
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            padding: 0.5rem;
        }

        .cart-item-remove:hover {
            color: #f44336;
        }

        .cart-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 2px solid var(--gray-light);
        }

        .cart-total {
            text-align: center;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }

        .btn-checkout {
            width: 100%;
            font-size: 1.1rem;
            padding: 1rem;
        }

        .empty-cart {
            text-align: center;
            padding: 3rem;
            color: var(--text-light);
        }

        .empty-cart i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--gray);
        }

        .user-menu {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--white);
            box-shadow: var(--shadow-hover);
            border-radius: var(--border-radius);
            min-width: 200px;
            padding: 0.5rem;
            z-index: 1000;
        }

        .user-menu button {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
            border-radius: 4px;
        }

        .user-menu button:hover {
            background: var(--gray-light);
        }

        .icon-btn:hover .user-menu {
            display: block;
        }

        #cart-counter {
            position: absolute;
            top: -5px;
            right: -5px;
            background: var(--accent);
            color: var(--white);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.8rem;
            display: none;
            align-items: center;
            justify-content: center;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', dynamicStyles);

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadFeaturedProducts();
    loadCategories();
    
    // Adicionar contador ao ícone do carrinho
    const cartIcon = document.querySelector('.fa-shopping-cart').closest('.icon-btn');
    cartIcon.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <span id="cart-counter">0</span>
    `;
    cartIcon.onclick = openCartModal;
    
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const authModal = document.getElementById('auth-modal');
        const cartModal = document.getElementById('cart-modal');
        
        if (authModal && e.target === authModal) {
            closeAuthModal();
        }
        if (cartModal && e.target === cartModal) {
            closeCartModal();
        }
    });
});