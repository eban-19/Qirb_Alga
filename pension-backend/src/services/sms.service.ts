const africastalking = require('africastalking');
import dotenv from 'dotenv';

dotenv.config();

export class SMSService {
  private static at: any;

  private static getAT() {
    if (!this.at) {
      const username = (process.env.AFRICASTALKING_USERNAME || '').trim();
      const apiKey = (process.env.AFRICASTALKING_API_KEY || '').trim();

      if (!username || !apiKey) {
        throw new Error('Africa\'s Talking credentials not configured in .env');
      }

      console.log(`[SMS] Initializing SDK for user: ${username}`);
      
      this.at = africastalking({
        username,
        apiKey
      });
    }
    return this.at;
  }

  /**
   * Send SMS to a specific phone number
   * @param to Phone number in format +251XXXXXXXXX
   * @param message Message content
   */
  static async sendSMS(to: string, message: string): Promise<any> {
    try {
      const atInstance = this.getAT();
      const sms = atInstance.SMS;

      console.log(`📤 Sending SMS to ${to}...`);
      
      const options = {
        to: [to],
        message: message,
        // from: 'QIRBALGA' // Uncomment if you have a shortcode/sender ID
      };

      const result = await sms.send(options);
      console.log(`✅ SMS sent successfully to ${to}`);
      return result;
    } catch (error: any) {
      console.error(`❌ SMS sending failed for ${to}:`, error.message);
      throw error;
    }
  }
}
