import { createContext, useState, useEffect } from "react";

const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [modal, setModal] = useState(false);
    const [content, setContent] = useState(null);
    const [toast, setToast] = useState(false);
    const [message, setMessage] = useState(null);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const auth = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")) : null;
        if (auth) {
            setAuth(auth);
            if (auth.type === 'user') {
                refresh();
            }
        }
        setAuth(localStorage.getItem("auth") ? JSON.parse(localStorage.getItem('auth')) : null);
    }, [])

    const refresh = async () => {
        try {
            const response = await fetch("auth/oauth/refresh");
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const user = await response.json();
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to refresh token'
            };
            openToast(message);
        }
    }

    const selectProject = (project) => {
        setProject(project);
    }

    const login = (user) => {
        setAuth(user);
        localStorage.setItem("auth", JSON.stringify(user));
    }

    const logout = () => {
        setAuth(null);
        localStorage.removeItem("auth");
    }

    const openModal = (content) => {
        setModal(true);
        setContent(content);
    }

    const closeModal = () => {
        setModal(false);
        setContent(null);
    }

    const openToast = (message) => {
        setMessage(message);
        setToast(true);
        setTimeout(closeToast, 5000);
    }

    const closeToast = () => {
        setToast(false);
        setMessage(null);
    }

    const value = { auth, modal, content, toast, message, project, login, logout, openModal, closeModal, openToast, closeToast, selectProject };

    return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export { GlobalContext, GlobalProvider };