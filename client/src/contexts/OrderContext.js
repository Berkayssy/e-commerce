import { createContext, useEffect, useContext, useState } from "react";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [ orders, setOrders ] = useState(() => {
    try {
      const saved = localStorage.getItem("order");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Broken localStorage veriable:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("order", JSON.stringify(orders));
  }, [orders]);

  const confirmOrder = (order) => {
    setOrders((prevOrders) => {
      const exists = prevOrders.find((item) => item._id === order._id);
      if (exists) {
        return prevOrders.filter((item) => item._id !== order._id); // remove
      } else {
        return [...prevOrders, order]; // add
      }
    });
  };

  const addOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  return (
    <OrderContext.Provider value={{ orders, setOrders, confirmOrder, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);