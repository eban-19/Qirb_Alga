import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHAPA_URL = 'https://api.chapa.co/v1';
const CHAPA_AUTH = `Bearer ${process.env.CHAPA_SECRET_KEY}`;

export interface ChapaInitializeData {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title: string;
    description: string;
  };
}

export const initializePayment = async (data: ChapaInitializeData) => {
  try {
    const response = await axios.post(`${CHAPA_URL}/transaction/initialize`, data, {
      headers: {
        Authorization: CHAPA_AUTH,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Chapa Initialization Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize Chapa payment');
  }
};

export const verifyPayment = async (txRef: string) => {
  try {
    const response = await axios.get(`${CHAPA_URL}/transaction/verify/${txRef}`, {
      headers: {
        Authorization: CHAPA_AUTH,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Chapa Verification Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify Chapa payment');
  }
};
