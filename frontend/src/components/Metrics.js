import { formatNumber } from "../utils";

const Metrics = ({ metrics }) => {
    return (
        <div className="h-full bg-white rounded-3xl shadow-md flex flex-col justify-center items-center gap-y-12">
            <div className="flex w-3/4 items-center justify-between mx-auto">
                <div className="flex items-center gap-x-4">
                    <div className="rounded-full bg-sky-100 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-9 sm:w-9 fill-sky-500" viewBox="0 0 640 512">
                            <path d="M274.7 304H173.3C77.61 304 0 381.6 0 477.3C0 496.5 15.52 512 34.66 512H413.3C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM632.3 134.4c-9.703-9-24.91-8.453-33.92 1.266l-87.05 93.75l-38.39-38.39c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l56 56C499.5 285.5 505.6 288 512 288h.4375c6.531-.125 12.72-2.891 17.16-7.672l104-112C642.6 158.6 642 143.4 632.3 134.4z" /></svg>
                    </div>

                    <div>
                        <p className="text-lg sm:text-xl font-bold">{metrics ? formatNumber(metrics.followers_count) : 0}</p>
                        <p className="text-sm sm:text-base text-gray-500">Followers</p>
                    </div>
                </div>
                <div className="flex items-center gap-x-4">
                    <div>
                        <p className="text-lg sm:text-xl font-bold text-right">{metrics ? formatNumber(metrics.following_count) : 0}</p>
                        <p className="text-sm sm:text-base text-gray-500 text-right">Following</p>
                    </div>
                    <div className="rounded-full bg-sky-100 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-9 sm:w-9 fill-sky-500" viewBox="0 0 640 512">
                            <path d="M319.9 320c57.41 0 103.1-46.56 103.1-104c0-57.44-46.54-104-103.1-104c-57.41 0-103.1 46.56-103.1 104C215.9 273.4 262.5 320 319.9 320zM369.9 352H270.1C191.6 352 128 411.7 128 485.3C128 500.1 140.7 512 156.4 512h327.2C499.3 512 512 500.1 512 485.3C512 411.7 448.4 352 369.9 352zM512 160c44.18 0 80-35.82 80-80S556.2 0 512 0c-44.18 0-80 35.82-80 80S467.8 160 512 160zM183.9 216c0-5.449 .9824-10.63 1.609-15.91C174.6 194.1 162.6 192 149.9 192H88.08C39.44 192 0 233.8 0 285.3C0 295.6 7.887 304 17.62 304h199.5C196.7 280.2 183.9 249.7 183.9 216zM128 160c44.18 0 80-35.82 80-80S172.2 0 128 0C83.82 0 48 35.82 48 80S83.82 160 128 160zM551.9 192h-61.84c-12.8 0-24.88 3.037-35.86 8.24C454.8 205.5 455.8 210.6 455.8 216c0 33.71-12.78 64.21-33.16 88h199.7C632.1 304 640 295.6 640 285.3C640 233.8 600.6 192 551.9 192z" /></svg>
                    </div>
                </div>
            </div>
            <div className="flex w-3/4 items-center justify-between mx-auto">
                <div className="flex items-center gap-x-4">
                    <div className="rounded-full bg-sky-100 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-9 sm:w-9 fill-sky-500" viewBox="0 0 512 512">
                            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" /></svg>
                    </div>
                    <div>
                        <p className="text-lg sm:text-xl font-bold">{metrics ? formatNumber(metrics.tweet_count) : 0}</p>
                        <p className="text-sm sm:text-base text-gray-500">Tweets</p>
                    </div>
                </div>

                <div className="flex items-center gap-x-4">
                    <div>
                        <p className="text-lg sm:text-xl font-bold text-right">{metrics ? formatNumber(metrics.listed_count) : 0}</p>
                        <p className="text-sm sm:text-base text-gray-500 text-right">Listed</p>
                    </div>
                    <div className="rounded-full bg-sky-100 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-9 sm:w-9 fill-sky-500" viewBox="0 0 576 512"><path d="M0 96C0 60.65 28.65 32 64 32H512C547.3 32 576 60.65 576 96V416C576 451.3 547.3 480 512 480H64C28.65 480 0 451.3 0 416V96zM160 256C160 238.3 145.7 224 128 224C110.3 224 96 238.3 96 256C96 273.7 110.3 288 128 288C145.7 288 160 273.7 160 256zM160 160C160 142.3 145.7 128 128 128C110.3 128 96 142.3 96 160C96 177.7 110.3 192 128 192C145.7 192 160 177.7 160 160zM160 352C160 334.3 145.7 320 128 320C110.3 320 96 334.3 96 352C96 369.7 110.3 384 128 384C145.7 384 160 369.7 160 352zM224 136C210.7 136 200 146.7 200 160C200 173.3 210.7 184 224 184H448C461.3 184 472 173.3 472 160C472 146.7 461.3 136 448 136H224zM224 232C210.7 232 200 242.7 200 256C200 269.3 210.7 280 224 280H448C461.3 280 472 269.3 472 256C472 242.7 461.3 232 448 232H224zM224 328C210.7 328 200 338.7 200 352C200 365.3 210.7 376 224 376H448C461.3 376 472 365.3 472 352C472 338.7 461.3 328 448 328H224z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Metrics;