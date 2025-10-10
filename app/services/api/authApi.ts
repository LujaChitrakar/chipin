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
      console.log('RESPNSE::', response?.data);
      setItem('token', response?.data?.data?.token);
    },
  });
