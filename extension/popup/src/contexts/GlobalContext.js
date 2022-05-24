import { createContext, useEffect, useState } from "react";

const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        setAuth(localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")) : null);
    }, []);

    const login = (user) => {
        setAuth(user);
        localStorage.setItem("auth", JSON.stringify(user));
    }

    const logout = () => {
        setAuth(null);
        localStorage.removeItem("auth");
    }

    const value = { auth, login, logout };

    return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>

};

export { GlobalContext, GlobalProvider }

