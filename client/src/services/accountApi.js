import apiClient from '@/services/apiClient';

export async function patchMyProfile(body) {
  const { data } = await apiClient.patch('/users/me', body);
  return data.data;
}

export async function postChangePassword(body) {
  const { data } = await apiClient.post('/users/me/password', body);
  return data.data;
}
