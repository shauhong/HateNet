import { Outlet } from "react-router-dom";

const Landing = () => {
    return (
        <div className="h-[540px] w-[420px] flex flex-col border shadow-md overflow-y-auto">
            <Outlet />
        </div>
    );
}

export default Landing; 