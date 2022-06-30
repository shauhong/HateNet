import { useRef } from 'react';
import logo from '../assets/logo.svg';

const Leaderboard = ({ users, monitor, updateMonitor, loading }) => {
    const imgRef = useRef(null);

    const handleError = (e) => {
        // imgRef.current.src = logo;
        e.target.src = logo
    }

    return (
        <div className="w-full max-h-screen overflow-y-auto rounded-3xl">
            {
                loading || users.length === 0 ?
                    [...Array(5)].map((element, index) =>
                        <div key={index} className={`${loading && "animate-pulse"} grid grid-cols-12 px-6 py-3 first:border-t border-x border-b first:rounded-t-3xl last:rounded-b-3xl`}>
                            <div className="flex col-span-10 items-center gap-x-4">
                                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="w-3/4 h-6 rounded-full bg-gray-200"></div>
                                    <div className="w-3/4 h-4 rounded-full bg-gray-200"></div>
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <div className="w-3/4 h-6 rounded-full bg-gray-200"></div>
                                <div className="w-3/4 h-4 rounded-full bg-gray-200"></div>
                            </div>

                        </div>
                    )
                    :
                    users.map(user =>
                        <div key={user.username} className="group relative grid grid-cols-12 px-6 py-3 even:bg-gray-50 first:border-t border-x border-b first:rounded-t-3xl last:rounded-b-3xl">
                            <span className="absolute left-0 rounded-r-full bg-sky-500 transition-transform scale-y-0 -translate-x-full h-full w-2 group-hover:scale-y-100 group-hover:translate-x-0"></span>
                            <div className={monitor ? "col-span-8 flex items-center gap-x-4" : "col-span-10 flex items-center gap-x-4"}>
                                <span className="text-lg font-medium">{users.indexOf(user) + 1}</span>
                                <img
                                    // loading='lazy'
                                    onError={handleError}
                                    ref={imgRef}
                                    src={user.profile_image_url}
                                    alt=""
                                    className="rounded-full w-12 h-auto object-contain"
                                // onError={handleError}s
                                />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-lg font-semibold overflow-hidden whitespace-nowrap text-ellipsis">{user.name}</p>
                                    <p className="text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">{user.username}</p>
                                </div>
                            </div>
                            <div className='col-span-2'>
                                <p className="text-lg font-semibold text-sky-500">{user.count}</p>
                                <p className="text-sm font-medium text-gray-500 ">comments</p>
                            </div>
                            {
                                monitor &&
                                <div className="col-span-2 flex justify-center items-center ">
                                    {
                                        monitor.find(element => element.username === user.username) ?
                                            <button className="hover:text-sky-500" onClick={() => updateMonitor(user._id.$oid, 'remove')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            </button>
                                            :
                                            <button className="hover:text-sky-500" onClick={() => updateMonitor(user._id.$oid, 'add')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                    }
                                </div>
                            }
                        </div>
                    )
            }
        </div>
    );
}

export default Leaderboard;