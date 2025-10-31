import { Camera } from 'react-native-vision-camera';

export async function requestCameraPermission() {
  const permission = await Camera.requestCameraPermission();
  if (permission !== 'granted') {
    throw new Error('Camera permission not granted');
  }
}
