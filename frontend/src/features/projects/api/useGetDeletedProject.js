import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client.js";

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
        ///////////////////
        // 필드명 통일 필요 //
        ///////////////////
        const dateA = new Date(a.updateDate);
        const dateB = new Date(b.updateDate);
        return dateB - dateA;
      })
    },
  })
}