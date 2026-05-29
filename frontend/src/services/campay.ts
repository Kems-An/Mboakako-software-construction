// src/services/campay.ts
// CamPay payment integration for MTN Mobile Money and Orange Money

const CAMPAY_BASE_URL = import.meta.env.VITE_CAMPAY_BASE_URL || 'https://demo.campay.net/api';

// ── Types ────────────────────────────────────────────────────

export interface CamPayToken {
  token: string;
}

export interface CamPayCollectRequest {
  amount:      string;   // amount in XAF as string e.g. "5000"
  currency:    string;   // always "XAF"
  from:        string;   // customer phone number e.g. "237670000000"
  description: string;   // what the payment is for
  external_reference: string; // your order ID
}

export interface CamPayCollectResponse {
  reference:    string;  // CamPay payment reference
  ussd_code:    string;  // code customer dials
  operator:     string;  // MTN or Orange
  status:       string;  // PENDING, SUCCESSFUL, FAILED
}

export interface CamPayStatusResponse {
  reference:         string;
  status:            'SUCCESSFUL' | 'FAILED' | 'PENDING';
  amount:            string;
  currency:          string;
  operator:          string;
  code:              string;
  operator_reference: string;
  external_reference: string;
  description:       string;
  datetime:          string;
}

// ── Step 1: Get access token ─────────────────────────────────

export async function getCamPayToken(
  username: string,
  password: string
): Promise<string> {
  const response = await fetch(`${CAMPAY_BASE_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get CamPay token');
  }

  const data: CamPayToken = await response.json();
  return data.token;
}

// ── Step 2: Request payment from customer ────────────────────

export async function collectPayment(
  token:   string,
  payload: CamPayCollectRequest
): Promise<CamPayCollectResponse> {
  const response = await fetch(`${CAMPAY_BASE_URL}/collect/`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Payment request failed');
  }

  return response.json();
}

// ── Step 3: Check if payment was approved ────────────────────

export async function checkPaymentStatus(
  token:     string,
  reference: string
): Promise<CamPayStatusResponse> {
  const response = await fetch(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
    method: 'GET',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to check payment status');
  }

  return response.json();
}

// ── Main function: full payment flow ─────────────────────────
// Call this from your checkout page

export async function processCamPayPayment(
  username:    string,   // your CamPay app username
  password:    string,   // your CamPay app password
  phoneNumber: string,   // customer phone e.g. 237670000000
  amount:      number,   // amount in XAF
  orderId:     string,   // your order ID from Supabase
  description: string    // e.g. "Mboakako order #ABC123"
): Promise<{ success: boolean; reference: string; message: string }> {

  try {
    // 1. Get access token
    const token = await getCamPayToken(username, password);

    // 2. Send payment request to customer's phone
    const payment = await collectPayment(token, {
      amount:             amount.toString(),
      currency:           'XAF',
      from:               phoneNumber,
      description,
      external_reference: orderId,
    });

    // 3. Poll for payment status (check every 5 seconds, max 12 times = 1 minute)
    let attempts = 0;
    const maxAttempts = 12;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds

      const status = await checkPaymentStatus(token, payment.reference);

      if (status.status === 'SUCCESSFUL') {
        return {
          success:   true,
          reference: payment.reference,
          message:   'Payment successful',
        };
      }

      if (status.status === 'FAILED') {
        return {
          success:   false,
          reference: payment.reference,
          message:   'Payment was declined or failed',
        };
      }

      // Still PENDING — keep waiting
      attempts++;
    }

    // Timed out waiting for customer to approve
    return {
      success:   false,
      reference: payment.reference,
      message:   'Payment timed out. Please try again.',
    };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment failed';
    throw new Error(message);
  }
}