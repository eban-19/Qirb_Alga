import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHAPA_URL = 'https://api.chapa.co/v1';

export interface ChapaInitializeData {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  "subaccounts[id]"?: string;
  customization?: {
    title: string;
    description: string;
  };
}

export interface ChapaSubaccountData {
  business_name: string;
  account_name: string;
  bank_code: string;
  account_number: string;
  split_type: 'percentage' | 'flat';
  split_value: number;
}

export const initializePayment = async (data: ChapaInitializeData) => {
  try {
    const authHeader = `Bearer ${process.env.CHAPA_SECRET_KEY}`;
    const response = await axios.post(`${CHAPA_URL}/transaction/initialize`, data, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Chapa Initialization Error Details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to initialize Chapa payment');
  }
};

export const verifyPayment = async (txRef: string) => {
  try {
    const authHeader = `Bearer ${process.env.CHAPA_SECRET_KEY}`;
    const response = await axios.get(`${CHAPA_URL}/transaction/verify/${txRef}`, {
      headers: {
        Authorization: authHeader,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Chapa Verification Error Details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to verify Chapa payment');
  }
};

export const createSubaccount = async (data: ChapaSubaccountData) => {
  try {
    const authHeader = `Bearer ${process.env.CHAPA_SECRET_KEY}`;
    const response = await axios.post(`${CHAPA_URL}/subaccount`, data, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Chapa Subaccount Creation Error Details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create Chapa subaccount');
  }
};
