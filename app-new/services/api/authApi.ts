import { useMutation, useQuery } from '@tanstack/react-query';
import { apiBaseUrl, axiosInstance, baseUrl } from './apiConstants';
import { setItem } from 'expo-secure-store';

export const useLoginWithPrivy = () =>
  useMutation({
    mutationKey: ['loginWithPrivy'],
    mutationFn: async (
      {
        privyId,
        email,
        wallet_public_key,
        expoPushToken
      }
        :
        {
          privyId: string;
          email: string;
          wallet_public_key: string;
          expoPushToken: string | null;
        }) => {
      const response = await axiosInstance.post(
        '/auth/signupOrLoginWithPrivy',
        {
          privyId,
          email,
          wallet_public_key,
          notificationToken: expoPushToken


        },
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



export const useUpdatePin = () => {
  return useMutation({
    mutationKey: ["updatePin"],
    mutationFn: async (updateData: any) => {
      console.log("auth api", updateData)
      const response = await axiosInstance.patch('/auth/pin', updateData);
      return response.data;
    },
  })
}


export const useVerifyPin = () => {
  return useMutation({
    mutationKey: ["verifyPin"],
    mutationFn: async (verifyData: any) => {
      try {

        const response = await axiosInstance.post('/auth/pin', verifyData);
        return response.data.success;
      } catch (err) {
        console.log("Verify pin ", err)
        return false;
      }
    },
  })
}

