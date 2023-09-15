import express from "express";
import cors from "cors";
import fs from "fs/promises";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

//Routes goes here...



app.listen(port, () => {
  console.log(`The sever is running on port ${port}\nEnjoy your day :)`);
});
