import express, { response } from "express";
import cors from "cors";
import fs from "fs/promises";
import dbConnection from "./data/database.js";
import { request } from "http";
import { error } from "console";

const app = express();
const port = process.env.port || 4000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(
    `The sever is running on port http://127.0.0.1:${port}\nRasmus, Edith and Peter is proud of you\nEnjoy your day - You are doing a good job:)`
  );
});

//////// ARTIST ROUTES ////////

app.get("/", (request, response) => {
  response.send("MySongsDB.com");
});

app.get("/artists", (request, response) => {
  const query = "SELECT * FROM artists ORDER BY artistsName";
  dbConnection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

//////// TRACKS ROUTES ////////

// READ all tracks //
app.get("/tracks", (request, response) => {
  const query = "SELECT * FROM artists ORDER by tracksName";
  dbConnection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// READ one track //

app.get("/tracks/:trackID", (request, response) => {
  const id = request.params.trackID;
  const query = "SELECT * FROM tracks WHERE id=?";
  const values = [id];

  dbConnection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// Create a track //

app.post("/tracks", (request, response) => {
  const track = request.body;
  console.log(track);

  const values = [
    track.trackName,
    track.length,
    track.creationYear,
    track.genre,
  ];
  const query =
    "INSERT INTO tracks (trackName, length, creationYear, genre) VALUES (?,?,?,?)";

  dbConnection.query(query, values, (error, results, fields) => {
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
  dbConnection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// READ one albums
app.get("/albums/:albumID", (request, response) => {
  const id = request.params.albumID; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const query = "SELECT * FROM albums WHERE id=?";
  const values = [id];

  dbConnection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
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
    "INSERT INTO sers (albumName, edition, year, albumImage) VALUES (?,?,?,?)";

  dbConnection.query(query, values, (err, results, fields) => {
    response.json(results);
  });
});

// UPDATE albums
app.put("/albums/:albumId", async (request, response) => {
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

//////// ------------- ALBUM MANY TO MANY ------------- ////////

app.get("/albums/:id", (request, response) => {
  const id = request.params.id;
  const query = /*sql*/ `
  SELECT albums.albumName AS albumName,
  tracks.trackID AS trackID,
  tracks.trackName AS trackName,
  tracks.length AS trackLength,
  tracks.creationYear AS trackYear,
  tracks.genre AS genre

  FROM albums
  JOIN album_tracks 
  ON albums.albumID = albums_tracks.albumID
  JOIN tracks
  ON tracks.trackID = albums_tracks.trackID
  WHERE albums.albumID = ?
  ORDER BY albums.albumName, albums_tracks.Name;
    `;

  const values = [id];
  dbConnection.quer(query, values, (error, results) => {
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
