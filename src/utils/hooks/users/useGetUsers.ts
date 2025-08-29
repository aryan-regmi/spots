import { getUsers } from '@/api/users';
import { useQuery } from '@tanstack/react-query';

/** Gets all users from the database. */
export default function useGetUsers() {
    return useQuery({
        queryKey: ['get-users'],
        queryFn: getUsers,
    });
}
