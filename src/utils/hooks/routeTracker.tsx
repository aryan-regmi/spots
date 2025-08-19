const visitedRoutes: string[] = [];

export let trackRoutes = [false];

/** Tracks the routes visited in the console.*/
export function trackRoute(path: string) {
    if (trackRoutes[0]) {
        visitedRoutes.push(path);
        console.log('Visited routes:', visitedRoutes);
    }
}

export function basicTracker(request: Request) {
    const url = new URL(request.url);
    trackRoute(url.pathname);
}
