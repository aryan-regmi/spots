import { useQuery } from '@tanstack/react-query';
import { getEndpointAddr } from '../../api/network';

/** Gets the endpoint address for the specfied user from the database. */
export default function useGetEndpointAddr(username: string) {
    return useQuery({
        queryKey: ['get-endpoint-addr', username],
        queryFn: ({ queryKey }) => getEndpointAddr(queryKey[1]),
    });
}
