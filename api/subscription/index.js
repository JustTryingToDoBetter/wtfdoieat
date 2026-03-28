import { createServiceClient, requireUserFromCookie } from '../_lib/supabase.js';

function toPremium(subscription) {
  if (!subscription) {
    return {
      isPremium: false,
      status: 'inactive',
      plan: 'free',
      source: 'none',
      currentPeriodEnd: null,
    };
  }

  const status = subscription.status || 'inactive';
  const plan = subscription.plan || 'free';
  const isPremium = ['active', 'trialing'].includes(status) && plan !== 'free';

  return {
    isPremium,
    status,
    plan,
    source: subscription.source || 'manual',
    currentPeriodEnd: subscription.current_period_end || null,
    stripeCustomerId: subscription.stripe_customer_id || null,
    stripeSubscriptionId: subscription.stripe_subscription_id || null,
  };
}

export default async function handler(req, res) {
  const auth = await requireUserFromCookie(req);
  if (!auth.user) {
    return res.status(401).json({ error: auth.error || 'Not authenticated' });
  }

  const supabase = createServiceClient();
  const userId = auth.user.id;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(toPremium(data));
  }

  if (req.method === 'POST') {
    const { enabled } = req.body || {};
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled (boolean) is required' });
    }

    const payload = enabled
      ? {
          user_id: userId,
          status: 'active',
          plan: 'premium_monthly',
          source: 'preview',
        }
      : {
          user_id: userId,
          status: 'inactive',
          plan: 'free',
          source: 'preview',
        };

    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(toPremium(data));
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
