import {
  getStripeClient,
  getSubscriptionRowByCustomerId,
  normalizeSubscriptionStatus,
  upsertUserSubscription,
} from '../_lib/stripe.js';
import { createServiceClient } from '../_lib/supabase.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

function isAuthorized(req) {
  const provided = req.headers['x-billing-admin-secret'];
  const expected = process.env.BILLING_ADMIN_SECRET;
  return Boolean(expected && provided && provided === expected);
}

async function syncFromStripeSubscription(subscription) {
  const stripeCustomerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  const stripeSubscriptionId = subscription.id;
  const stripePriceId = subscription.items?.data?.[0]?.price?.id || null;
  const status = normalizeSubscriptionStatus(subscription.status || 'inactive');
  const userIdFromMetadata = subscription.metadata?.user_id || null;

  let userId = userIdFromMetadata;
  if (!userId && stripeCustomerId) {
    const existing = await getSubscriptionRowByCustomerId(stripeCustomerId);
    userId = existing?.user_id || null;
  }

  if (!userId) return;

  await upsertUserSubscription({
    user_id: userId,
    status,
    plan: status === 'inactive' || status === 'canceled' ? 'free' : 'premium_monthly',
    source: 'stripe',
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_price_id: stripePriceId,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
  });
}

async function handleEvent(stripe, event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await syncFromStripeSubscription(sub);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await syncFromStripeSubscription(event.data.object);
      break;
    }
    default:
      break;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (e) {
    return res.status(503).json({ error: e.message || 'Stripe is not configured' });
  }

  const parsedLimit = Number.parseInt(
    String(req.query?.limit || req.body?.limit || DEFAULT_LIMIT),
    10
  );
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(parsedLimit, MAX_LIMIT))
    : DEFAULT_LIMIT;

  const supabase = createServiceClient();

  const { data: failedEvents, error: fetchError } = await supabase
    .from('stripe_webhook_events')
    .select('event_id, payload, retries')
    .eq('status', 'failed')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  if (!failedEvents?.length) {
    return res.status(200).json({ replayed: 0, failed: 0, results: [] });
  }

  const results = [];
  let replayed = 0;
  let failed = 0;

  for (const row of failedEvents) {
    const nextRetries = Math.max(0, Number(row.retries || 0)) + 1;

    await supabase
      .from('stripe_webhook_events')
      .update({ status: 'processing', error_message: null, retries: nextRetries })
      .eq('event_id', row.event_id);

    try {
      await handleEvent(stripe, row.payload);
      await supabase
        .from('stripe_webhook_events')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('event_id', row.event_id);
      replayed += 1;
      results.push({ eventId: row.event_id, status: 'processed' });
    } catch (e) {
      failed += 1;
      const message = e instanceof Error ? e.message : 'Replay failed';
      await supabase
        .from('stripe_webhook_events')
        .update({ status: 'failed', error_message: message })
        .eq('event_id', row.event_id);
      results.push({ eventId: row.event_id, status: 'failed', error: message });
    }
  }

  return res.status(200).json({ replayed, failed, results });
}
