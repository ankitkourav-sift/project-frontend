import React from "react";
import { Navigate } from "react-router-dom";

function AdminProtectedRoute({children,role})
{
    const token = localStorage.getItem(`${role}token`);

    if(!token)
    {
        return <Navigate to={`/${role}main/${role}login`} replace/>;
    }

    return children;
}

export default AdminProtectedRoute;