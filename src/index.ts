const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
import bodyParser from "body-parser";
require("dotenv").config();


const cors = require( "cors");


import { webStripe, sessionId, createUser, manageUser } from "./Router/Data";
console.log("listening");

app.use('/stripe-cust', bodyParser.raw({type: "*/*"}))
app.use(cors());
app.use(express.json({
  limit: '5mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}),webStripe);
// app.use("/", webStripe);
app.use("/", manageUser);
app.use("/", sessionId, createUser);

app.get("/", (req: any, res: any) => {
  res.send("hello");
});

app.listen(7789, () => {
  console.log(`Server Listening on 7789 `);
});

// main()
