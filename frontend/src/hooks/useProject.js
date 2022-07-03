import { useEffect, useState } from "react";
import { parseTime } from '../utils';
import { useCache, useGlobal } from "../hooks";

const useProject = () => {
    const { project, projects, setProject, setProjects } = useCache();
    const { openToast } = useGlobal();
    const [loading, setLoading] = useState({
        project: false,
    });

    useEffect(() => {
        if (projects.length === 0) {
            fetchProjects();
        }
    }, [])

    const fetchProject = async (name) => {
        try {
            const response = await fetch(`/project/${name}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let project = await response.json();
            if (project) {
                project = parseProject(project);
                setProjects([project]);
                setProject(project);
            }
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to retrieve project'
            };
            openToast(message);
        }
    }

    const fetchProjects = async () => {
        try {
            setLoading({ ...loading, project: true });
            const response = await fetch('/project/');
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const projects = await response.json();
            const parsed = projects.map(project => parseProject(project));
            setProjects([...parsed]);
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to retrieve projects'
            }
            openToast(message);
        } finally {
            setLoading({ ...loading, project: false });
        }
    };

    const createProject = async (payload) => {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        }
        try {
            const response = await fetch('/project/new', init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let project = await response.json()
            project = parseProject(project);
            const filtered = projects.filter(element => element._id.$oid !== project._id.$oid);
            filtered.push(project);
            setProjects([...filtered]);
            const message = {
                type: 'success',
                content: "Successfully create new project"
            };
            openToast(message);
        } catch (error) {
            const message = {
                type: 'fail',
                content: "Failed to create new project"
            }
            openToast(message);
        }
    }

    const updateProject = async (id, payload) => {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });
        const init = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        };
        try {

            const response = await fetch(`/project/update/${id}`, init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const raw = await response.json();
            const parsed = parseProject(raw);
            if (project && project._id.$oid === parsed._id.$oid) {
                setProject(parsed);
            }
            const filtered = projects.filter(element => element._id.$oid !== parsed._id.$oid);
            filtered.push(parsed);
            setProjects([...filtered]);
            const message = {
                type: 'success',
                content: "Successfully updated project"
            };
            openToast(message);
        } catch (error) {
            const message = {
                type: 'fail',
                content: "Failed to update project"
            };
            openToast(message);
        }

    }

    const updateUser = async (username, payload) => {
        const headers = new Headers({
            'Content-Type': 'application/json',
        });
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        };
        try {
            const response = await fetch(`/auth/update/${username}`, init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
        } catch (error) {
            const message = {
                'type': 'fail',
                'content': 'Failed to update user'
            };
            openToast(message);
        }
    }

    const removeProject = async (id) => {
        try {
            const response = await fetch(`/project/delete/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            if (project && project._id.$oid === id) {
                setProject(null);
            }
            const removed = projects.filter(project => project._id.$oid !== id);
            setProjects([...removed]);
            const message = {
                type: 'success',
                content: 'Successfully removed project',
            };
            openToast(message);
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to remove project',
            };
            openToast(message);
        }
    };

    const updateMonitor = async (name, id, method) => {
        try {
            const payload = {
                id,
                method
            };
            const headers = new Headers({
                'Content-Type': "application/json"
            });
            const init = {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            }
            const response = await fetch(`/project/${name}/monitor`, init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const raw = await response.json()
            const parsed = parseProject(raw);
            const updated = projects.filter(project => project.name !== name);
            if (project && project.name === parsed.name) {
                setProject(parsed);
            }
            updated.push(parsed);
            setProjects([...updated]);
            const message = {
                type: 'success',
                content: 'Successfully updated monitor list',
            }
            openToast(message);
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to add user to monitor list',
            }
            openToast(message);
        }
    }

    const updateStream = async (name, start = true) => {
        try {
            const url = start ? `/project/stream/start/${name}` : `/project/stream/stop/${name}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const raw = await response.json();
            const parsed = parseProject(raw);
            if (project && project._id.$oid === parsed._id.$oid) {
                setProject(parsed);
            }
            const updated = projects.filter(element => element._id.$oid !== parsed._id.$oid);
            updated.push(parsed);
            setProjects([...updated]);
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to update streaming',
            }
            openToast(message);
        }
    }

    const parseProject = (project) => {
        project.created_at = parseTime(project.created_at.$date);
        if (project.start && project.end) {
            project.start = parseTime(project.start.$date);
            project.end = parseTime(project.end.$date);
            const current = new Date()
            project.status = current.getTime() - project.end.getTime() > 0 ? "Completed" : "In Progress";
        }
        return project;
    };

    return { project, projects, loading, setProject, fetchProject, fetchProjects, createProject, updateProject, removeProject, updateUser, updateMonitor, updateStream };
}

export default useProject;