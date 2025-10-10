import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './apiConstants';

// Create Group
export const useCreateGroup = () => {
  return useMutation({
    mutationFn: async (groupData: any) => {
      const response = await axiosInstance.post(`/group`, groupData);
      return response?.data;
    },
  });
};

// Get My Groups
export const useGetMyGroups = () => {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: async () => {
      const response = await axiosInstance.get(`/group/my-groups`);
      return response?.data;
    },
  });
};

// Get Group By Id
export const useGetGroupById = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/group/my-groups`, {
        params: { id: groupId },
      });
      return response?.data;
    },
    enabled: !!groupId,
  });
};

// Update Group
export const useUpdateGroup = () => {
  return useMutation({
    mutationFn: async (updateData: { id: string; data: any }) => {
      const response = await axiosInstance.put(
        `/group/my-groups`,
        updateData.data,
        {
          params: { id: updateData.id },
        }
      );
      return response?.data;
    },
  });
};
