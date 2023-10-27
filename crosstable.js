import { Router } from "express";
import dbConnection from "./data/database.js";
const appRoutes = Router();

appRoutes.get("/", async (request, response) => {
  const query = "SELECT * FROM artists_albums";
  const [result] = await dbConnection.execute(query);
  response.json(result);
});

export default appRoutes;
