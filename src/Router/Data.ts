

const express =require("express");
const router = express.Router();
const  supabase  = require("../supabase")
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51LwKHOG08ae6WL7BmgYTJeUBTnzKSDCC6WOtO70SJTJJbpKVZbOtPwB5yDmqroYtpEqpbfias4DhYt9uIrQ4adYc007JnvUDpS"
);

const bodyparser = require("body-parser");
//router.use(express.raw())

export const createUser = router.post(
  "/createUser",
  bodyparser.json(),
  async (req: any, res: any) => {
    const data = req.body.data;
    console.log(req.body);
    // const cust = await stripe.customers.create({
    //   email: data.email_addresses[0].email_address,
    // });

    // console.log(cust);
    // console.log(data.id);
    // const { data: list, error } = await supabase.from("profiles").insert({
    //   user_id: data.id,
    //   plan: "free",
    //   email: data.email_addresses[0].email_address,
    //   isSubscribed: false,

    //   stripe_id: cust.id,
    //   export: 0,
    // });

    // console.log(list, error);

    // res.sendStatus(200);
    switch (req.body.type) {
      case "user.created":
        const cust = await stripe.customers.create({
          email: data.email_addresses[0].email_address,
        });

        console.log(cust);
        console.log(data.id);
        const { data: list, error } = await supabase.from("profiles").insert({
          user_id: data.id,
          plan: "free",
          email: data.email_addresses[0].email_address,
          isSubscribed: false,

          stripe_id: cust.id,
          export: 0,
        });
        res.sendStatus(200);
        break;
      case "user.deleted":
        console.log("User Deleted");
    }
  }
);

export const manageUser = router.post(
  "/manageUser",
  bodyparser.json(),
  async (req: any, res: any) => {
    const { data: list, error } = await supabase
      .from("profiles")
      .select("stripe_id")
      .eq("user_id", req.body.id);

    if(list){
      const session = await stripe.billingPortal.sessions.create({
        customer: list[0].stripe_id,
        return_url: "http://localhost:5173/client/dashboard",
      });
      console.log(session);
      res.send(session);
    }
  
  }
);

export const sessionId = router.post(
  "/getSession",
  bodyparser.json(),
  async (req: any, res: any) => {
    const { data: list, error } = await supabase
      .from("profiles")
      .select("stripe_id")
      .eq("user_id", req.body.id);
    if(list){
      const session = await stripe.checkout.sessions.create({
        customer: list[0].stripe_id,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: req.body.lineItems,
        success_url: "http://localhost:5173/client/dashboard",
        cancel_url: "http://localhost:5173/client/dashboard",
      });
      res.send(session.id);
    }
    

    //console.log(session)
    
    //const {data:{stripe_id}} = await supabase.from("profile").select("stripe_id").eq("id", user.id)
  }
);

export const webStripe = router.post(
  "/stripe-cust",
  bodyparser.raw({ type: "application/json" }),
  async (req: any, res: any) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];
    const endpointsecret = "whsec_FoEnaAIHSsZiLaVS1966imoWAmmuT2G7";
    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointsecret);
    } catch (error:any) {
      console.log(error);
      res.status(400).json({ success: false });
      return;
    }
    var limit = 0;

  
    var plan = "";

    console.log(plan, limit);
    switch (event.type) {
      case "customer.subscription.updated":
        switch (event.data.object.plan.id) {
          case "price_1LwvtMG08ae6WL7BzTXJ2Exu":
            plan = "pro";

            break;
          case "price_1LwvsxG08ae6WL7BGQU7KuR1":
            plan = "prem";

            break;
          case "price_1LwvsZG08ae6WL7BdeSYU68b":
            plan = "start";
        }
        const { data: subData } = await supabase
          .from("profiles")
          //.update({ isSubscribed: true, plan: plan, export: limit })
          .update({ isSubscribed: true, plan: plan })
          .eq("stripe_id", event.data.object.customer);
        break;
      case "customer.subscription.deleted":
        const { data: delData } = await supabase
          .from("profiles")
          .update({ isSubscribed: false, plan: "free", export: 0 })
          .eq("stripe_id", event.data.object.customer);
        break;
    }

    res.json({
      success: true,
    });
  }
);

export default { createUser, sessionId, webStripe, manageUser };
