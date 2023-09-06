

const express =require("express");
const router = express.Router();
import { supabase } from "../supabase";

const Stripe = require("stripe");

const stripeKey = process.env.STRIPE_SK_KEY;
const endpointsecret = process.env.STRIPE_SK_ENDPOINT;

import {buffer} from "micro"
const stripe = Stripe(
stripeKey 
);

const bodyparser = require("body-parser");
//router.use(express.raw())

export const createUser = router.post( 
  "/createUser",
  bodyparser.json(),
  async (req: any, res: any) => {
    const data = req.body.data;
    
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
      
        
        const { data: list, error } = await supabase.from("profiles").insert({
          user_id: data.id,
          plan: "free",
          email: data.email_addresses[0].email_address,
          isSubscribed: false,

          stripe_id: cust.id,
          export: 0,
        });
        res.sendStatus(200);
        console.log(error)
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
        return_url: "https://app.investorradar.io/client/dashboard",
      });
      
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
        allow_promotion_codes:true,
        line_items: req.body.lineItems,
        success_url: "https://app.investorradar.io/client/dashboard",
        cancel_url: "https://app.investorradar.io/client/dashboard",
      });
      res.send(session.id);
      console.log(session.id)
    }
    

    //console.log(session)
    
    //const {data:{stripe_id}} = await supabase.from("profile").select("stripe_id").eq("id", user.id)
  }
);

export const webStripe = router.post(
  "/stripe-cust",

  async (req: any, res: any) => {
   
    
    // const payload = JSON.parse(req.rawBody?.toString() || req.body);
    
   
  
   
    // const endpointsecret = process.env.STRIPE_SK_ENDPOINT;
    let event;
    //console.log(payload)
    try {
      const requestBuffer = await buffer(req)
      const signature = req.headers['stripe-signature'] as string;
      event = stripe.webhooks.constructEvent(requestBuffer.toString(), signature,endpointsecret);
      
    } catch (error:any) {
      // console.log(error);
      console.log(error)
      res.status(400).json({ success: false });
      return;
    }
   

  
    var plan = "";

    // console.log(event)
    console.log(event.data.object.plan.id, event.data.object.customer)
    switch (event.type) {
      case "customer.subscription.updated":
        switch (event.data.object.plan.id) {
          case "price_1NcyVRG08ae6WL7BuzbqHtPr":
            plan = "pro";

            break;
          case "price_1NcyWbG08ae6WL7Biina43gq":
            plan = "prem";

            break;
          case "price_1NcyW2G08ae6WL7BKEE9Sodc":
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
