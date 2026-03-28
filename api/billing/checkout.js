import { requireUserFromCookie } from '../_lib/supabase.js';
import {
  getAppBaseUrl,
  getStripeClient,
  getSubscriptionRowByUserId,
  upsertUserSubscription,
} from '../_lib/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUserFromCookie(req);
  if (!auth.user) {
    return res.status(401).json({ error: auth.error || 'Not authenticated' });
  }

  const stripePriceId = process.env.STRIPE_PRICE_ID_MONTHLY;
  if (!stripePriceId) {
    return res.status(503).json({ error: 'Missing STRIPE_PRICE_ID_MONTHLY' });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (e) {
    return res.status(503).json({ error: e.message || 'Stripe is not configured' });
  }

  const userId = auth.user.id;
  const baseUrl = getAppBaseUrl(req);

  try {
    const existing = await getSubscriptionRowByUserId(userId);
    let stripeCustomerId = existing?.stripe_customer_id || null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email || undefined,
        metadata: { user_id: userId },
      });
      stripeCustomerId = customer.id;

      await upsertUserSubscription({
        user_id: userId,
        status: existing?.status || 'inactive',
        plan: existing?.plan || 'free',
        source: 'stripe',
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: existing?.stripe_subscription_id || null,
        stripe_price_id: existing?.stripe_price_id || null,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/premium?billing=success`,
      cancel_url: `${baseUrl}/premium?billing=cancel`,
      metadata: { user_id: userId },
      subscription_data: {
        metadata: { user_id: userId },
      },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unable to start checkout' });
  }
}
