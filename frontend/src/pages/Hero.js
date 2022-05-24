import illustration from "../assets/hero.svg"
import { Link } from 'react-router-dom'

const Hero = () => {
    return (
        <div className="flex-1 mx-auto container flex items-center justify-center gap-24 px-4 flex-col md:flex-row ">
            <div className="md:flex-1 space-y-6">
                <p className="font-bold text-5xl text-center md:text-left">HateNet</p>
                <p className="text-gray-500 text-xl text-center md:text-left">Let us stop hate speech on Twitter. <br className="block md:hidden" />One tweet at a time.</p>
                <div className="w-fit mx-auto md:mx-0">
                    <Link to="/login">
                        <button className="btn rounded-3xl px-6 py-3">Get Started</button>
                    </Link>
                </div>
            </div>

            <div className="hidden md:block md:flex-1">
                <img className="w-full h-auto object-contain" src={illustration} alt="hero" />
            </div>
        </div>
    );
}

export default Hero;