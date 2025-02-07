import axios from 'axios';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASEPATH ,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;