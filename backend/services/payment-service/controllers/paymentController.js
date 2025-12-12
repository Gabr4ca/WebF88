import Stripe from "stripe";

// Initialize Stripe lazily to ensure env variables are loaded
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Create checkout session
const createCheckoutSession = async (req, res) => {
  const {items, amount, orderId, frontendUrl} = req.body;

  try {
    const stripe = getStripe();
    const frontend_url = frontendUrl || "https://uma.gabrys.io.vn";

    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?orderId=${orderId}&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?orderId=${orderId}&success=false`,
    });

    res.json({success: true, session_url: session.url});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Payment session creation failed", error: error.message});
  }
};

// Verify payment (webhook handler can be added here in future)
const verifyPayment = async (req, res) => {
  const {sessionId} = req.body;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent,
    });
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Payment verification failed", error: error.message});
  }
};

export {createCheckoutSession, verifyPayment};
