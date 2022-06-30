import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useGlobal } from '../hooks';

const Register = () => {
    const { register } = useAuth();
    const { openToast } = useGlobal();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        password: '',
        email: '',
        twitter: '',
        type: 'user'
    });

    const handleFormChange = (e, field) => {
        console.log(field);
        console.log(e.target.value);
        form[field] = e.target.value;
        setForm({ ...form });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { success } = await register(form.username, form.password, form.email, form.type);
            navigate("/login");
        } catch (error) {
            const message = {
                type: 'fail',
                content: "Failed to register"
            }
            openToast(message);
        } finally {
            setForm({
                username: '',
                password: '',
                email: '',
                twitter: '',
                type: ''
            });
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex-1 max-w-md">
                <div className='mb-6'>
                    <p className="font-bold text-center text-5xl">Join us today</p>
                </div>
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
                        <div className="mt-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                            <input type="email" className="block w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" placeholder="Email" value={form.email} onChange={(e) => handleFormChange(e, 'email')} />
                        </div>
                        <div className="mt-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Twitter Username</label>
                            <input type="text" className="block w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" placeholder="Twitter Username" value={form.twitter} onChange={(e) => handleFormChange(e, 'twitter')} />
                        </div>
                        <div className="mt-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Account Type</label>
                            <select className="block w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" onChange={(e) => handleFormChange(e, 'type')} >
                                <option value="user">Twitter User</option>
                                <option value="activist">Human Rights Activist</option>
                            </select>
                        </div>
                        <div className="mt-6">
                            <input className="bg-sky-500 text-white font-medium rounded-3xl px-4 py-2 hover:bg-sky-600 whitespace-nowrap w-full" type="submit" value="Register" onClick={handleSubmit} />
                        </div>
                        <div className="mt-1 px-4">
                            <p
                                className="overflow-hidden font-medium text-center before:bg-gray-400 before:content-[''] before:inline-block before:h-[1px] before:relative before:align-middle before:w-[50%] before:right-0.5 before:-ml-[50%]
                            after:bg-gray-400 after:content-[''] after:inline-block after:h-[1px] after:relative after:align-middle after:w-[50%] after:left-0.5 after:-mr-[50%]"
                            >
                                or
                            </p>
                        </div>
                        <div className="mt-2">
                            <button className="flex justify-center items-center gap-x-4 bg-sky-500 text-white font-medium rounded-3xl px-4 py-2 hover:bg-sky-600 cursor-pointer w-full" onClick={handleSubmit}>
                                <div className="h-6 w-6 ">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="fill-white inline-block" viewBox="0 0 512 512">
                                        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                                    </svg>
                                </div>
                                <span>Register with Twitter</span>
                            </button>
                        </div>
                        <div className="mt-4 font-medium">
                            <span>Already have an account? <Link to="/login"><span className="text-sky-500 hover:text-sky-600">Login</span></Link></span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;