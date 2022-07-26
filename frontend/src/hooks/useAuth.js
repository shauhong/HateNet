import { useState } from "react";
import { useGlobal } from '../hooks';

const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const { openToast } = useGlobal();

    const register = async (username, password, email, type) => {
        const payload = {
            username: username,
            password: password,
            email: email,
            user_type: type,
        };
        const headers = new Headers({
            'Content-Type': 'application/json'
        });
        const init = {
            method: "POST",
            body: JSON.stringify(payload),
            headers: headers,
        };

        try {
            setLoading(true);
            const response = await fetch('/auth/register', init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const message = {
                type: 'success',
                content: 'Successfully register'
            };
            openToast(message);
            const { success } = await response.json();
            return { success };
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const login = async (username, password) => {
        const payload = {
            username: username,
            password: password
        };
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        })
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        }

        try {
            setLoading(true);
            const response = await fetch('/auth/login', init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const message = {
                type: 'success',
                content: 'Successfully login',
            }
            openToast(message);
            const user = await response.json();
            return { user };
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        try {
            setLoading(true);
            const response = await fetch('/auth/logout');
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const message = {
                type: 'success',
                content: 'Successfully logout',
            }
            openToast(message);
            const { success } = await response.json();
            return { success };
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return { loading, register, login, logout };
}

export default useAuth;