import express from "express";
import cors from "cors";
import fs from "fs/promises";
import dbConnection from "./data/database.js";
import { request } from "http";
import { error } from "console";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`The sever is running on port ${port}\nEnjoy your day :)`);
});

//////// ARTIST ROUTES ////////

app.get("/", (request, response) => {
  response.send("");
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
app.get("/albums/:id", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
        SELECT * FROM albums
            WHERE albums.albumID=?;`; // sql query
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results[0]);
    }
  });
});

// CREATE albums
app.post("/albums", (request, response) => {
  const album = request.body;
  console.log(album);

  const values = [album.albumName, album.edition, album.year, album.albumImage];
  const query =
    "INSERT INTO albums (albumName, edition, year, albumImage) VALUES (?,?,?,?)";

  dbConnection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

// UPDATE albums
app.put("/albums/:albumId", async (request, response) => {
  const albumID = request.params.albumId; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const albumBody = request.body;
  console.log(albumBody);

  const values = [
    albumBody.albumName,
    albumBody.edition,
    albumBody.year,
    albumBody.albumImage,
    albumID,
  ];
  const query =
    "UPDATE albums SET albumName=?, edition=?, year=?, albumImage=? WHERE albumID=?";
  dbConnection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

// DELETE albums
app.delete("/albums/:albumId", async (request, response) => {
  const id = request.params.albumId; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const values = [id];
  const query = "DELETE FROM albums WHERE albumID=?";

  dbConnection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

// READ all albums
app.get("/albums_tracks", (request, response) => {
  const query = "SELECT * FROM albums_tracks";
  dbConnection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

//////// ------------- ALBUM MANY TO MANY ------------- ////////

app.get("/albums/:id/tracks", (request, response) => {
  const id = request.params.id;
  const query = /*sql*/ `
  SELECT albums.albumName AS albumName,
  tracks.trackID AS trackID,
  tracks.trackName AS trackName,
  tracks.length AS trackLength,
  tracks.creationYear AS trackYear,
  tracks.genre AS genre

  FROM albums
  JOIN albums_tracks 
  ON albums.albumID = albums_tracks.album_ID
  JOIN tracks
  ON tracks.trackID = albums_tracks.track_ID
  WHERE albums.albumID = ?
  ORDER BY albums.albumName, tracks.Name;
    `;

  const values = [id];
  dbConnection.query(query, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      if (results[id]) {
        const newAlbum = {
          name: results[id].albumName,
          track: results.map((track) => {
            return {
              id: track.trackID,
              length: track.trackLenght,
              year: track.trackYear,
              genre: track.genre,
            };
          }),
        };
        response.json(newAlbum);
      } else {
        console.log("No album found");
      }
    }
  });
});
