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
            try {
                const exists = prev.find((item) => item && item._id === product._id);
                if (exists) {
                    return prev.filter((item) => item && item._id !== product._id);
                } else {
                    return [...prev, product];
                }
            } catch (error) {
                console.error('Error updating basket:', error);
                return prev;
            }
        });
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
        <BasketContext.Provider value={{ basket, setBasket, addToBasket, clearBasket }}>
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