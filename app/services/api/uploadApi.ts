import { useMutation } from '@tanstack/react-query';
import { apiBaseUrl, axiosInstance } from './apiConstants';
import mime from 'mime'; // optional, helps set the correct content type

export const useUploadImage = () =>
  useMutation({
    mutationKey: ['uploadImage'],
    mutationFn: async (filePath: string) => {
      const formData = new FormData();

      // Extract filename
      const filename = filePath.split('/').pop() || 'image.jpg';
      const fileType = mime.getType(filePath) || 'image/jpeg';

      formData.append('image', {
        uri: filePath,
        name: filename,
        type: fileType,
      } as any);

      // Perform upload
      const response = await axiosInstance.post(
        `${apiBaseUrl}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
  });
