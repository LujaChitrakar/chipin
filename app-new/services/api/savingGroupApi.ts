import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from './apiConstants';

export const useCreateSavingGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (savingGroupData: any) => {
      const response = await axiosInstance.post(`/saving`, savingGroupData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
};

export const useGetMySavingGroups = ({
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
      const response = await axiosInstance.get(`/saving/my-groups`, {
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

export const useGetSavingGroupById = (savingGroupId: string) => {
  return useQuery({
    queryKey: [savingGroupId, 'savingGroupById'],
    queryFn: async () => {
      const response = await axiosInstance.get(`/saving/${savingGroupId}`);
      return response?.data;
    },
  });
};

export const useUpdateSavingGroup = () => {
  return useMutation({
    mutationFn: async (updateData: { savingGroupId: string; data: any }) => {
      const response = await axiosInstance.put(
        `/saving/${updateData.savingGroupId}`,
        updateData.data
      );
      return response?.data;
    },
  });
};

export const useJoinSavingGroupBySavingGroupCode = () => {
  return useMutation({
    mutationFn: async (savingGroupCode: string) => {
      const response = await axiosInstance.post(
        `/saving/${savingGroupCode}/join`
      );
      return response?.data;
    },
  });
};

export const useSearchSavingGroupBySavingGroupCode = (
  savingGroupCode: string
) => {
  return useQuery({
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/saving/${savingGroupCode}/find`
      );
      return response?.data;
    },
    queryKey: [savingGroupCode, 'savingGroupByCode'],
  });
};

export const useAddSavingGroupTransaction = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.put(`/saving/transaction`, data);
      return response?.data;
    },
  });
};
