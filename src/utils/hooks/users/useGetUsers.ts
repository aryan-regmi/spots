import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../api/users';

/** Gets all users from the database. */
export default function useGetUsers() {
    return useQuery({
        queryKey: ['get-users'],
        queryFn: getUsers,
    });
}
