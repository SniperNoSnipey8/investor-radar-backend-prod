const express = require("express");
const app = express();

import bodyParser from "body-parser";
const dotenv = require("dotenv");
dotenv.config();


const cors = require( "cors");
app.use(cors());

import { webStripe, sessionId, createUser, manageUser } from "./Router/Data";


app.use(webStripe, bodyParser.raw({type: "*/*"}))


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
