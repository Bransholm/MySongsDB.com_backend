import express, { response } from "express";
import cors from "cors";
import fs from "fs/promises";
import dbConnection from "./data/database.js";
import { request } from "http";
import { error } from "console";
// import mysql from "mysql2/promise";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(
    `The sever is run on port http://127.0.0.1:${port}\nRasmus, Edith and Peter is proud of you\nEnjoy your day - You are doing a good job:)`
  );
});

//////// ARTIST ROUTES ////////

app.get("/", (request, response) => {
  response.send("MySongsDB.com");
});

app.get("/artists", (request, response) => {
  const query = "SELECT * FROM artists ORDER BY artistName";
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
  const query = "SELECT * FROM tracks ORDER by trackName";
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
  const queryString = /*sql*/ `
        SELECT * FROM tracks
            WHERE tracks.trackID=?;`; // sql query
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results[0]);
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

// Update a track //

app.put("/tracks", (request, response) => {
  const trackID = request.params.id;
  const trackBody = request.body;

  console.log(trackID);
  console.log(trackBody);

  const values = [
    trackBody.trackName,
    trackBody.length,
    trackBody.creationYear,
    trackBody.genre,
    trackID,
  ];
  const query =
    "UPDATE tracks SET trackName=?, length=?, creationYear=?, genre=?";
  dbConnection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// DELETE a track //
app.delete("/tracks/:trackID", async (request, response) => {
  const id = request.params.trackID;
  const values = [id];
  const query = "DELETE FROM tracks WHERE trackID=?";

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
app.get("/albums", async (request, response) => {
  const query = "SELECT * FROM albums";
  const [albumResult] = await dbConnection.execute(query);
  response.json(albumResult);
});

// READ one albums
app.get("/albums/:id", async (request, response) => {
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
// app.post("/albums", (request, response) => {
//   const album = request.body;
//   console.log(album);

//   const values = [album.albumName, album.edition, album.year, album.albumImage];
//   const query =
//     "INSERT INTO albums (albumName, edition, year, albumImage) VALUES (?,?,?,?)";

//   dbConnection.query(query, values, (err, results, fields) => {
//     if (err) {
//       console.log(err);
//     } else {
//       response.json(results);
//     }
//   });
// });

// CREATE albums
app.post("/albums", async (request, response) => {
  const album = request.body;

  const albumQuery =
    "INSERT INTO albums (albumName, edition, year, albumImage) VALUES (?,?,?,?)";
  const albumValues = [
    album.albumName,
    album.edition,
    album.year,
    album.albumImage,
  ];

  try {
    const [rows, fields] = await dbConnection.execute(albumQuery, albumValues);

    // ....hvor kommer insert id fra (Ja dette er en "dev note only").
    const newAlbumID = rows.insertId;

    const artistQuery =
      "INSERT INTO artists_albums (artist_ID, album_ID) VALUES (?,?)";
    const artistValue = [album.artistID, newAlbumID];

    const [aristsAlbumsResult, fields2] = await dbConnection.execute(
      artistQuery,
      artistValue
    );

    console.log(aristsAlbumsResult);

    response.json({ message: "You created a new Album" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  }
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

// READ all albums
app.get("/artists_tracks", (request, response) => {
  const query = "SELECT * FROM artists_tracks";
  dbConnection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

// READ all albums
app.get("/artists_albums", async (request, response) => {
  const query = "SELECT * FROM artists_albums";
  const [result] = await dbConnection.execute(query);
  response.json(result);
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
  ORDER BY albums.albumName, tracks.trackName;
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
