import { SMSService } from '../src/services/sms.service';
import dotenv from 'dotenv';

dotenv.config();

async function activate() {
  console.log('🚀 Triggering account activation...');
  
  // Replace this with YOUR real phone number to receive the test SMS
  const myPhoneNumber = '+251942641061'; 
  
  try {
    const result = await SMSService.sendSMS(
      myPhoneNumber, 
      'Hello from Qirb Alga! This is my first API call to activate my account.'
    );
    
    console.log('✅ API Call Successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('\n🎉 Your account should now be fully verified on the Africa\'s Talking dashboard.');
  } catch (error: any) {
    console.error('❌ Activation failed:', error.message);
    console.log('\nTip: Make sure you updated your .env with a REAL username and API Key (not sandbox).');
  }
}

activate();
