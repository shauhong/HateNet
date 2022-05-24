import { useRef } from 'react';
import logo from '../assets/logo.svg'

const Thumbnail = ({ user, selected, handleClick }) => {
    const imgRef = useRef(null);

    const handleError = () => {
        imgRef.current.src = logo;
    }

    return (
        <div
            className={`h-12 min-w-fit flex items-center px-2 bg-white rounded-full border group ${(selected && selected._id.$oid === user._id.$oid) ? "bg-sky-500 text-white" : "hover:bg-sky-500 hover:text-white"}  transition-transform hover:scale-110 cursor-pointer`}
            onClick={handleClick}
        >
            <img ref={imgRef} src={user.profile_image_url} className="rounded-3xl aspect-square h-full w-auto object-contain -translate-x-2 bg-white " onError={handleError} />
            <span className="text-sm font-medium">{user.name}</span>
        </div>
    );
}

export default Thumbnail;