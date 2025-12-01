import { axiosInstance } from './apiConstants';


export const storeExpoNotificationToken = async (token: string, userEmail: string) => {
    const response = await axiosInstance.post('/user/store/notification', {
        token,
        userEmail
    });
    return response?.data;
};