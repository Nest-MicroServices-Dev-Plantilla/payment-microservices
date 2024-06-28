import { Injectable } from '@nestjs/common';
import { envs } from 'src/configs';
import Stripe from 'stripe';
import { PaymentSessionDTO } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { env } from 'process';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDTO: PaymentSessionDTO) {
    const { currency, items, orderId } = paymentSessionDTO;
    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
            orderId: orderId
        }, // información para mi sistema
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event : Stripe.Event;
    // DEV
    //const endpointSecret = "whsec_5dc72ed4eee1a5c1b377f0127211c648e787658f6eb093f06e43111ca9e07753";
    
    // REAL
    const endpointSecret = envs.stripeEndpointSecret;

    try {
        event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
      } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }    
    
    switch (event.type) {
        case 'charge.succeeded':
            const chargeSucceeded = event.data.object;
            // TO DO llamar nuestro microservicio
            console.log({
                metadata: chargeSucceeded,
                orderId: chargeSucceeded.metadata.orderId,
            })
            break;
    
        default:
            console.log(`Event ${ event.type } not handled.`)
    }
    return res.status(200).json({ sig });
  }
}
