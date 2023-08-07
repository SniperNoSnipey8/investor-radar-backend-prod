const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 6000;



const cors = require( "cors");


import { webStripe, sessionId, createUser, manageUser } from "./Router/Data";
console.log("listening");


app.use(cors());

app.use("/", webStripe);
app.use("/", manageUser);
app.use("/", express.json(), sessionId, createUser);

app.get("/", (req: any, res: any) => {
  res.send("hello");
});

app.listen(7789, () => {
  console.log(`Server Listening on 7789 `);
});

// main()
