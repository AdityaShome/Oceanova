import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

export class PaymentService {
  /**
   * Create a new payment order
   */
  static async createOrder(amount: number, currency: string = 'INR', receipt: string): Promise<PaymentOrder | null> {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt,
        payment_capture: 1
      };

      const order = await razorpay.orders.create(options);
      
      return {
        id: order.id,
        amount: order.amount / 100, // Convert back to rupees
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      };
    } catch (error) {
      console.error('Error creating payment order:', error);
      return null;
    }
  }

  /**
   * Verify payment signature
   */
  static verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): PaymentVerification {
    try {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      return {
        success: isAuthentic,
        paymentId: isAuthentic ? razorpay_payment_id : undefined,
        orderId: isAuthentic ? razorpay_order_id : undefined,
        error: isAuthentic ? undefined : 'Payment verification failed'
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(paymentId: string) {
    try {
      return await razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundOptions: any = {
        payment_id: paymentId
      };

      if (amount) {
        refundOptions.amount = amount * 100; // Convert to paise
      }

      return await razorpay.payments.refund(paymentId, refundOptions);
    } catch (error) {
      console.error('Error processing refund:', error);
      return null;
    }
  }
}
