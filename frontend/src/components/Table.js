import { useEffect, useState } from "react";
import { Post } from '../components';
import { useData, useGlobal, useProject } from "../hooks";
import { capitalize, formatDate } from "../utils";
import ReactTooltip from "react-tooltip";

const Table = ({ project, user, scope = "all" }) => {
    const { openModal } = useGlobal();
    const [page, setPage] = useState(1);
    const [term, setTerm] = useState("");
    const [status, setStatus] = useState(null);
    const [sorted, setSorted] = useState(null);
    const [reversed, setReversed] = useState(null);
    const [total, setTotal] = useState(0);
    const [tweets, setTweets] = useState([]);
    const [id, setId] = useState(null);
    const { fetchTweets, loading, fetchBlocks, blocks, block, unblock } = useData();
    const { updateMonitor } = useProject();

    useEffect(() => {
        setPage(1);
        fetch();
    }, [project, sorted, reversed, status, scope]);

    useEffect(() => {
        if (id) {
            clearTimeout(id);
        }
        const timeout = setTimeout(() => fetch(), 200);
        setId(timeout);
    }, [page]);

    useEffect(() => {
        if (user.type === 'user') {
            fetchBlocks();
        }
    }, []);

    const handleSearch = (e) => {
        setTerm(e.target.value);
    }

    const handleSort = (field, reverse = false) => {
        if (reverse) {
            setSorted(null);
            setReversed(field);
        } else {
            setSorted(field);
            setReversed(null);
        }
    }

    const handleFilter = (status) => {
        setStatus(status);
    }

    const navigate = (page) => {
        page = page <= 1 ? 1 : page;
        page = page >= total ? total : page;
        setPage(page);
    }

    const fetch = async () => {
        const sort = sorted ? "+" + sorted : reversed ? "-" + reversed : null;
        const { tweets, total } = await fetchTweets(project.name, sort, term, status, page, 10, scope.toLowerCase());
        setTweets([...tweets]);
        setTotal(total);
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex justify-between gap-2 sm:gap-4">
                    <button className={`font-semibold hover:text-sky-500 ${status === null && 'text-sky-500'}`} onClick={() => handleFilter(null)}>All</button>
                    <button className={`font-semibold hover:text-sky-500 ${status === 'none' && 'text-sky-500'}`} onClick={() => handleFilter('none')}>In Progress</button>
                    <button className={`font-semibold hover:text-sky-500 ${status === 'completed' && 'text-sky-500'}`} onClick={() => handleFilter('completed')}>Completed</button>
                </div>
                <div className="flex items-center ml-auto mb-4 gap-x-2">
                    <input type="text" placeholder="Search" className="block rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" value={term} onChange={handleSearch} />
                    <button onClick={fetch}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 mb-4 hide-scrollbar">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-4">Text</th>
                            <th className="text-left px-6 py-4 group">
                                <div className="flex items-center gap-x-1">
                                    <span>User</span>
                                    {
                                        sorted === "username" ?
                                            <button onClick={() => handleSort('username', true)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                </svg>
                                            </button>
                                            : reversed === "username" ?
                                                <button onClick={() => handleSort('username', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                                                    </svg>
                                                </button>
                                                : <button className="invisible group-hover:visible" onClick={() => handleSort('username', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                    </svg>
                                                </button>
                                    }
                                </div>
                            </th>
                            <th className="text-left px-6 py-4 group">
                                <div className="flex items-center gap-x-1">
                                    <span>Media</span>
                                    {
                                        sorted === "media" ?
                                            <button onClick={() => handleSort('media', true)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                </svg>
                                            </button>
                                            : reversed === "media" ?
                                                <button onClick={() => handleSort('media', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                                                    </svg>
                                                </button>
                                                : <button className="invisible group-hover:visible" onClick={() => handleSort('media', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                    </svg>
                                                </button>
                                    }
                                </div>
                            </th>
                            <th className="text-left px-6 py-4 group">
                                <div className="flex items-center gap-x-1">
                                    <span>Date</span>
                                    {
                                        sorted === "created_at"
                                            ? <button onClick={() => handleSort('created_at', true)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                </svg>
                                            </button>
                                            : reversed === "created_at"
                                                ? <button onClick={() => handleSort('created_at', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                                                    </svg>
                                                </button>
                                                : <button className="invisible group-hover:visible" onClick={() => handleSort('created_at', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                    </svg>
                                                </button>
                                    }
                                </div>
                            </th>
                            <th className="text-left px-6 py-4 group">
                                <div className="flex items-center gap-x-1">
                                    <span>Result</span>
                                    {
                                        sorted === "result"
                                            ? <button onClick={() => handleSort('result', true)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                </svg>
                                            </button>
                                            : reversed === "result"
                                                ? <button onClick={() => handleSort('result', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                                                    </svg>
                                                </button>
                                                : <button className="invisible group-hover:visible" onClick={() => handleSort('result', false)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                                    </svg>
                                                </button>
                                    }
                                </div>
                            </th>
                            <th className="text-center px-3 py-4">Action</th>
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
                                : tweets.length > 0
                                    ? tweets.map(tweet =>
                                        <tr key={tweet._id.$oid} className="odd:bg-white even:bg-gray-100 hover:bg-gray-200 cursor-pointer" onClick={() => openModal(<Post tweet={tweet} modal={true} toggable={false} reply={true} />)}>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">
                                                {tweet.text}
                                            </td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">
                                                {tweet.author.username}
                                            </td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">
                                                {capitalize(tweet.media_type)}
                                            </td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">
                                                {formatDate(tweet.created_at)}
                                            </td>
                                            <td className="px-6 py-3 max-w-md overflow-hidden whitespace-nowrap text-ellipsis">
                                                {capitalize(tweet.result)}
                                            </td>
                                            {
                                                user.type === 'activist'
                                                    ? project && project.monitor &&
                                                    <td className="py-2 text-center space-x-2">
                                                        {
                                                            project.monitor.find(author => author.username === tweet.author.username)
                                                                ? <button
                                                                    onClick={(e) => { e.stopPropagation(); updateMonitor(project.name, tweet.author._id.$oid, 'remove') }}
                                                                    data-tip="Unmonitor"

                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                    </svg>
                                                                </button>
                                                                : <button
                                                                    onClick={(e) => { e.stopPropagation(); updateMonitor(project.name, tweet.author._id.$oid, 'add') }}
                                                                    data-tip="Monitor"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                </button>
                                                        }
                                                        <a
                                                            href={`https://twitter.com/${tweet.author.username}/status/${tweet.tweet_id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            data-tip="Report"
                                                            className="inline-block"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        </a>
                                                        <ReactTooltip place="bottom" />
                                                    </td>
                                                    : <td className="py-2 text-center space-x-2">
                                                        <button
                                                            onClick={blocks.users && blocks.users.includes(tweet.author.username) ? (e) => { e.stopPropagation(); unblock(tweet.author.username) } : (e) => { e.stopPropagation(); block(tweet.author.username) }}
                                                            data-tip={blocks.users && blocks.users.includes(tweet.author.username) ? "Unblock" : "Block"}
                                                            disabled={
                                                                tweet.author.username === project.user.twitter_username ? true : false
                                                            }
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${tweet.author.username === project.user.twitter_username ? "stroke-gray-500 cursor-not-allowed" : blocks.users && blocks.users.includes(tweet.author.username) ? "stroke-sky-500" : "hover:stroke-sky-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        </button>
                                                        <a
                                                            href={`https://twitter.com/${tweet.author.username}/status/${tweet.tweet_id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-block"
                                                            data-tip="Report"
                                                            onClick={
                                                                (e) => {
                                                                    e.stopPropagation();
                                                                    if (tweet.author.username === project.user.twitter_username) e.preventDefault();
                                                                }
                                                            }
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${tweet.author.username === project.user.twitter_username ? "stroke-gray-500 cursor-not-allowed" : "hover:stroke-sky-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        </a>
                                                        <ReactTooltip place="bottom" />
                                                    </td>
                                            }
                                        </tr>
                                    )
                                    : <tr>
                                        <td colSpan={6} className="text-center py-4 font-semibold">No available data</td>
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

export default Table;

