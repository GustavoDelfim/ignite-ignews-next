import { NextApiRequest, NextApiResponse } from "next"
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks)
}

// Desabilitando o padrão de recebimento de request.
// Neste caso sera uma stream e não um JSon no body
export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

async function handle (req: NextApiRequest, res: NextApiResponse) {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    console.log('req.method', req)
    
    // res.setHeader('Allow', 'POST');
    // return res.status(405).end('Method not alowed');
    return res.redirect('/')
  }

  const buf = await buffer(req);
  const secret = req.headers['stripe-signature']

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).end('Webhook error: ', err.message);
  }

  const { type } = event

  if (relevantEvents.has(type)) {
    try {
      switch (type) {
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session

          await saveSubscription(
            checkoutSession.subscription.toString(),
            checkoutSession.customer.toString(),
            true
          )
          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':

          const subscription = event.data.object as Stripe.Checkout.Session

          await saveSubscription(
            subscription.id,
            subscription.customer.toString(),
            false
          )

          break;

        default:
          throw new Error('Unhandled event.')
          break;
      }
    } catch (err) {
      return res.json({ error: 'Weebhook handler failed.' })
    }
  }

  res.json({ received: true })
}

export default handle