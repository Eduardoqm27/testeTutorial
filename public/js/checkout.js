// Gerenciar a página de checkout
class CheckoutPage {
    static async loadCheckout() {
        const cartDetails = await CartManager.getCartDetails();
        const checkoutContent = document.getElementById('checkout-content');

        if (cartDetails.length === 0) {
            checkoutContent.innerHTML = `
                <div class="loading">
                    <p>Carrinho vazio</p>
                    <a href="/" class="btn">Voltar às compras</a>
                </div>
            `;
            return;
        }

        let total = cartDetails.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

        checkoutContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <h3><i class="fas fa-user"></i> Dados Pessoais</h3>
                    <form id="checkout-form">
                        <input type="text" placeholder="Nome completo" required>
                        <input type="email" placeholder="Email" required>
                        <input type="tel" placeholder="Telefone" required>
                        
                        <h3 style="margin-top: 2rem;"><i class="fas fa-truck"></i> Endereço de Entrega</h3>
                        <textarea placeholder="Endereço completo" required></textarea>
                        
                        <h3 style="margin-top: 2rem;"><i class="fas fa-credit-card"></i> Pagamento</h3>
                        <select required>
                            <option value="">Selecione a forma de pagamento</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="pix">PIX</option>
                            <option value="boleto">Boleto Bancário</option>
                        </select>
                        
                        <button type="submit" class="btn" style="width: 100%; margin-top: 2rem;">
                            <i class="fas fa-check"></i> Finalizar Pedido
                        </button>
                    </form>
                </div>
                
                <div>
                    <h3><i class="fas fa-shopping-bag"></i> Resumo do Pedido</h3>
                    ${cartDetails.map(item => `
                        <div style="display: flex; justify-content: between; margin-bottom: 1rem;">
                            <span>${item.product.name} x ${item.quantity}</span>
                            <span>R$ ${(item.quantity * item.product.price).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div style="border-top: 1px solid var(--gray); padding-top: 1rem; font-weight: bold;">
                        Total: R$ ${total.toFixed(2)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('checkout-form').addEventListener('submit', this.submitOrder);
    }

    static async submitOrder(event) {
        event.preventDefault();
        
        // Aqui você implementaria a lógica para enviar o pedido para a API
        const cartDetails = await CartManager.getCartDetails();
        const orderData = {
            items: cartDetails.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.product.price,
                total_price: item.quantity * item.product.price
            })),
            total_amount: cartDetails.reduce((total, item) => total + (item.quantity * item.product.price), 0),
            // Adicionar outros dados do formulário
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const order = await response.json();
                CartManager.clearCart();
                showNotification('Pedido realizado com sucesso!', 'success');
                // Redirecionar para página de confirmação
                window.location.href = `/order-confirmation.html?orderId=${order.id}`;
            } else {
                throw new Error('Erro ao realizar pedido');
            }
        } catch (error) {
            showNotification('Erro ao realizar pedido. Tente novamente.', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    CheckoutPage.loadCheckout();
});