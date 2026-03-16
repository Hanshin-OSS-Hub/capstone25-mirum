import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useGetBoards = (projectId) => {
  return useQuery({
    queryKey: ['boards', projectId],
    queryFn: async () => {
      return await api.get(`/projects/${projectId}/boards`);
    },
    enabled: !!projectId,
    refetchInterval: 2000,
    initialData: [],
  });
};
