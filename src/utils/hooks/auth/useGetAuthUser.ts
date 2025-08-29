import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '../../../api/auth';

/** Gets authenticated user from the database. */
export default function useGetAuthUser() {
    return useQuery({
        queryKey: ['get-auth'],
        queryFn: getAuthUser,
    });
}
