import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        let success = false;
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            const currentQty = existingItem ? existingItem.quantity : 0;
            const newQty = currentQty + quantity;

            if (newQty > product.stock) {
                alert(`Solo hay ${product.stock} unidades disponibles de "${product.name}".`);
                return prevCart;
            }

            success = true;
            if (existingItem) {
                return prevCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: newQty }
                        : item
                );
            }
            return [...prevCart, { product, quantity }];
        });
        return success;
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart => {
            const item = prevCart.find(i => i.product.id === productId);
            if (item && quantity > item.product.stock) {
                alert(`Solo hay ${item.product.stock} unidades disponibles de "${item.product.name}".`);
                return prevCart;
            }
            return prevCart.map(i =>
                i.product.id === productId ? { ...i, quantity } : i
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const getItemCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotal,
            getItemCount,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
