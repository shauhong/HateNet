import { useRef } from 'react';
import { formatTime } from '../utils';
import logo from '../assets/logo.svg';

const Profile = ({ user }) => {
    const imgRef = useRef(null);

    const handleError = () => {
        imgRef.current.src = logo;
    }

    return (
        <div className="group relative bg-white rounded-3xl shadow-md px-6 py-4 overflow-x-hidden space-y-4 flex flex-col justify-center h-full w-full">
            <div className="grid grid-cols-12 gap-x-4 space-y-4">
                <div className="col-span-12">
                    {
                        user ?
                            <img
                                ref={imgRef}
                                src={user.profile_image_url}
                                alt=""
                                onError={handleError}
                                className="w-16 h-auto object-contain rounded-full" />
                            :
                            <div className="w-16 h-16 rounded-full bg-gray-200">
                            </div>
                    }
                </div>
                <div className="col-span-12 space-y-2 my-auto ">
                    <div>
                        {
                            user ?
                                <>
                                    <p className="text-xl font-extrabold whitespace-nowrap overflow-hidden text-ellipsis">{user ? user.name : "Name"}</p>
                                    <p className="text-sm font-medium text-gray-500">@{user ? user.username : "username"}</p>
                                </>
                                :
                                <>
                                    <div className="w-36 h-5 bg-gray-400 rounded-full mb-2"></div>
                                    <div className="w-36 h-3 bg-gray-200 rounded-full"></div>
                                </>
                        }
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                {
                    user ?
                        <p className="font-medium">{user.description}</p>
                        :
                        <>
                            <div className="h-3 w-64 md:w-80 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-48 md:w-72 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-64 md:w-80 bg-gray-200 rounded-full"></div>
                        </>
                }
            </div>
            {
                user ?
                    <div className="flex space-x-12">
                        <div className="flex items-center gap-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-semibold">{user.location ? user.location : 'None'}</span>
                        </div>
                        <div className="flex items-center gap-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-semibold">Joined {formatTime(user.created_at.$date)}</span>
                        </div>
                    </div>
                    :
                    <div className="flex space-x-12">
                        <div className="flex items-center gap-x-1">
                            <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                            <div className="h-3 w-24 rounded-full bg-gray-200"></div>
                        </div>
                        <div className="flex items-center gap-x-1">
                            <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                            <div className="h-3 w-24 rounded-full bg-gray-200"></div>
                        </div>
                    </div>

            }
        </div>
    );
}

export default Profile;