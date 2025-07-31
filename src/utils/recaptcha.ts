// src/utils/recaptcha.ts
import axios from 'axios';

// Define the shape of the reCAPTCHA response
interface RecaptchaResponse {
  success: boolean;    // True if the verification passed
  score?: number;      // A score (e.g., 0.5), optional because it might not always be there
  challenge_ts?: string; // Timestamp, optional
  hostname?: string;   // Website hostname, optional
}

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post<RecaptchaResponse>(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    // Check if score exists, default to 0 if undefined
    const score = response.data.score || 0;
    return response.data.success && score >= 0.5; // v3 score threshold
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};