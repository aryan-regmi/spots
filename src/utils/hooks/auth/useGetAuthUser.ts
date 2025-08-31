import { getAuthUser } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';
import { atomWithQuery } from 'jotai-tanstack-query';

export default function useGetAuthUser() {
    return useQuery({
        queryKey: ['get-auth'],
        queryFn: getAuthUser,
    });
}
