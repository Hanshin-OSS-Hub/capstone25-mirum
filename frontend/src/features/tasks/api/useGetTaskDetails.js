import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useGetTaskDetails = () => {
  return useQuery({
    queryKey: ['task'],
    queryFn: async () => {
      return await api.get('/tasks');
    },
    refetchInterval: 2000,
    initialData: [],
    // select: (data) => {
    //   if (!Array.isArray(data)) {
    //     return [];
    //   }
    //   // 기본 필터링 기준 생각해볼 것
    // }
  });
};
