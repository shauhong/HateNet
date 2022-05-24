import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components';

const Dashboard = () => {
    const dashboardRef = useRef(null);

    const restore = () => {
        dashboardRef.current.scrollTo(0, 0);
    }

    return (
        <div className="h-screen flex overflow-hidden relative">
            <Sidebar handleClick={restore} />
            <div ref={dashboardRef} className="bg-gray-100 flex-1 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
}

export default Dashboard;