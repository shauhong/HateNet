import { useGlobal } from '../hooks';

const Toast = () => {
    const { toast, message, closeToast } = useGlobal();
    const color = {
        success: "bg-green-500",
        fail: 'bg-red-500',
        info: 'bg-sky-500',
        warning: 'bg-yellow-500'
    };

    return (
        <>
            {
                toast &&
                <div className="fixed bottom-4 right-5 pl-6 pr-2 py-4 bg-white rounded-2xl border overflow-x-hidden flex w-80 z-50">
                    <span className={`absolute h-full w-2 top-0 left-0 ${color[message.type]} rounded-r-full`}></span>
                    <span className="text-sm">{message.content}</span>
                    <button className="ml-auto group" onClick={closeToast}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            }
        </>
    );
}

export default Toast;