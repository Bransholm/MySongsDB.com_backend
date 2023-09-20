import mysql from "mysql2";
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import connection from "./database.js";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

if (process.env.MYSQL_CERT) {
  dbconfig.ssl = { cs: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") };
}

app.listen(port, () => {
  console.log(`The sever is running on port ${port}\nEnjoy your day :)`);
});

//////// ------------- ALBUM ROUTS ------------- ////////

// READ all albums
app.get("/albums", (request, response) => {
  const query = "SELECT * FROM albums";
  connection.query(query, (err, results, fields) => {
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

  connection.query(query, values, (err, results, fields) => {
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

  connection.query(query, values, (err, results, fields) => {
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
  connection.query(query, values, (err, results, fields) => {
    response.json(results);
  });
});

// DELETE albums
app.delete("/albums/:albumId", async (request, response) => {
  const id = request.params.albumId; // tager id fra url'en, så det kan anvendes til at finde den givne bruger med "det" id.
  const values = [id];
  const query = "DELETE FROM album WHERE id=?";

  connection.query(query, values, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.json(results);
    }
  });
});

//////// ------------- ALBUM MANY TO MANY ------------- ////////

app.get("/album/:id", (request, response) => {
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
