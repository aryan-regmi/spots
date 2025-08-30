import { getAuthUser } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';
import { atomWithQuery } from 'jotai-tanstack-query';

/** Gets authenticated user from the database. */
export default function useGetAuthUser() {
    return useQuery({
        queryKey: ['get-auth'],
        queryFn: getAuthUser,
    });
}

export const authUserAtom = atomWithQuery(() => ({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
}));
