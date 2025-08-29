import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../../api/users';

/** Gets user data from the database for the specfied user. */
export default function useGetUserData(username: string) {
    return useQuery({
        queryKey: ['get-user', username],
        queryFn: ({ queryKey }) => getUser(queryKey[1]),
    });
}
