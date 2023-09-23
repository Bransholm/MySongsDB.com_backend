import express, { response } from "express";
import cors from "cors";
import fs from "fs/promises";
import dbConnection from "./data/database.js";
import { request } from "http";
import { error } from "console";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(
    `The sever is running on port http://127.0.0.1:${port}\nRasmus, Edith and Peter is proud of you\nEnjoy your day - You are doing a good job:)`
  );
});

//////// GENEREL ROUTES ////////
app.get("/", (request, response) => {
  response.send("MySongsDB.com");
});


//////// ARTIST ROUTES ////////

// READ all artists
app.get("/artists", (request, response) => {
  const query = "SELECT * FROM artists ORDER BY artistName;";
  dbConnection.query(query, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});


// READ artist by id
app.get("/artists/:id", (request, response) => {
  const id = request.params.id;
  const query = "SELECT * FROM artists WHERE artists.artistID=?";
  const values = [id];

  dbConnection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results[0]);
    }
  });
});

// CREATE artist
app.post("/artists", (request, response) => {
  const artist = request.body;
  const query =
    "INSERT INTO artists (artistName, birthdate, activeSince, artistImage) values(?,?,?,?);";
  const values = [
    artist.artistName,
    artist.birthdate,
    artist.activeSince,
    artist.artistImage
  ];
  
  dbConnection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});


// UPDATE artist
app.put("/artists/:id", (request, response) => {
  const artistID = request.params.id;
  const artistBody = request.body;
  const query =
    "UPDATE artists SET artistName=?, birthdate=?, activeSince=?, artistImage=? WHERE artistID=?;";
  const values = [
    artistBody.artistName,
    artistBody.birthdate,
    artistBody.activeSince,
    artistBody.artistImage,
    artistID
  ];

  dbConnection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});


// DELETE artist
app.delete("/artists/:id", (request, response) => {
  const id = request.params.id;
  const query = "DELETE FROM artists WHERE artistID=?;";
  const values = [id];

  dbConnection.query(query, values, (error, results, fields) => {
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

app.post("/tracks", async (request, response) => {
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

  const [trackResult] = await dbConnection.execute(query, values);
  const newTrackID = trackResult.insertId;

  const trackQuery =
    "INSERT INTO artists_tracks (artist_ID, track_ID) VALUES (?, ?)";
  const trackValues = [track.artistID, newTrackID];

  const [artistTrackResult] = await dbConnection.execute(
    trackQuery,
    trackValues
  );
  console.log(artistTrackResult);

  response.json({ message: "A new song have been created" });
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
