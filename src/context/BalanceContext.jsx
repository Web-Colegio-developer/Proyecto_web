import { createContext, useContext, useState, useEffect } from "react";

const BalanceContext = createContext();

export const BalanceProvider = ({ children, user, API_URL }) => {
  const [balance, setBalance] = useState(user?.balance || 0);

  useEffect(() => {
    setBalance(user?.balance || 0);
  }, [user?.balance]);

  // Auto-refresh cada 30s
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchBalance = async () => {
      try {
        const response = await fetch(`${API_URL}/user/${user.id}/balance`, { signal });
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        const data = await response.json();
        if (data.balance !== balance) {
          setBalance(data.balance);
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error al actualizar el balance:", error);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 30000);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [user?.id, API_URL, balance]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
