import { useMutation, useQuery } from '@tanstack/react-query';
import { apiBaseUrl, axiosInstance, baseUrl } from './apiConstants';
import { setItem } from 'expo-secure-store';

export const useLoginWithPrivy = () =>
  useMutation({
    mutationKey: ['loginWithPrivy'],
    mutationFn: async ({
      privyId,
      email,
    }: {
      privyId: string;
      email: string;
    }) => {
      const response = await axiosInstance.post(
        '/auth/signupOrLoginWithPrivy',
        {
          privyId,
          email,
        }
      );
      if (response?.data?.success) {
        setItem('token', response?.data?.data?.token);
      }
      return response.data;
    },
  });

export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ["myprofile"],
    queryFn: async () => {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    }
  })
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async (updateData: any) => {
      const response = await axiosInstance.put('/user/profile', updateData);
      return response.data;
    },
  })
}