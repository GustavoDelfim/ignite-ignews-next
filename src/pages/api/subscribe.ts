import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react'
import { stripe } from "../../services/stripe";

import { fauna } from "../../services/fauna";
import { query as q } from 'faunadb';

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id: string
  }
}

async function subscribe (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not alowed');
  }

  const session = await getSession({ req })

  const user = await fauna.query<User>(
    q.Get(
      q.Match(
        q.Index('user_by_email'),
        session.user.email
      )
    )
  )

  console.log('user', user)

  let customerId = user.data.stripe_customer_id

  if (!customerId) {
    console.log('1')
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email
    })
    await fauna.query(
      q.Update(
        q.Ref(q.Collection('users'), user.ref.id),
        {
          data: {
            stripe_customer_id: stripeCustomer.id
          }
        }
      )
    )

    customerId = stripeCustomer.id
  }

  try {
    const checkoutCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: 'price_1KVZqGFIM3zpbF6muOK6pZsG', quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({ sessionId: checkoutCheckoutSession.id })
  } catch (err) {
    console.log(err)
    res.status(500).end(err.message)
  }
}

export default subscribe