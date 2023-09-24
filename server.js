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
app.get("/artists", async (request, response) => {
  try {
    const query = "SELECT * FROM artists ORDER BY artistName;";
    const [artistResult] = await dbConnection.execute(query);
    response.json(artistResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// READ artist by id
app.get("/artists/:id", async (request, response) => {
  try {
    const id = request.params.id;
    const query = "SELECT * FROM artists WHERE artists.artistID=?";
    const values = [id];

    const [artistResult] = await dbConnection.execute(query, values);

    if (artistResult.length === 0) {
      response
        .status(404)
        .json({ error: `The artist with the id ${id} does not exist` });
    } else {
      response.json(artistResult[0]);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// CREATE artist
app.post("/artists", async (request, response) => {
  try {
    const artist = request.body;
    const query =
      "INSERT INTO artists (artistName, birthdate, activeSince, artistImage) VALUES (?,?,?,?);";
    const values = [
      artist.artistName,
      artist.birthdate,
      artist.activeSince,
      artist.artistImage,
    ];

    const insertResult = await dbConnection.execute(query, values);
    response.json(insertResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE artist
app.put("/artists/:id", async (request, response) => {
  try {
    const artistID = request.params.id;
    const artistBody = request.body;
    const query =
      "UPDATE artists SET artistName=?, birthdate=?, activeSince=?, artistImage=? WHERE artistID=?;";
    const values = [
      artistBody.artistName,
      artistBody.birthdate,
      artistBody.activeSince,
      artistBody.artistImage,
      artistID,
    ];

    const updateResult = await dbConnection.execute(query, values);
    response.json(updateResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE artist
app.delete("/artists/:id", async (request, response) => {
  try {
    const artistID = request.params.id;
    const value = [artistID];

    // ...
    const deleteArtistsTrackQuery = `DELETE FROM artists_tracks WHERE artist_ID = ${artistID}`;
    const [deleteArtistsTrack] = db.execute(deleteArtistsTrackQuery, value);

    //...

    const deleteAlbumsTracksQuery = `DELETE FROM albums_tracks WHERE artists_ID = ${artistID}`;
    const [deleteAlbumsTracks] = db.execute(deleteAlbumsTracksQuery, value);

    const query = "DELETE FROM artists WHERE artistID=?;";
    const deleteResult = await dbConnection.execute(query, value);

    response.json(deleteArtistsTrack, deleteAlbumsTracks, deleteResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

//////// TRACKS ROUTES ////////

// READ all tracks //
app.get("/tracks", async (request, response) => {
  try {
    const query = "SELECT * FROM tracks ORDER BY trackName";
    const [trackResult] = await dbConnection.execute(query);
    response.json(trackResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// READ one track //
app.get("/tracks/:trackID", async (request, response) => {
  try {
    const id = request.params.trackID;
    const queryString = /*sql*/ `
      SELECT * FROM tracks
      WHERE tracks.trackID=?;`; // sql query
    const values = [id];

    const [trackIdResult] = await dbConnection.execute(queryString, values);
    if (trackIdResult.length === 0) {
      response
        .status(404)
        .json({ error: `The track with the id ${id} does not exist` });
    } else {
      response.json(trackIdResult[0]);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a track //
app.post("/tracks", async (request, response) => {
  const track = request.body;
  console.log(track);

  const query =
    "INSERT INTO tracks (trackName, length, creationYear, genre) VALUES (?,?,?,?)";

  const values = [
    track.trackName,
    track.length,
    track.creationYear,
    track.genre,
  ];

  try {
    const [rows, fields] = await dbConnection.execute(query, values);

    const newTrackID = rows.insertId;

    const artistQuery =
      "INSERT INTO artists_tracks (artist_ID, track_ID) VALUES (?, ?)";
    const artistValues = [track.artistID, newTrackID];

    const [artistsTracksResult, fields2] = await dbConnection.execute(
      artistQuery,
      artistValues
    );

    console.log(artistsTracksResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  }
});

// Update a track //
app.put("/tracks/:trackID", async (request, response) => {
  try {
    const trackID = request.params.trackID;
    const trackBody = request.body;

    const values = [
      trackBody.trackName,
      trackBody.length,
      trackBody.creationYear,
      trackBody.genre,
      trackID,
    ];
    const query =
      "UPDATE tracks SET trackName=?, length=?, creationYear=?, genre=? WHERE trackID=?";
    const [updatedTrack] = await dbConnection.execute(query, values);

    if (updatedTrack.affectedRows === 0) {
      response.status(404).json({ error: "Track not found" });
    } else {
      response.json(updatedTrack);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE a track //
app.delete("/tracks/:trackID", deleteTrack());

//////// ALBUM ROUTS ////////

// READ all albums
app.get("/albums", async (request, response) => {
  const query = "SELECT * FROM albums";
  const [albumResult] = await dbConnection.execute(query);

  if (!albumResult) {
    response
      .status(500)
      .json({ message: "An Internal Server Error Has Occured" });
  } else {
    response.json(albumResult);
  }
});

// READ one albums
app.get("/albums/:id", async (request, response) => {
  try {
    const id = request.params.id;
    const queryString = /*sql*/ `
      SELECT * FROM albums
      WHERE albums.albumID=?;`; // sql query
    const values = [id];

    const [albumIdResult] = await dbConnection.execute(queryString, values);
    if (albumIdResult.length === 0) {
      response
        .status(404)
        .json({ error: `The album with the id ${id} does not exsists` });
    } else {
      response.json(albumIdResult[0]);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

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
    // Create a new album in the albums table
    const [newAlbum] = await dbConnection.execute(albumQuery, albumValues);
    console.log(newAlbum);

    // Get the newly created albumID
    const newAlbumID = newAlbum.insertId;

    for (const artist of album.artistIds) {
      console.log(typeof artist);

      const artistQuery =
        "INSERT INTO artists_albums (artist_ID, album_ID) VALUES (?,?)";

      const artistValue = [artist, newAlbumID];

      const [aristsAlbumsResult] = await dbConnection.execute(
        artistQuery,
        artistValue
      );
      console.log(aristsAlbumsResult);
    }

    for (const track of album.trackIds) {
      console.log(track);
      const trackQuery =
        "INSERT INTO albums_tracks (album_ID, track_ID) VALUES (?,?)";
      const trackValue = [newAlbumID, track];

      const [albumsTracskResults] = await dbConnection.execute(
        trackQuery,
        trackValue
      );
      console.log(albumsTracskResults);
    }

    response.json({ message: "You created a new Album" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE albums
app.put("/albums/:albumId", async (request, response) => {
  try {
    const albumID = request.params.albumId;
    const albumBody = request.body;

    const values = [
      albumBody.albumName,
      albumBody.edition,
      albumBody.year,
      albumBody.albumImage,
      albumID,
    ];
    const query =
      "UPDATE albums SET albumName=?, edition=?, year=?, albumImage=? WHERE albumID=?";

    const [updatedAlbum] = await dbConnection.execute(query, values);

    if (updatedAlbum.affectedRows === 0) {
      response
        .status(404)
        .json({ error: `The album with the id ${id} does not exsists` });
    } else {
      response.json(updatedAlbum);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE albums and the crosstable fields it belongs to.
app.delete("/albums/:albumId", deleteAlbum());

/// CROSSTABLE DIRET ///

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
app.get("/artists_tracks", async (request, response) => {
  const query = "SELECT * FROM artists_tracks";
  const [results] = await dbConnection.execute(query);
  response.json(results);
});

// READ all albums
app.get("/artists_albums", async (request, response) => {
  const query = "SELECT * FROM artists_albums";
  const [result] = await dbConnection.execute(query);
  response.json(result);
});

//////// ------------- ALBUM MANY TO MANY ------------- ////////

app.get("/albums/:id/tracks", async (request, response) => {
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

//////// CROSS TABLE ROUTES ////////

// Laver en nyt field i krydstabellen - aritst_albums
app.post("/artists_albums", async (request, response) => {
  const uptadeBody = request.body;
  const query = /*sql*/ `INSERT INTO artists_albums (artist_ID, album_ID) VALUES(?,?) `;
  const values = [uptadeBody.artistID, uptadeBody.albumID];
  const [crossTrackResult] = await dbConnection.execute(query, values);
  response.json(crossTrackResult);
});

//////// SEARCH ROUTES ////////////

// TRACK SEARCH //

// Dette er en route for at søge på trackNames
// app.get("/search", async (request, response) => {
//   try {
//     const searchType = request.query.type;
//     const searchTerm = request.query.q; // User angiver hvad der skal skrives og findes i query parameteret

//     let query = "";

//     if (searchType === "trackName") {
//       query = "SELECT * from tracks WHERE trackName LIKE ?";
//     } else if (searchType === "genre") {
//       query = "SELECT * from tracks WHERE genre LIKE ?";
//     } else {
//       return response.status(400).json({ error: "Invalid search type" });
//     }
//     // Vi laver en query til databasen som prøver at matche det som der søges på med det som står i databasen
//     const [rows] = await dbConnection.query(query, [`%${searchTerm}%`]);
//     response.json({ tracks: rows });
//   } catch (error) {
//     console.error(
//       "There was an error, when attempting to search for a trackName",
//       error
//     );
//     response
//       .status(500)
//       .json({ error: "An error occurred while searching for tracks" });
//   }
// });

// //Dette er en route for at finde track genre : genre

// // app.get("/search", async (request, response) => {
// //   try {
// //     const searchTerm = request.query.q;
// //     const [rows] = await dbConnection.query(
// //       "SELECT * FROM tracks WHERE genre LIKE ?",
// //       [`%${searchTerm}%`]
// //     );
// //     response.json({ tracks: rows });
// //   } catch (error) {
// //     console.error(
// //       "There was an error, when attempting to search for a track genre",
// //       error
// //     );
// //     response
// //       .status(500)
// //       .json({ error: "An error occurred while searching for tracks" });
// //   }
// // });

// // ARTIST SEARCH //

// app.get("/search", async (request, response) => {
//   try {
//     const searchType = request.query.type;
//     const searchTerm = request.query.q;

//     let query = "";

//     if (searchType === "artistName") {
//       query = "SELECT * from artists WHERE artistName LIKE ?";
//     } else if (searchType === "activeSince") {
//       query = "SELECT * from artists WHERE activeSince LIKE ?";
//     } else {
//       return response.status(400).json({ error: "Invalid search type" });
//     }

//     const [rows] = await dbConnection.query(query, [`%${searchTerm}%`]);
//     response.json({ artists: rows });
//   } catch (error) {
//     console.error("There was an error when attempting to search", error);
//     response
//       .status(500)
//       .json({ error: "An error occurred while searching for artists" });
//   }
// });

// // ALBUM SEARCH //

// app.get("/search", async (request, response) => {
//   try {
//     const searchType = request.query.type;
//     const searchTerm = request.query.q;

//     let query = "";

//     if (searchType === "albumName") {
//       query = "SELECT * from albums WHERE albumName LIKE ?";
//     } else if (searchType === "edition") {
//       query = "SELECT * from albums WHERE edition LIKE ?";
//     } else {
//       return response.status(400).json({ error: "Invalid search type" });
//     }

//     const [rows] = await dbConnection.query(query, [`%${searchTerm}%`]);
//     response.json({ albums: rows });
//   } catch (error) {
//     console.error(
//       "There was an error whent attempting to search for albums",
//       error
//     );
//     response
//       .status(500)
//       .json({ error: "An error occurred while searching for artists" });
//   }
// });

app.get("/search", async (request, response) => {
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

//////// TRACK FUNCTIONS ////////

function deleteTrack() {
  return async (request, response) => {
    try {
      const delteTrackID = request.params.trackID;
      const values = [delteTrackID];

      // Delete all fields with given track foreignkeys from (artists_tracks)
      const deleteArtistTrackQuery = `DELETE FROM artists_tracks WHERE track_ID= ${delteTrackID}`;
      const [deleteArtistsTrack] = await dbConnection.execute(
        deleteArtistTrackQuery,
        values
      );

      // Delete all fields with given track foreignkeys from (albums_tracks)
      const deleteAlbumTrackQuery = `DELETE FROM albums_tracks WHERE track_ID = ${delteTrackID}`;
      const [deleteAlbumTrack] = await dbConnection.execute(
        deleteAlbumTrackQuery,
        values
      );

      // Delete the given track from (trakcs)
      const query = "DELETE FROM tracks WHERE trackID=?";
      const [deletedTracks] = await dbConnection.execute(query, values);

      if (deletedTracks.affectedRows === 0) {
        response.status(404).json({
          error: `The track with the id ${delteTrackID} does not exist`,
        });
      } else {
        response.json(deleteArtistsTrack, deleteAlbumTrack, deletedTracks);
      }
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Internal Server Error" });
    }
  };
}

//////// ALBUM FUNCTIONS ////////

function deleteAlbum() {
  return async (request, response) => {
    const albumID = request.params.albumId;
    const albumValues = [albumID];
    try {
      // Delete all fields with given album foreignkeys from (albums_tracks)
      const albumsTracksQuery = `DELETE FROM albums_tracks WHERE album_ID = ${albumID};`;
      const [albumtrack] = await dbConnection.query(
        albumsTracksQuery,
        albumValues
      );

      // Delete all fields with given album foreignkeys from (artists_albums)
      const artistAlbumtQuery = `DELETE FROM artists_albums WHERE album_ID = ${albumID};`;
      const [artistAlbum] = await dbConnection.query(
        artistAlbumtQuery,
        albumValues
      );

      // Delete the given album from (albums)
      const albumQuery = "DELETE FROM albums WHERE albumID=?";
      const [albums] = await dbConnection.query(albumQuery, albumValues);

      if (albums.affectedRows === 0) {
        response
          .status(404)
          .json({ error: `The album with the id ${id} does not exsists` });
      } else {
        response.json(albumtrack, artistAlbum, albums);
      }
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Internal Server Error" });
    }
  };
}
