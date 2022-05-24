/*global chrome*/
import { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import { useGlobal } from "../hooks";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
    const navigate = useNavigate();
    const { logout } = useGlobal();
    const [data, setData] = useState({
        labels: [],
        data: []
    });

    useEffect(() => {
        chrome.storage.sync.get("data", (storage) => {
            if (storage.data) {
                setData({
                    labels: Object.keys(storage.data),
                    data: Object.values(storage.data)
                });
            }
        });
    }, []);

    useEffect(() => {
        const handleUpdate = (changes, namespace) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key === 'data') {
                    setData({
                        labels: Object.keys(newValue),
                        data: Object.values(newValue)
                    })
                }

            }
        }
        chrome.storage.onChanged.addListener(handleUpdate);
        return () => chrome.storage.onChanged.removeListener(handleUpdate);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    }

    return (
        <div className="container flex-1 flex flex-col justify-between gap-y-4">
            <div className="flex gap-x-4 py-4 px-8 items-center border-b">
                <svg xmlns="http://www.w3.org/2000/svg" className="fill-sky-500 inline-block h-6 w-6" viewBox="0 0 512 512">
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                </svg>
                <p className="text-xl font-bold">HateNet <span className="text-sky-500">for Chrome</span></p>
            </div>
            <div className="flex-1 px-6">
                <Pie
                    data={{
                        labels: data.labels,
                        datasets: [
                            {
                                data: data.data,
                                backgroundColor: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
                                borderColor: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
                                borderWidth: 1,
                                hoverOffset: 10,
                                fill: true,
                            }
                        ]
                    }}
                    options={{
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 5,
                                bottom: 5
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                padding: 10,
                            },
                            tooltip: {
                                titleColor: "rgb(255, 255, 255)",
                                backgroundColor: "#000",
                                padding: 10,
                                bodyColor: "#fff",
                                cornerRadius: 20,
                                boxPadding: 5,
                                displayColors: false,
                                caretPadding: 5,
                            }
                        }
                    }}
                />
            </div>
            <div className="flex justify-between py-4 px-8 items-center border-t">
                <a className="flex items-center gap-x-2 group" href="http://localhost:3000" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="text-lg font-semibold group-hover:text-sky-500">Connect to HateNet</span>
                </a>
                <button onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default Analytics