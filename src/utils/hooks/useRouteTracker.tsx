import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const visitedRoutes: string[] = [];

/** Tracks the routes visited in the console.*/
export function useRouteTracker() {
    const location = useLocation();

    useEffect(() => {
        visitedRoutes.push(location.pathname);
        console.log('Visited routes:', visitedRoutes);
    }, [location.pathname]);
}
