// Existing scrollToSection function
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Cart functionality
let cart = [];

function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    cartCount.textContent = cart.length;
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - $${(item.price / 100).toFixed(2)}`;
        cartItems.appendChild(li);
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = (total / 100).toFixed(2);
    checkoutButton.disabled = cart.length === 0;
}

// Add to cart event listeners
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const productCard = button.parentElement;
        const productId = productCard.getAttribute('data-product-id');
        const price = parseInt(productCard.getAttribute('data-price'));
        const name = productCard.querySelector('h3').textContent;

        cart.push({ id: productId, name, price });
        updateCart();
    });
});

// Initialize Stripe
const stripe = Stripe('pk_test_your_publishable_key_here'); // Replace with your Stripe Publishable Key

// Checkout button event listener
document.getElementById('checkout-button').addEventListener('click', async () => {
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: { name: item.name },
            unit_amount: item.price,
        },
        quantity: 1,
    }));

    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: lineItems }),
        });

        const session = await response.json();
        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

        if (error) console.error('Stripe Checkout error:', error.message);
    } catch (error) {
        console.error('Error creating checkout session:', error);
    }
});