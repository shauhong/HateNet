import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Dropleft, Filter, Metrics, Profile, Thumbnail, Spinner } from '../components';
import { useChart, useData, useProject } from '../hooks';
import { config } from '../chart.config';

const Monitor = () => {
    const icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>;
    const sortIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>;
    const orders = [
        'Name - Ascending',
        'Name - Descending'
    ];
    const filters = {
        time: ['Past Month', 'Past Year', 'All Time'],
        type: ['All', 'Racist', 'Sexist', 'Religion', 'Homophobe']
    };
    const [grid, setGrid] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filter, setFilter] = useState({
        trend: {
            time: filters.time[0],
            type: filters.type[0]
        },
        distribution: {
            time: filters.time[0]
        }
    });
    const [order, setOrder] = useState(orders[0]);
    const { monitor, fetchMonitor, loading } = useData();
    const { chart: distribution, updateDistribution, reset: resetDistribution } = useChart();
    const { chart: trend, updateTrend, reset: resetTrend } = useChart();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { project, projects, setProject, updateMonitor } = useProject();

    useEffect(() => {
        if (selectedUser && project && monitor[project.name] && monitor[project.name][selectedUser.username]) {
            updateDistribution(monitor[project.name][selectedUser.username], filter.distribution.time);
            updateTrend(monitor[project.name][selectedUser.username], filter.trend.time, filter.trend.type !== 'All' ? filter.trend.type : null);
        }
    }, [selectedUser, project, filter, monitor]);

    useEffect(() => {
        if (!project) {
            const first = projects.sort((a, b) => a.name < b.name ? -1 : 1)[0];
            if (first) {
                setProject(first);
            }
        }
    }, [projects]);

    const sort = (monitor, order) => {
        const regex = new RegExp('asc', 'i');
        if (regex.test(order)) {
            monitor.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
        } else {
            monitor.sort((a, b) => a.name > b.name ? -1 : a.name < b.name ? 1 : 0);
        }
        return monitor;
    }

    const handleFilterChart = (chart, type, value) => {
        filter[chart][type] = value;
        setFilter({ ...filter });
    };

    const handleSelectProject = (project) => {
        resetTrend();
        resetDistribution();
        project = projects.find(element => element.name === project);
        setProject(project);
    };

    const handleSelectUser = (user) => {
        setSelectedUser({ ...user });
        fetchMonitor(project.name, user.username);
        navigate(`${user.username}`);
    };

    const handleSelectOrder = (order) => {
        setOrder(order);
    };

    const toggleGrid = () => {
        setGrid(!grid);
    }

    const removeMonitor = (name, id) => {
        updateMonitor(name, id, 'remove');
        setSelectedUser(null);
    }

    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Monitor</p>
                    <p className="font-light text-md text-gray-600">Monitor and keep track of hate speech instigators</p>
                </div>
                <Dropleft items={projects.map(project => project.name).sort()} selected={project ? project.name : null} handleClick={handleSelectProject} icon={icon} />
            </div>
            <div>
                <div className="grid grid-cols-12 mb-6">
                    <div className="col-span-12 ">
                        <div className="flex gap-x-4 justify-end mb-4">
                            <Dropleft items={[...orders]} icon={sortIcon} handleClick={handleSelectOrder} selected={order} />
                            <button type="button" className={grid ? 'btn px-2 py-2' : 'btn-invert px-2 py-2'} onClick={toggleGrid}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                        </div>
                        <div
                            className={
                                `flex gap-4 hide-scrollbar bg-white p-4 rounded-3xl shadow-md min-h-[5rem] ${grid ? 'flex-wrap overflow-y-auto max-h-72' : 'overflow-x-auto'}`
                            }
                        >
                            {
                                project
                                    ? sort(project.monitor, order).map(author =>
                                        <Thumbnail key={author.username} user={author} handleClick={() => handleSelectUser(author)} selected={selectedUser} />
                                    )
                                    : [...Array(8)].map((element, index) =>
                                        <div className="px-2 h-12 bg-white rounded-full border flex items-center" key={index}>
                                            <div className="h-12 w-12 rounded-full bg-gray-200 -translate-x-2"></div>
                                            <div className="w-16 h-4 bg-gray-200 rounded-full"></div>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 mb-6 gap-6">
                    <div className="col-span-12 lg:col-span-6 xl:col-span-6 h-80 relative group">
                        <Profile user={selectedUser} />
                        <button
                            onClick={() => removeMonitor(project ? project.name : null, selectedUser._id.$oid)}
                            className="absolute top-5 right-5 hover:rounded-full hover:bg-dark-500 invisible group-hover:visible">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform hover:scale-110 hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        </button>
                    </div>
                    <div className="col-span-12 lg:col-span-6 xl:col-span-6 h-80">
                        <Metrics metrics={selectedUser ? selectedUser.metrics : null} />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6 mb-6">
                    <div className="col-span-12 xl:col-span-8 bg-white rounded-3xl shadow-md h-96 flex flex-col px-6 py-4 justify-between items-center">
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
                                        options={config.Line.options}
                                    />
                            }
                        </div>
                    </div>

                    <div className="col-span-12 xl:col-span-4 bg-white rounded-3xl shadow-md h-96 px-6 py-4 flex flex-col justify-between items-center">
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

                <div className="grid grid-cols-12 mb-6 gap-6 relative">
                    <div className="relative bg-white rounded-3xl shadow-md col-span-12  space-y-4 py-4">
                        <div className="max-w-sm md:max-w-xl mx-auto flex justify-between px-6 mb-2">
                            <div className="flex items-center gap-x-3">
                                <>
                                    {
                                        matchPath("/activist/monitor/:username/:id", pathname)
                                            ? <button onClick={() => navigate(-1)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                            </button>
                                            : <svg xmlns="http://www.w3.org/2000/svg" className="fill-sky-500 inline-block h-6 w-6" viewBox="0 0 512 512">
                                                <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                                            </svg>
                                    }
                                </>
                                <span className="text-lg font-semibold">
                                    {
                                        matchPath("/activist/monitor/:username", pathname) ? "Timeline" : "Tweet"
                                    }
                                </span>
                            </div>
                        </div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Monitor;