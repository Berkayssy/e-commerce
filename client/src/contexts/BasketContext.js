import { createContext, useEffect, useContext, useState } from "react";
 
const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
    const [basket, setBasket] = useState(() => {
        try {
            const savedBasket = localStorage.getItem("basket");
            return savedBasket ? JSON.parse(savedBasket) : [];
        } catch (error) {
            console.error('Error loading basket from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("basket", JSON.stringify(basket));
        } catch (error) {
            console.error('Error saving basket to localStorage:', error);
        }
    }, [basket]);

    const addToBasket = (product) => {
        if (!product || !product._id) {
            console.error('Invalid product data');
            return;
        }

        setBasket((prev) => {
            const exists = prev.find((item) => item && item._id === product._id);
            if (exists) {
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            } else {
                return [...prev, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromBasket = (productId) => {
        setBasket((prev) => prev.filter((item) => item._id !== productId));
    };

    const clearBasket = () => {
        try {
            setBasket([]);
            localStorage.removeItem("basket");
        } catch (error) {
            console.error('Error clearing basket:', error);
        }
    };

    return (
        <BasketContext.Provider value={{ basket, setBasket, addToBasket, removeFromBasket, clearBasket }}>
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};