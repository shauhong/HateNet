import { useState, useEffect } from "react";
import { Post, ReportForm } from '../components';
import { useData, useGlobal, useProject } from "../hooks";
import { capitalize, formatDate } from "../utils";

const Report = () => {
    const { fetchReport, addToProjects, loading } = useData();
    const { projects } = useProject();
    const { openModal } = useGlobal();
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [tweets, setTweets] = useState([]);
    const [asc, setAsc] = useState(false);
    const [id, setId] = useState(null);

    useEffect(() => {
        setPage(1);
        fetch();
    }, [asc]);

    useEffect(() => {
        if (id) {
            clearTimeout(id);
        }
        const timeout = setTimeout(() => { fetch() }, 200);
        setId(timeout);
    }, [page]);

    const sort = () => {
        setAsc(!asc);
    }

    const navigate = (page) => {
        page = page <= 1 ? 1 : page;
        page = page >= total ? total : page;
        setPage(page);
    }

    const fetch = async () => {
        const { tweets, total } = await fetchReport(page, 20, asc);
        setTweets(tweets);
        setTotal(total);
    }

    const handleAdd = async (tweet, projects) => {
        await addToProjects(tweet, projects);
        fetch();
    }

    return (
        <>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 mb-4 hide-scrollbar">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-4">Text</th>
                            <th className="text-left px-6 py-4">User</th>
                            <th className="text-left px-6 py-4">Media</th>
                            <th className="text-left px-6 py-4">
                                <div className="flex items-center gap-x-1 group">
                                    <span>Date</span>
                                    {
                                        asc
                                            ? <button onClick={sort}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 invisible group-hover:visible hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                </svg>
                                            </button>
                                            :
                                            <button onClick={sort}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 invisible group-hover:visible hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                                                </svg>
                                            </button>
                                    }
                                </div>
                            </th>
                            <th className="text-left px-6 py-4">Result</th>
                            <th className="text-center px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading.tweets
                                ? [...Array(10)].map((element, index) =>
                                    <tr className="animate-pulse" key={index}>
                                        <td className="w-2/5 p-3">

                                            <div className="bg-gray-200 rounded-full h-[1.5rem]">
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="bg-gray-200 rounded-full h-[1.5rem]">
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="bg-gray-200 rounded-full h-[1.5rem]">
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="bg-gray-200 rounded-full h-[1.5rem]">
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="bg-gray-200 rounded-full h-[1.5rem]">
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="bg-gray-200 rounded-full h-[1.5rem]">
                                            </div>
                                        </td>
                                    </tr>
                                )
                                : tweets.length > 0 ?
                                    tweets.map(tweet =>
                                        <tr key={tweet._id.$oid} className="odd:bg-white even:bg-gray-100 hover:bg-gray-200 cursor-pointer" onClick={() => openModal(<Post tweet={tweet} modal={true} toggable={false} />)}>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">{tweet.text}</td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">{tweet.author.username}</td>
                                            <td className="px-6 py-3 max-w-md overflow-hidde3n whitespace-nowrap text-ellipsis">{capitalize(tweet.media_type)}</td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">{formatDate(tweet.created_at)}</td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">{capitalize(tweet.result)}</td>
                                            <td className="px-2 py-3 flex items-center justify-center gap-x-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" onClick={(e) => { e.stopPropagation(); openModal(<ReportForm projects={projects} add={(projects) => handleAdd(tweet, projects)} />) }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </td>

                                        </tr>
                                    )
                                    : <tr>
                                        <td colSpan={6} className="text-center py-4 font-semilbold">No available data</td>
                                    </tr>
                        }
                    </tbody>
                </table>
            </div>

            <div className="px-6 flex justify-end gap-6">
                <span className="text-gray-500">Page {page} of {total}</span>
                <div className="flex justify-betwen gap-2">
                    <button className="group" onClick={() => navigate(1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="group" onClick={() => navigate(page - 1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="group" onClick={() => navigate(page + 1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button className="group" onClick={() => navigate(total)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Report;