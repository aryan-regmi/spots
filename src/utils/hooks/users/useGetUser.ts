import { getUser } from '@/api/users';
import { useQuery } from '@tanstack/react-query';

/** Gets the specfied user from the database. */
export default function useGetUser(username: string) {
    return useQuery({
        queryKey: ['get-user', username],
        queryFn: ({ queryKey }) => getUser(queryKey[1]),
    });
}
