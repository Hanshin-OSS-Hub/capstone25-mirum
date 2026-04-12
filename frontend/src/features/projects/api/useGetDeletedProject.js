import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

export const useGetDeletedProject = () => {
  return useQuery({
    queryKey: ['deleted_projects'],
    queryFn: async () => {
      return await api.get('projects?deleted=true');
    },
    initialData: [],
    // enabled: false,
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      return [...data].sort((a, b) => {
        const dateA = new Date(a.updatedDate);
        const dateB = new Date(b.updatedDate);
        return dateB - dateA;
      });
    },
  });
};
