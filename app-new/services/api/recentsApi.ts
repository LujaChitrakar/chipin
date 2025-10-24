import { useQuery } from '@tanstack/react-query';
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
        params: { page, limit, userId: friendId },
      });
      return response?.data;
    },
  });
};
