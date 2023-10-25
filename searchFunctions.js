import { Router } from "express";
import dbConnection from "./data/database.js";
import Debug from "debug"
const debug = Debug("app:startup");
const searchRoutes = Router();

searchRoutes.get("/search", async (request, response) => {
  console.log("You are now searching");
  try {
    const searchType = request.query.type;
    const searchTerm = request.query.q;

    let query = "";
    let tableName = "";

    if (searchType === "trackName") {
      query = "SELECT * from tracks WHERE trackName LIKE ?";
      tableName = "tracks";
    } else if (searchType === "genre") {
      query = "SELECT * from tracks WHERE genre LIKE ?";
      tableName = "tracks";
    } else if (searchType === "artistName") {
      query = "SELECT * from artists WHERE artistName LIKE ?";
      tableName = "artists";
    } else if (searchType === "activeSince") {
      query = "SELECT * from artists WHERE activeSince LIKE ?";
      tableName = "artists";
    } else if (searchType === "albumName") {
      query = "SELECT * from albums WHERE albumName LIKE ?";
      tableName = "albums";
    } else if (searchType === "edition") {
      query = "SELECT * from albums WHERE edition LIKE ?";
      tableName = "albums";
    } else {
      return response.status(400).json({ error: "Invalid search type" });
    }

    const [rows] = await dbConnection.query(query, [`%${searchTerm}%`]);
    response.json({ [tableName]: rows });
  } catch (error) {
    console.error("There was an error when attempting to search", error);
    response.status(500).json({ error: "An error occurred while searching" });
  }
});

export default searchRoutes;
