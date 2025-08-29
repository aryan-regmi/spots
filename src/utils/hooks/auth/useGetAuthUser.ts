import { getAuthUser } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';

/** Gets authenticated user from the database. */
export default function useGetAuthUser() {
    return useQuery({
        queryKey: ['get-auth'],
        queryFn: getAuthUser,
    });
}
