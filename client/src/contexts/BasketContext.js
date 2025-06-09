import { createContext, useEffect, useContext, useState } from "react";
 
const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
    
    const [basket, setBasket] = useState(() => {
        const savedBasket = localStorage.getItem("basket");
        return savedBasket ? JSON.parse(savedBasket) : [];
    });

    useEffect(() => {
        localStorage.setItem("basket", JSON.stringify(basket));
    }, [basket]);
    const addToBasket = (product) => {
        setBasket((prev) => {
            const exists = prev.find((item) => item._id === product._id);
            if (exists) {
                return prev.filter((item) => item._id !== product._id); //remove
            } else {
                return [...prev, product]; //add
            }
        });
    }

    return (
        <BasketContext.Provider value={{ basket, setBasket, addToBasket }}>
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => useContext(BasketContext);