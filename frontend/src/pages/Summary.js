import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Filter, Metrics, Profile, Leaderboard, Spinner } from '../components';
import { useData, useChart, useProject } from '../hooks';
import { config } from '../chart.config';

const Summary = () => {
    const filters = {
        time: ['Past Month', 'Past Year', 'All Time'],
        type: ['All', 'Racist', 'Sexist', 'Religion', 'Homophobe',],
        scope: ['All', 'Tweet', 'Reply'],
    }
    const [filter, setFilter] = useState({
        distribution: {
            time: filters.time[0],
            scope: filters.scope[0],
        },
        term: {
            time: filters.time[0],
            type: filters.type[0],
            scope: filters.scope[0],
        },
        trend: {
            time: filters.time[0],
            type: filters.type[0],
            scope: filters.scope[0],
        },
        author: {
            time: filters.time[0],
            type: filters.type[0],
            scope: filters.scope[0],
        }
    });
    const [page, setPage] = useState({
        term: 1,
        author: 1,
        timeline: 1,
    });
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { aggregate, fetchAggregate, user, fetchUser, loading, fetchTimeline, TFIDF, fetchTFIDF } = useData();
    const { project, fetchProject } = useProject();
    const { chart: distribution, updateDistribution } = useChart();
    const { chart: trend, updateTrend } = useChart();
    const { chart: author, updateField: updateAuthor } = useChart();
    const { chart: term, updateTFIDF, getDocuments } = useChart();
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        if (project && aggregate[project.name] && aggregate[project.name]) {
            const authors = aggregate[project.name][filter.author.scope.toLowerCase()].author;
            const updated = [];
            for (const [index, label] of author.labels.entries()) {
                const current = authors.find(element => element.username === label);
                current.count = author.data[index];
                updated.push(current);
            }
            setAuthors([...updated]);
        }
    }, [author]);

    useEffect(() => {
        if (project) {
            fetchAggregate(project.name, 'all');
            fetchAggregate(project.name, 'tweet');
            fetchAggregate(project.name, 'reply');
            // fetchTimeline(project.name, project.user.twitter_username);
            navigate(`${project.user.twitter_username}`);
            const username = project.user.twitter_username;
            if (username) {
                fetchUser(username);
            }
        }
    }, [project])

    useEffect(() => {
        fetchProject('personal');
    }, []);

    useEffect(() => {
        if (project && aggregate[project.name] && aggregate[project.name]['all']) {
            updateDistribution(aggregate[project.name][filter.distribution.scope.toLowerCase()].aggregate, filter.distribution.time);
            updateTrend(aggregate[project.name][filter.trend.scope.toLowerCase()].aggregate, filter.trend.time, filter.trend.type !== 'All' ? filter.trend.type : null);
            updateAuthor(aggregate[project.name][filter.author.scope.toLowerCase()].aggregate, 'author', filter.author.time, filter.author.type !== 'All' ? filter.author.type : null);
            const documents = getDocuments(aggregate[project.name][filter.term.scope.toLowerCase()].aggregate, filter.term.time);
            fetchTFIDF(project.name, filter.term.scope.toLowerCase(), filter.term.time, documents);
        }
    }, [aggregate, filter, project]);

    useEffect(() => {
        if (project && TFIDF[project.name] && TFIDF[project.name][filter.term.scope.toLowerCase()] && TFIDF[project.name][filter.term.scope.toLowerCase()][filter.term.time.toLowerCase()]) {
            updateTFIDF(TFIDF[project.name][filter.term.scope.toLowerCase()][filter.term.time.toLowerCase()], filter.term.type !== "All" ? filter.term.type : null);
        }
    }, [TFIDF, filter, project])

    const handleFilterChart = (chart, type, value) => {
        filter[chart][type] = value;
        setFilter({ ...filter });
    };

    const handleNavigate = (chart, value) => {
        if (chart === 'term') {
            if (term.data.length > 0) {
                value = value <= 1 ? 1 : value;
                value = value >= Math.ceil(term.data.length / 10) ? Math.ceil(term.data.length / 10) : value;
                page[chart] = value;
                setPage({ ...page });
            }
        }
        if (chart === 'author') {
            if (author.data.length > 0) {
                value = value <= 1 ? 1 : value;
                value = value >= Math.ceil(author.data.length / 5) ? Math.ceil(author.data.length / 5) : value;
                page[chart] = value;
                setPage({ ...page });
            }
        }
    };

    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Summary</p>
                    <p className="font-light text-md text-gray-600">Summary of hate speech detection results on your profile</p>
                </div>
            </div>

            <div className="grid grid-cols-12 mb-6 gap-6">
                <div className="col-span-12 lg:col-span-5 xl:col-span-6 h-80 relative group">
                    <Profile user={user} />
                </div>
                <div className="col-span-12 lg:col-span-7 xl:col-span-6 h-80">
                    <Metrics metrics={user ? user.metrics : null} />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl shadow-md h-96 px-6 py-4 flex flex-col justify-between items-center">
                    <div className="w-full flex justify-between px-2 mb-2">
                        <span className="text-lg font-semibold">Distribution</span>
                        <Filter
                            filters={{ time: filters.time, scope: filters.scope }}
                            selected={filter.distribution}
                            handleClick={(type, value) => handleFilterChart('distribution', type, value)}
                        />
                    </div>
                    <div className="h-full w-full">
                        {
                            loading.aggregate
                                ? <Spinner />
                                : <Pie
                                    data={{
                                        labels: distribution.labels,
                                        datasets: [
                                            {
                                                data: distribution.data,
                                                backgroundColor: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#0c4a6e"],
                                                borderColor: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#0c4a6e"],
                                                borderWidth: 1,
                                                hoverOffset: 10,
                                                fill: true,
                                            }
                                        ]
                                    }}
                                    options={config.Pie.options}
                                />
                        }
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl shadow-md h-96 px-6 py-4 flex flex-col justify-between items-center">
                    <div className="w-full flex justify-between px-2 mb-2">
                        <span className="text-lg font-semibold">Term</span>
                        <Filter
                            filters={filters}
                            selected={filter.term}
                            handleClick={(type, value) => handleFilterChart('term', type, value)}
                        />
                    </div>
                    <div className="w-full h-full mb-1">
                        {
                            loading.term
                                ? <Spinner />
                                : <Bar
                                    data={{
                                        labels: term.labels.slice((page.term - 1) * 10, (page.term - 1) * 10 + 10),
                                        datasets: [
                                            {
                                                data: term.data.slice((page.term - 1) * 10, (page.term - 1) * 10 + 10),
                                                backgroundColor: 'rgb(241, 241, 241)',
                                                borderColor: 'rgb(241, 241, 241)',
                                                hoverBackgroundColor: "rgb(14, 165, 233)",
                                                borderWidth: 1,
                                                borderRadius: 24,
                                                maxBarThickness: 32,
                                            }
                                        ]
                                    }}
                                    options={config.Horizontal.options}
                                />
                        }
                    </div>
                    <div className="flex items-center justify-end gap-6 w-full">
                        <span className="text-gray-500">Page {page.term} of {Math.ceil(term.labels.length / 10)}</span>
                        <div className="flex justify-between gap-2">
                            <button className="group" onClick={() => handleNavigate('term', 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="group" onClick={() => handleNavigate('term', page.term - 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="group" onClick={() => handleNavigate('term', page.term + 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button className="group" onClick={() => handleNavigate('term', Math.ceil(term.data.length / 10))}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl shadow-md flex flex-col px-6 py-4 justify-between items-center min-h-[24rem]">
                    <div className="w-full flex justify-between px-2 mb-2">
                        <span className="text-lg font-semibold">Trend</span>
                        <Filter
                            filters={filters}
                            selected={filter.trend}
                            handleClick={(type, value) => handleFilterChart('trend', type, value)} />
                    </div>
                    <div className="h-full w-full">
                        {
                            loading.aggregate
                                ? <Spinner />
                                : <Bar
                                    data={{
                                        labels: trend.labels,
                                        datasets: [
                                            {
                                                data: trend.data,
                                                backgroundColor: 'rgb(241, 241, 241)',
                                                borderColor: 'rgb(241, 241, 241)',
                                                hoverBackgroundColor: "rgb(14, 165, 233)",
                                                borderWidth: 1,
                                                borderRadius: 24,
                                                maxBarThickness: 32,
                                            }
                                        ]
                                    }}
                                    options={config.Bar.options}
                                />
                        }
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl shadow-md px-6 py-4 space-y-2 flex flex-col">
                    <div className="w-full flex justify-between px-2 mb-4">
                        <span className="text-lg font-semibold">Hate Comments</span>
                        <Filter
                            filters={filters}
                            selected={filter.author}
                            handleClick={(type, value) => handleFilterChart('author', type, value)}
                        />
                    </div>
                    <div className="flex-1">
                        <Leaderboard users={authors.slice((page.author - 1) * 5, (page.author - 1) * 5 + 5)} />
                    </div>
                    <div className="flex items-center justify-end gap-6 w-full">
                        <span className="text-gray-500">Page {page.author} of {Math.ceil(author.data.length / 5)}</span>
                        <div className="flex justify-between gap-2">
                            <button className="group" onClick={() => handleNavigate('author', 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="group" onClick={() => handleNavigate('author', page.author - 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="group" onClick={() => handleNavigate('author', page.author + 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button className="group" onClick={() => handleNavigate('author', Math.ceil(author.data.length / 5))}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 relative">
                <div className="relative bg-white rounded-3xl shadow-md col-span-12  space-y-4 py-4">
                    <div className="max-w-sm md:max-w-lg mx-auto flex justify-between px-6 mb-2">
                        <div className="flex items-center gap-x-3">
                            <>
                                {
                                    matchPath("/user/summary/:username", pathname) ?

                                        <svg xmlns="http://www.w3.org/2000/svg" className="fill-sky-500 inline-block h-6 w-6" viewBox="0 0 512 512">
                                            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                                        </svg> :
                                        <button onClick={() => navigate(-1)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                        </button>
                                }
                            </>
                            <span className="text-lg font-semibold">
                                {
                                    matchPath("/user/summary/:username", pathname) ? "Timeline" : "Tweet"
                                }
                            </span>
                        </div>
                    </div>
                    <Outlet />
                </div>
            </div>

        </div>
    );
}

export default Summary;