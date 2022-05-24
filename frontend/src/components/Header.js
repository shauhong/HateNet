import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="sticky top-0 left-0 right-0 bg-white border-b z-10">
            <nav className="container mx-auto flex items-center justify-between p-4 mt-4">
                <div>
                    <Link to="/"><span className="cursor-pointer font-semibold text-2xl">HateNet</span></Link>
                </div>
                <ul className="flex items-center justify-between gap-6">
                    <li>
                        <Link to="/register"><span className="cursor-pointer hover:text-sky-500 font-semibold">Register</span></Link>
                    </li>
                    <li>
                        <Link to="/login"><span className="cursor-pointer hover:text-sky-500 font-semibold">Login</span></Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;