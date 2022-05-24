const PostSkeleton = ({ even, loading }) => {
    return (
        <div className={`${loading && "animate-pulse"} w-full max-w-xs md:max-w-xl bg-white border rounded-3xl p-6 mx-auto`}>
            <div className="flex flex-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full">
                </div>
                <div className="flex-1 space-y-2">
                    <div className="space-x-1 grid grid-cols-4">
                        <div className="col-span-1 h-4 bg-gray-200 rounded-full"></div>
                        <div className="col-span-1 h-4 bg-gray-200 rounded-full"></div>
                        <div className="col-span-1 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                    {
                        even ?
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded-full"></div>
                            </div>
                            :
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded-full"></div>
                                <div className="h-48 bg-gray-200 rounded-3xl"></div>
                            </div>
                    }
                    <div className="flex gap-x-6 justify-between items-center px-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostSkeleton;