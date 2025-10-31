import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './apiConstants';

export const useGetRecentActivities = ({
  page,
  limit,
  friendId,
}: {
  page: number;
  limit: number;
  friendId?: string;
}) => {
  return useQuery({
    queryKey: ['recent-activities', page, limit, friendId],
    queryFn: async () => {
      const response = await axiosInstance.get('/recent/activities', {
        params: { page, limit, friendId },
      });
      return response?.data;
    },
  });
};

export const useCreateActivity = () => {
  return useMutation({
    mutationFn: async function (data) {
      const response = await axiosInstance.post('/recent/activity', data);
      return response?.data;
    },
  });
};

export const useCreateMoneyLentActivity = () => {
  return useMutation({
    mutationFn: async function (data: any) {
      const response = await axiosInstance.post(
        '/recent/activity/moneyLent',
        data
      );
      return response?.data;
    },
  });
};
