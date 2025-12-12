import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './apiConstants';

export const useSendFriendRequest = () => {
  return useMutation({
    mutationFn: async (userEmail: string) => {
      const response = await axiosInstance.post('/friend/request', {
        userEmail
      });
      return response?.data;
    },
  });
};

export const useAcceptFriendRequest = () => {
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await axiosInstance.put('/friend/accept-request', {
        requestId,
      });
      return response?.data;
    },
  });
};

export const useRejectFriendRequest = () => {
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await axiosInstance.put('/friend/reject-request', {
        requestId,
      });
      return response?.data;
    },
  });
};

export const useGetMyFriendRequests = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ['my-friend-requests', page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get('/friend/my-friend-requests', {
        params: { page, limit },
      });
      return response?.data;
    },
  });
};

export const useGetMyFriends = ({
  page,
  limit,
  q,
}: {
  page: number;
  limit: number;
  q?: string;
}) => {
  return useQuery({
    queryKey: ['my-friends', page, limit, q],
    queryFn: async () => {
      const response = await axiosInstance.get('/friend/my-friends', {
        params: { page, limit, q },
      });
      return response?.data;
    },
  });
};

export const useRemoveFriend = () => {
  return useMutation({
    mutationFn: async (friendId: string) => {
      const response = await axiosInstance.delete('/friend/remove-friend', {
        data: { friendId },
      });
      return response?.data;
    },
  });
};

export const useGetUserById = (friendId: string) => {
  return useQuery({
    queryKey: ['user-by-id', friendId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/user/profile/${friendId}`);
      return response?.data;
    },
  });
};

export const checkUserByUserIdOrEmail = async (idOrEmail: string) => {
  const response = await axiosInstance.get(`/user/profile/${idOrEmail}`);
  return response?.data;
};

export const getUserByWalletAddress = async (wallet_public_key: string) => {
  try {
    const response = await axiosInstance.post(`/user/profile/searchByWallet`, {
      wallet_public_key,
    });

    if (response?.data?.success) return response?.data?.data;
    return null;
  } catch (err: any) {
    console.log('ERR GETTING USER BY WALLET:', err.response?.data);
    return null;
  }
};

export const useApplyReferalCode = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await axiosInstance.post(`/referalCode`, {
        code,
      });
      return response?.data;
    },
    mutationKey: ['apply-referal-code'],
  });
};

export const useGetMyReferalCode = () => {
  return useQuery({
    queryFn: async () => {
      const response = await axiosInstance.get(`/referalCode`);
      return response?.data;
    },
    queryKey: ['apply-referal-code'],
  });
};

export const useRedeemPointsCashback = () => {
  return useMutation({
    mutationFn: async (_: any) => {
      const response = await axiosInstance.post(`/redeemCashback`);
      return response?.data;
    },
    mutationKey: ['redeem-points-cashback'],
  });
};
