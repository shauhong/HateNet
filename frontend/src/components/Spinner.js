const Spinner = () => {
    return (
        <div className="relative h-full w-full flex items-center justify-center gap-x-4">
            <div className="w-5 h-5 border shadow-md animate-bounce bg-sky-500 rounded-full">
            </div>
            <div className="w-5 h-5 border shadow-md animate-bounce bg-white rounded-full">
            </div>
            <div className="w-5 h-5 border shadow-md animate-bounce bg-sky-500 rounded-full">
            </div>
        </div>
    );
}

export default Spinner;