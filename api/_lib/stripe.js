import Stripe from 'stripe';
import { createServiceClient } from './supabase.js';

let stripeClient;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  return stripeClient;
}

export function getAppBaseUrl(req) {
  const configured = process.env.APP_BASE_URL;
  if (configured) return configured;

  const host = req?.headers?.host || process.env.VERCEL_URL;
  if (!host) return 'http://localhost:3000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  return `${isLocal ? 'http' : 'https'}://${host}`;
}

export function normalizeSubscriptionStatus(status) {
  if (['active', 'trialing', 'past_due', 'canceled'].includes(status)) {
    return status;
  }
  return 'inactive';
}

export async function getSubscriptionRowByUserId(userId) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function getSubscriptionRowByCustomerId(stripeCustomerId) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function upsertUserSubscription(payload) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
