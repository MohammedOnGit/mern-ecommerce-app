// helpers/paystack.js 
require('dotenv').config();
const https = require('https');

class PaystackHelper {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.baseUrl = 'api.paystack.co';
  }

  async initializeTransaction(data) {
    const params = JSON.stringify({
      email: data.email,
      amount: data.amount,
      reference: data.reference,
      callback_url: data.callback_url,
      metadata: data.metadata
    });

    const options = {
      hostname: this.baseUrl,
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => (data += chunk));
        apiRes.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('Paystack response:', response);
            resolve(response);
          } catch (error) {
            console.error('Failed to parse Paystack response:', error);
            reject(new Error('Failed to parse Paystack response'));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Paystack request error:', error);
        reject(error);
      });
      
      req.write(params);
      req.end();
    });
  }

  async verifyTransaction(reference) {
    const options = {
      hostname: this.baseUrl,
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => (data += chunk));
        apiRes.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Verification failed'));
          }
        });
      });
      
      req.on('error', (error) => reject(error));
      req.end();
    });
  }
}

module.exports = new PaystackHelper();