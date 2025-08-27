import axios from 'axios';
interface LoginPayload {
  email: string;
  password: string;
}

export const loginService = async (payload: LoginPayload) => {
  const response = await axios.post('/login', payload);
  return response.data; // Contiene: { success, token, usuario }
};
