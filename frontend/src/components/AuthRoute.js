import { Navigate } from "react-router-dom";
import { useGlobal } from '../hooks';

const AuthRoute = ({ children, type }) => {
    const { auth } = useGlobal();

    return auth && auth.type === type ? children : <Navigate to="/login" />
}

export default AuthRoute;