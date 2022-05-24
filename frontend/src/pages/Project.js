import { useEffect, useState } from 'react';
import { Card, Dropleft, ProjectForm, Spinner } from '../components';
import { useGlobal, useProject } from '../hooks';

const Project = () => {
    const icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>;
    const orders = [
        'Date - Ascending',
        'Date - Descending',
    ]
    const { openModal, openToast } = useGlobal();
    const [type, setType] = useState('all');
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [order, setOrder] = useState(orders[0]);
    const { projects, fetchProjects, createProject, updateProject, updateStream, removeProject, loading } = useProject();

    useEffect(() => {
        fetchProjects();
    }, [])

    useEffect(() => {
        const sorted = sort(projects, order);
        if (type === 'all') {
            setFilteredProjects([...sorted]);
        } else {
            const filtered = sorted.filter(project => project.project_type.toLowerCase() === type);
            setFilteredProjects([...filtered]);
        }
    }, [projects]);

    const sort = (items, order) => {
        const asc = new RegExp('asc', 'i');
        const desc = new RegExp('desc', 'i');
        if (asc.test(order)) {
            const sorted = items.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
            return sorted;
        }
        if (desc.test(order)) {
            const sorted = items.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
            return sorted;
        }
        return []
    }

    const handleSort = (item) => {
        setOrder(item);
        const sorted = sort(filteredProjects, item);
        setFilteredProjects([...sorted]);
    }

    const handleFilter = (type) => {
        type = type.toLowerCase();
        setType(type);
        const sorted = sort(projects, order);
        if (type === 'all') {
            setFilteredProjects([...sorted]);
        } else {
            const filtered = sorted.filter(project => project.project_type.toLowerCase() === type);
            setFilteredProjects([...filtered]);
        }
    }

    const handleUpdate = (project) => {
        openModal(<ProjectForm submit={(payload) => updateProject(project._id.$oid, payload)} project={project} />)
    }

    return (
        <div className="py-10 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-semibold text-2xl pb-2">Project</p>
                    <p className="font-light text-md text-gray-600">Create and manage your own project here</p>
                </div>
                <button type="button" className="btn px-2 py-2" onClick={() => openModal(<ProjectForm submit={createProject} />)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="flex gap-4 mb-12">
                <button type="button" className={`border shadow-md ${type === 'all' ? 'btn' : 'btn-invert'}`} onClick={() => handleFilter('all')}>All</button>
                <button type="button" className={`border shadow-md ${type === 'historical' ? 'btn' : 'btn-invert'}`} onClick={() => handleFilter('historical')}>Historical</button>
                <button type="button" className={`border shadow-md ${type === 'filtered' ? 'btn' : 'btn-invert'}`} onClick={() => handleFilter('filtered')}>Filtered Stream</button>
                <button type="button" className={`border shadow-md ${type === 'volume' ? 'btn' : 'btn-invert'}`} onClick={() => handleFilter('volume')}>Volume Stream</button>
                <div className="ml-auto">
                    <Dropleft items={orders} selected={order} handleClick={handleSort} icon={icon} />
                </div>

            </div>
            <div className="grid grid-cols-1 justify-items-center md:justify-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {
                    loading.project
                        ? <div className="fixed top-1/2 left-1/2">
                            <Spinner />
                        </div>
                        : filteredProjects.map(project =>
                            <Card key={project._id.$oid} project={project} updateStream={updateStream} removeProject={() => removeProject(project._id.$oid)} updateProject={() => handleUpdate(project)} handleClick={() => handleUpdate(project)} />
                        )
                }
            </div>
        </div >
    );
}

export default Project;