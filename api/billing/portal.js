import { requireUserFromCookie } from '../_lib/supabase.js';
import { getAppBaseUrl, getStripeClient, getSubscriptionRowByUserId } from '../_lib/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUserFromCookie(req);
  if (!auth.user) {
    return res.status(401).json({ error: auth.error || 'Not authenticated' });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (e) {
    return res.status(503).json({ error: e.message || 'Stripe is not configured' });
  }

  try {
    const row = await getSubscriptionRowByUserId(auth.user.id);
    if (!row?.stripe_customer_id) {
      return res.status(404).json({ error: 'No Stripe customer found for this user' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: `${getAppBaseUrl(req)}/premium`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unable to open billing portal' });
  }
}
