import {
  getStripeClient,
  getSubscriptionRowByCustomerId,
  normalizeSubscriptionStatus,
  upsertUserSubscription,
} from '../_lib/stripe.js';
import { createServiceClient } from '../_lib/supabase.js';

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return Buffer.from(req.body);
  }

  if (req.body && typeof req.body === 'object' && !req[Symbol.asyncIterator]) {
    return Buffer.from(JSON.stringify(req.body));
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
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

  if (!userId) {
    return;
  }

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (e) {
    return res.status(503).json({ error: e.message || 'Stripe is not configured' });
  }

  let eventId = null;
  let supabase = null;

  try {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const body = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    eventId = event.id;
    supabase = createServiceClient();

    const { data: existingEvent, error: existingError } = await supabase
      .from('stripe_webhook_events')
      .select('status, retries')
      .eq('event_id', event.id)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: existingError.message });
    }

    if (existingEvent?.status === 'processed') {
      return res.status(200).json({ received: true, duplicate: true });
    }

    if (!existingEvent) {
      const { error: insertError } = await supabase.from('stripe_webhook_events').insert({
        event_id: event.id,
        event_type: event.type,
        status: 'processing',
        retries: 0,
        payload: event,
      });

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
    } else {
      const nextRetries = Math.max(0, Number(existingEvent.retries || 0)) + 1;
      const { error: retryUpdateError } = await supabase
        .from('stripe_webhook_events')
        .update({
          status: 'processing',
          error_message: null,
          payload: event,
          retries: nextRetries,
        })
        .eq('event_id', event.id);

      if (retryUpdateError) {
        return res.status(500).json({ error: retryUpdateError.message });
      }
    }

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

    await supabase
      .from('stripe_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return res.status(200).json({ received: true });
  } catch (e) {
    try {
      if (eventId && supabase) {
        await supabase
          .from('stripe_webhook_events')
          .update({
            status: 'failed',
            error_message: e.message || 'Webhook handling failed',
          })
          .eq('event_id', eventId);
      }
    } catch {
      // swallow secondary persistence failures
    }
    return res.status(400).json({ error: e.message || 'Webhook handling failed' });
  }
}
