import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './apiConstants';

export const useSendBorrowRequest = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/borrow/request', data);
      return response?.data;
    },
  });
};

export const useAcceptBorrowRequest = () => {
  return useMutation({
    mutationFn: async ({
      requestId,
      transactionId,
    }: {
      requestId: string;
      transactionId: string;
    }) => {
      const response = await axiosInstance.put('/borrow/accept-request', {
        requestId,
      });
      return response?.data;
    },
    mutationKey: ['accept-borrow'],
  });
};

export const useRejectBorrowRequest = () => {
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await axiosInstance.put('/borrow/reject-request', {
        requestId,
      });
      return response?.data;
    },
  });
};

export const useGetMySentBorrowRequests = ({
  page = 1,
  limit = 5,
  requested_to = '',
}: {
  page?: number;
  limit?: number;
  requested_to?: string;
}) => {
  return useQuery({
    queryKey: ['my-sent-requests', page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get('/borrow/my-sent-requests', {
        params: { page, limit, requested_to },
      });
      return response?.data;
    },
  });
};

export const useGetBorrowRequestsToMe = ({
  page = 1,
  limit = 5,
  requestor = '',
}: {
  page?: number;
  limit?: number;
  requestor?: string;
}) => {
  return useQuery({
    queryKey: ['requests-to-me', page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get('/borrow/requests-to-me', {
        params: { page, limit, requestor },
      });
      return response?.data;
    },
  });
};
