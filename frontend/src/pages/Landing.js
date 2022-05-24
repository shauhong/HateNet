import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { Header } from '../components';
import { useGlobal } from '../hooks';

const Landing = () => {
    let [params, setParams] = useSearchParams();
    const { auth } = useGlobal();

    return (
        <>
            {
                auth && auth.type === 'user'
                    ?
                    <Navigate to={params.get("code") && params.get("state") ? `/user/personal/?code=${params.get("code")}&state=${params.get("state")}` : "/user/personal"} />
                    :
                    auth && auth.type === 'activist'
                        ?
                        <Navigate to="/activist" />
                        :
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <Outlet />
                        </div>
            }
        </>
    );
}

export default Landing;