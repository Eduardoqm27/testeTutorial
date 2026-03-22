// Gerenciar a página do carrinho
class CartPage {
    static async loadCart() {
        const cartDetails = await CartManager.getCartDetails();
        const cartContent = document.getElementById('cart-content');

        if (cartDetails.length === 0) {
            cartContent.innerHTML = `
                <div class="loading">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Seu carrinho está vazio</p>
                    <a href="/" class="btn" style="margin-top: 1rem;">
                        <i class="fas fa-shopping-bag"></i> Continuar Comprando
                    </a>
                </div>
            `;
            return;
        }

        let total = 0;
        cartContent.innerHTML = `
            <div class="cart-items">
                ${cartDetails.map(item => {
                    const itemTotal = item.quantity * item.product.price;
                    total += itemTotal;
                    return `
                        <div class="product-card" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div class="product-image" style="width: 100px; height: 100px;">
                                <i class="fas fa-${item.product.category_icon || 'leaf'}"></i>
                            </div>
                            <div style="flex: 1;">
                                <h3>${item.product.name}</h3>
                                <p>R$ ${item.product.price.toFixed(2)}</p>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <button onclick="CartPage.updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                                    <span>${item.quantity}</span>
                                    <button onclick="CartPage.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                                    <button onclick="CartPage.removeItem(${item.productId})" style="color: var(--accent); margin-left: 1rem;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div style="font-weight: bold;">
                                R$ ${itemTotal.toFixed(2)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="border-top: 2px solid var(--primary); padding-top: 1rem; text-align: right;">
                <h3>Total: R$ ${total.toFixed(2)}</h3>
                <button class="btn" onclick="CartPage.checkout()">
                    <i class="fas fa-credit-card"></i> Finalizar Compra
                </button>
            </div>
        `;
    }

    static async updateQuantity(productId, newQuantity) {
        CartManager.updateQuantity(productId, newQuantity);
        await this.loadCart();
    }

    static async removeItem(productId) {
        CartManager.removeFromCart(productId);
        await this.loadCart();
    }

    static checkout() {
        window.location.href = '/checkout.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    CartPage.loadCart();
});