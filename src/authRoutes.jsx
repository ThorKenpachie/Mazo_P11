import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
    const token = localStorage.getItem('token');

    return (
        <Route
            {...rest}
            render={(props) =>
                token ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/login" /> // Redirect to login if not authenticated
                )
            }
        />
    );
};

export default PrivateRoute;