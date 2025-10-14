import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './apiConstants';

export const useCreateGroup = () => {
  return useMutation({
    mutationFn: async (groupData: any) => {
      const response = await axiosInstance.post(`/group`, groupData);
      return response?.data;
    },
  });
};

export const useGetMyGroups = ({
  page,
  limit,
  q,
}: {
  page: number;
  limit: number;
  q: string;
}) => {
  return useQuery({
    queryKey: ['my-groups', page, limit, q],
    queryFn: async () => {
      const response = await axiosInstance.get(`/group/my-groups`, {
        params: {
          page,
          limit,
          q,
        },
      });
      return response?.data;
    },
  });
};

export const useGetGroupById = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/group/${groupId}`);
      return response?.data;
    },
    enabled: !!groupId,
  });
};

export const useUpdateGroup = () => {
  return useMutation({
    mutationFn: async (updateData: { id: string; data: any }) => {
      const response = await axiosInstance.put(
        `/group/my-groups`,
        updateData.data,
        { params: { id: updateData.id } }
      );
      return response?.data;
    },
  });
};
