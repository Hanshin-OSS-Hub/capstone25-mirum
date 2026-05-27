import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useGetDeletedProject = () => {
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['deleted_projects'],
    queryFn: async () => {
      return await api.get('/api/project/deleted');
    },
    enabled: isTokenAvailable,
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      // 날짜 최신순 정렬
      return [...data].sort((a, b) => {
        const dateA = new Date(a.deletedDate);
        const dateB = new Date(b.deletedDate);
        return dateB - dateA;
      });
    },
  });
};
