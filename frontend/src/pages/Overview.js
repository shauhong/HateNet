import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Dropleft, Filter, Table, Spinner } from '../components';
import { useChart, useGlobal, useProject, useData } from '../hooks';
import { config } from '../chart.config';

const Overview = () => {
    const filters = {
        time: ['Past Month', 'Past Year', 'All Time'],
        scope: ["All", "Tweet", "Reply"]
    };
    const icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>;
    const filterIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
    </svg>;
    const [filter, setFilter] = useState({
        activity: {
            time: filters.time[0],
        },
        tweet: {
            scope: filters.scope[0],
        }
    });
    const { auth } = useGlobal();
    const { chart: trend, updateTrend, reset } = useChart();
    const { project, projects, setProject } = useProject();
    const { progress, fetchProgress, aggregate, fetchAggregate, loading } = useData();

    useEffect(() => {
        if (project && aggregate[project.name] && aggregate[project.name]['all']) {
            updateTrend(aggregate[project.name]['all'].aggregate, filter.activity.time);
        }
    }, [aggregate, project, filter]);

    useEffect(() => {
        if (!project) {
            const first = projects.sort((a, b) => a.name < b.name ? -1 : 1)[0]
            if (first) {
                setProject(first);
                fetchProgress(first.name);
                fetchAggregate(first.name, 'all');
            }
        } else {
            fetchProgress(project.name);
            fetchAggregate(project.name, "all");
        }
    }, [projects]);

    const handleSelectProject = (project) => {
        reset();
        project = projects.find(element => element.name === project);
        setProject(project);
        fetchProgress(project.name);
        fetchAggregate(project.name, "all");
    };

    const handleFilterChart = (chart, type, value) => {
        filter[chart][type] = value;
        setFilter({ ...filter });
    };

    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Overview</p>
                    <p className="font-light text-md text-gray-600">Overview of hate speech detection results</p>
                </div>
                {
                    auth.type === "activist" &&
                    <Dropleft items={projects.map(project => project.name).sort()} handleClick={handleSelectProject} selected={project ? project.name : null} icon={icon} />
                }
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl h-96 px-6 py-4 flex flex-col justify-between items-center shadow-md">
                    <div className="w-full flex justify-between px-2 mb-2">
                        <span className="text-lg font-semibold">Trend</span>
                        <Filter filters={{ time: filters.time }} icon={filterIcon} selected={filter.activity} handleClick={(type, value) => handleFilterChart('activity', type, value)} />
                    </div>
                    <div className="w-full h-full">
                        {
                            loading.aggregate
                                ? <Spinner />
                                : <Bar data={{
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
                                }} options={config.Bar.options} />
                        }
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl h-96 px-6 py-4 flex flex-col justify-between items-center shadow-md">
                    <div className="w-full flex justify-between px-2 mb-2">
                        <span className="text-lg font-semibold">Progress</span>
                    </div>
                    <div className="w-full h-full">
                        {
                            loading.aggregate
                                ? <Spinner />
                                : <Doughnut data={{
                                    labels: ['Completed', 'In Progress'],
                                    datasets: [
                                        {
                                            data: project && progress[project.name] ? [progress[project.name]['completed'], progress[project.name]['progress']] : [0, 0],
                                            backgroundColor: [
                                                'rgb(14, 165, 233)',
                                                'rgb(241, 241, 241)'
                                            ],
                                            borderColor: [
                                                'rgb(14, 165, 233)',
                                                'rgb(241, 241, 241)'
                                            ],
                                            hoverOffset: 5,
                                        }
                                    ]
                                }} options={config.Doughnut.options} />
                        }
                    </div>
                </div>
            </div>

            <div className='shadow-md rounded-3xl p-6 bg-white'>
                <div className="flex justify-between mb-4">
                    <span className="font-semibold text-lg">Tweet</span>
                    {
                        auth.type === "user" &&
                        <Filter filters={{ scope: filters.scope }} icon={filterIcon} selected={filter.tweet} handleClick={(type, value) => handleFilterChart('tweet', type, value)} />
                    }
                </div>
                <Table project={project} user={auth} scope={auth.type === 'user' ? filter.tweet.scope : "all"} />
            </div>
        </div>
    );
}

export default Overview;
