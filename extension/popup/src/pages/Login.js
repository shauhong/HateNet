import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useGlobal } from "../hooks";

const Login = () => {
    const { login, auth } = useGlobal();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const handleFormChange = (e, field) => {
        form[field] = e.target.value;
        setForm({ ...form });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            username: form.username,
            password: form.password
        };
        const headers = new Headers({
            'Content-Type': 'application/json',
        });
        const init = {
            headers: headers,
            method: "POST",
            body: JSON.stringify(payload)
        };
        try {
            const response = await fetch("http://127.0.0.1:5000/auth/login", init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const user = await response.json();
            login({
                type: user.user_type,
                username: user.username
            });
            navigate("/analytics");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        auth ?
            <Navigate to="/analytics" />
            :
            <div className="flex-1 flex items-center justify-center">
                <div className="flex-1 max-w-[80%] my-6">
                    {/* Header */}
                    <div className='mb-6'>
                        <p className="font-bold text-center text-3xl">Welcome back</p>
                    </div>
                    {/* Form */}
                    <div className="mx-8">
                        <form>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                                <input type="text" className="block w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" placeholder="Username" value={form.username} onChange={(e) => handleFormChange(e, 'username')} />
                            </div>
                            <div className="mt-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                                <input type="password" className="block w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" placeholder="Password" value={form.password} onChange={(e) => handleFormChange(e, 'password')} />
                            </div>
                            <div className="mt-6">
                                <input className="bg-sky-500 text-white font-medium rounded-3xl px-4 py-2 hover:bg-sky-600 whitespace-nowrap w-full cursor-pointer" type="submit" value="Login" onClick={handleSubmit} />
                            </div>
                            <div className="mt-4 font-medium">
                                <span>Don't have an account? <a href="http://localhost:3000/auth/register" target="_blank"><span className="text-sky-500 hover:text-sky-600">Register</span></a></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
    );


}

export default Login;