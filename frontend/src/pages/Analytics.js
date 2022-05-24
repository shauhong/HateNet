import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import ReactTooltip from 'react-tooltip';
import { Dropleft, Filter, Map, Leaderboard, Spinner } from '../components';
import { useChart, useData, useProject } from '../hooks';
import { config } from '../chart.config';

const Analytics = () => {
    const icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>;
    const filters = {
        time: ['Past Month', 'Past Year', 'All Time'],
        type: ['All', 'Racist', 'Sexist', 'Religion', 'Homophobe']
    };
    const [authors, setAuthors] = useState([]);
    const [content, setContent] = useState("");
    const [filter, setFilter] = useState({
        trend: {
            time: filters.time[0],
            type: filters.type[0]
        },
        distribution: {
            time: filters.time[0]
        },
        geography: {
            time: filters.time[0],
            type: filters.type[0]
        },
        term: {
            time: filters.time[0],
            type: filters.type[0]
        },
        author: {
            time: filters.time[0],
            type: filters.type[0]
        }
    });
    const [page, setPage] = useState({
        term: 0,
        author: 0,
    });
    const { chart: trend, updateTrend, reset: resetTrend } = useChart();
    const { chart: distribution, updateDistribution, reset: resetDistribution } = useChart();
    const { chart: geography, updateField: updateGeography, reset: resetGeography } = useChart();
    const { chart: author, updateField: updateAuthor, reset: resetAuthor } = useChart();
    const { chart: term, updateTFIDF, getDocuments, reset: resetTerm } = useChart();
    const { project, projects, setProject, updateMonitor } = useProject();
    const { aggregate, fetchAggregate, TFIDF, fetchTFIDF, loading } = useData();

    useEffect(() => {
        if (project && aggregate[project.name]) {
            const authors = aggregate[project.name]['all'].author;
            const updated = [];
            for (const [index, label] of author.labels.entries()) {
                const current = authors.find((element) => element.username === label);
                current['count'] = author.data[index];
                updated.push(current);
            }
            setAuthors([...updated]);
        }
    }, [author])

    useEffect(() => {
        if (project && aggregate[project.name] && aggregate[project.name]['all']) {
            updateTrend(aggregate[project.name]['all'].aggregate, filter.trend.time, filter.trend.type !== "All" ? filter.trend.type : null);
            updateDistribution(aggregate[project.name]['all'].aggregate, filter.distribution.time);
            updateGeography(aggregate[project.name]['all'].aggregate, 'location', filter.geography.time, filter.geography.type !== 'All' ? filter.geography.type : null);
            updateAuthor(aggregate[project.name]['all'].aggregate, 'author', filter.author.time, filter.author.type !== 'All' ? filter.author.type : null);
            const documents = getDocuments(aggregate[project.name]['all'].aggregate, filter.trend.time);
            fetchTFIDF(project.name, "all", filter.term.time, documents);
        }
    }, [aggregate, project, filter])

    useEffect(() => {
        if (project && TFIDF[project.name] && TFIDF[project.name]["all"] && TFIDF[project.name]["all"][filter.term.time.toLowerCase()]) {
            updateTFIDF(TFIDF[project.name]["all"][filter.term.time.toLowerCase()], filter.term.type !== "All" ? filter.term.type : null);
        }
    }, [TFIDF, filter, project])

    useEffect(() => {
        if (!project) {
            const first = projects.sort((a, b) => a.name < b.name ? -1 : 1)[0]
            if (first) {
                setProject(first);
                fetchAggregate(first.name, 'all');
            }
        } else {
            fetchAggregate(project.name, 'all')
        }
    }, [projects])

    const handleSelect = (project) => {
        resetTrend();
        resetDistribution();
        resetGeography();
        resetTerm();
        resetAuthor();
        project = projects.find(element => element.name === project)
        setProject(project);
        fetchAggregate(project.name, 'all')
    };

    const handleFilterChart = (chart, type, value) => {
        filter[chart][type] = value;
        setFilter({ ...filter });
    }

    const handleNavigate = (chart, value) => {
        if (chart === 'term') {
            if (term.data.length > 0) {
                value = value <= 0 ? 0 : value;
                value = value >= Math.ceil(term.data.length / 10) - 1 ? Math.ceil(term.data.length / 10) - 1 : value;
                page[chart] = value;
                setPage({ ...page });
            }
        }
        if (chart === 'author') {
            if (author.data.length > 0) {
                value = value <= 0 ? 0 : value;
                value = value >= Math.ceil(author.data.length / 5) - 1 ? Math.ceil(author.data.length / 5) - 1 : value;
                page[chart] = value;
                setPage({ ...page });
            }
        }
    }

    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Analytics</p>
                    <p className="font-light text-md text-gray-600">Analysis and visualization of hate speech detection results</p>
                </div>
                <Dropleft items={projects.map(project => project.name).sort()} handleClick={handleSelect} selected={project ? project.name : null} icon={icon} />
            </div>
            <div>
                <div className="mb-8">
                    <div className="grid grid-cols-12 gap-6 mb-6">
                        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl shadow-md h-96 flex flex-col px-6 py-4 justify-between items-center">
                            <div className="w-full flex justify-between px-2 mb-2">
                                <span className="text-lg font-semibold">Trend</span>
                                <Filter filters={filters} selected={filter.trend} handleClick={(type, value) => handleFilterChart('trend', type, value)} />
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
                        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl shadow-md h-96 px-6 py-4 flex flex-col justify-between items-center">
                            <div className="w-full flex justify-between px-2 mb-2">
                                <span className="text-lg font-semibold">Distribution</span>
                                <Filter filters={{ time: filters.time }} selected={filter.distribution} handleClick={(type, value) => handleFilterChart('distribution', type, value)} />
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
                                                        backgroundColor: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
                                                        borderColor: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
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
                    </div>

                    <div className="grid grid-cols-12 gap-6 mb-6">
                        <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl h-96 px-6 py-4 flex flex-col justify-between items-center shadow-md">
                            <div className="w-full flex justify-between px-2 mb-2">
                                <span className="text-lg font-semibold">Geography</span>
                                <Filter filters={filters} selected={filter.geography} handleClick={(type, value) => handleFilterChart('geography', type, value)} />
                            </div>
                            {
                                loading.aggregate
                                    ? <Spinner />
                                    : <>
                                        <Map
                                            setToolTipContent={setContent}
                                            data={geography.data}
                                            labels={geography.labels}
                                        />
                                        <ReactTooltip className="">{content}</ReactTooltip>
                                    </>
                            }
                        </div>

                        <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl shadow-md h-96 px-6 py-4 flex flex-col justify-between items-center">
                            <div className="w-full flex justify-between px-2 mb-2">
                                <span className="text-lg font-semibold">Term</span>
                                <Filter filters={filters} selected={filter.term} handleClick={(type, value) => handleFilterChart('term', type, value)} />
                            </div>
                            <div className="w-full h-full mb-2">
                                {
                                    loading.term
                                        ? <Spinner />
                                        : <Bar
                                            data={{
                                                labels: term.labels.slice(page.term * 10, page.term * 10 + 10),
                                                datasets: [{
                                                    data: term.data.slice(page.term * 10, page.term * 10 + 10),
                                                    backgroundColor: 'rgb(241, 241, 241)',
                                                    borderColor: 'rgb(241, 241, 241)',
                                                    hoverBackgroundColor: "rgb(14, 165, 233)",
                                                    borderWidth: 1,
                                                    borderRadius: 24,
                                                    maxBarThickness: 32,
                                                }]
                                            }}
                                            options={config.Horizontal.options}
                                        />
                                }
                            </div>
                            <div className="flex items-center justify-end gap-6 w-full">
                                <span className="text-gray-500">Page {page.term + 1} of {Math.ceil(term.labels.length / 10)}</span>
                                <div className="flex justify-between gap-2">
                                    <button className="group" onClick={() => handleNavigate('term', 0)}>
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
                                    <button className="group" onClick={() => handleNavigate('term', Math.ceil(term.data.length / 10) - 1)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12">
                        <div className="col-span-12 lg:col-span-8 lg:col-start-3 bg-white rounded-3xl shadow-md px-6 py-4 space-y-2">
                            <div className="w-full flex justify-between px-2 mb-4">
                                <span className="text-lg font-semibold">User</span>
                                <Filter filters={filters} selected={filter.author} handleClick={(type, value) => handleFilterChart('author', type, value)} />
                            </div>
                            <Leaderboard users={authors.slice(page.author * 5, page.author * 5 + 5)} updateMonitor={(id, method) => updateMonitor(project ? project.name : null, id, method)} monitor={project ? project.monitor : []} loading={loading.user} />
                            <div className="flex items-center justify-end gap-6 w-full">
                                <span className="text-gray-500">Page {page.author + 1} of {Math.ceil(author.data.length / 5)}</span>
                                <div className="flex justify-between gap-2">
                                    <button className="group" onClick={() => handleNavigate('author', 0)}>
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
                                    <button className="group" onClick={() => handleNavigate('author', Math.ceil(author.data.length / 5) - 1)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;