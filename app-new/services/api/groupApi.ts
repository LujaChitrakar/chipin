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
    queryKey: [groupId, "groupById"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/group/${groupId}`);
      return response?.data;
    },
  });
};

export const useUpdateGroup = () => {
  return useMutation({
    mutationFn: async (updateData: { groupId: string; data: any }) => {
      const response = await axiosInstance.put(
        `/group/${updateData.groupId}`,
        updateData.data
      );
      return response?.data;
    },
  });
};

export const useJoinGroupByGroupCode = () => {
  return useMutation({
    mutationFn: async (groupCode: string) => {
      const response = await axiosInstance.post(`/group/${groupCode}/join`);
      return response?.data;
    },
  });
};

export const useSearchGroupByGroupCode = (groupCode: string) => {
  return useQuery({
    queryFn: async () => {
      const response = await axiosInstance.get(`/group/${groupCode}/find`);
      return response?.data;
    },
    queryKey: [groupCode, "groupByCode"]
  });
};

export const useAddExpense = () => {
  return useMutation({
    mutationKey: ['addExpense'],
    mutationFn: async ({
      groupId,
      expenseData,
    }: {
      groupId: string;
      expenseData: any;
    }) => {
      const response = await axiosInstance.post(
        `/group/${groupId}/expense`,
        expenseData
      );
      return response?.data;
    },
  });
};

export const useUpdateExpense = () => {
  return useMutation({
    mutationKey: ['updateExpense'],
    mutationFn: async ({
      groupId,
      expenseId,
      expenseData,
    }: {
      groupId: string;
      expenseId: string;
      expenseData: any;
    }) => {
      const response = await axiosInstance.put(
        `/group/${groupId}/expense/${expenseId}`,
        expenseData
      );
      return response?.data;
    },
  });
};
export const useDeleteExpense = () => {
  return useMutation({
    mutationKey: ['deleteExpense'],
    mutationFn: async ({
      groupId,
      expenseId,
    }: {
      groupId: string;
      expenseId: string;
    }) => {
      const response = await axiosInstance.delete(
        `/group/${groupId}/expense/${expenseId}`
      );
      return response?.data;
    },
  });
};

export const useAddGroupPayment = () => {
  return useMutation({
    mutationKey: ['addPayment'],
    mutationFn: async ({
      groupId,
      paymentData,
    }: {
      groupId: string;
      paymentData: any;
    }) => {
      const response = await axiosInstance.post(
        `/group/${groupId}/payment`,
        paymentData
      );
      return response?.data;
    },
  });
};
