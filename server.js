import express, { response } from "express";
import cors from "cors";
import fs from "fs/promises";
import dbConnection from "./database.js";
import { request } from "http";
import { error } from "console";

const app = express();
const port = 3306;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`The sever is running on port ${port}\nEnjoy your day :)`);
});

//////// ARTIST ROUTES ////////

app.get("/", (request, response) => {
  response.send(
    "Jeg skal få den her database til at sende mig alt det her lort"
  );
});

app.get("/artist", (request, response) => {
  const query = "SELECT * FROM artist ORDER BY artistsName";
  dbConnection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

//////// ALBUM ROUTS ////////

// READ all albums
app.get("/albums", (request, response) => {
  const query = "SELECT * FROM albums";
  dbConnection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

// READ one albums
app.get("/albums/:albumId", (request, response) => {
  const albumId = request.params.albumId; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "SELECT * FROM users WHERE id=?";
  const values = [albumId];

  dbConnection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results[albumId]);
    }
  });
});

// CREATE albums
app.post("/albums", (request, response) => {
  const album = request.body;
  console.log(album);

  const values = [album.albumName, album.edition, album.year, album.albumImage];
  const query =
    "INSERT INTO sers (albumName, edition, year, albumImage) VALUES (?,?,?,?)";

  dbConnection.query(query, values, (err, results, fields) => {
    response.json(results);
  });
});

// UPDATE albums
app.put("/album/:albumId", async (request, response) => {
  const albumId = request.params.albumId; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const albumBody = request.body;

  const values = [
    albumBody.albumName,
    albumBody.edition,
    albumBody.year,
    albumBody.albumImage,
    albumId,
  ];
  const query =
    "UPDATE userse SET albumName=?, edition=?, year=?, albumImage=? VALUES WHERE albumId=?";
  dbConnection.query(query, values, (err, results, fields) => {
    response.json(results);
  });
});

// DELETE albums
app.delete("/albums/:albumId", async (request, response) => {
  const id = request.params.albumId; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const values = [id];
  const query = "DELETE FROM album WHERE id=?";

  dbConnection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});
