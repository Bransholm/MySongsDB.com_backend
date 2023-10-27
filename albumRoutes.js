import { Router } from "express";
import dbConnection from "./data/database.js";
const appAlbumRouter = Router();

appAlbumRouter.delete("/", async (request, response) => {
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
});

appAlbumRouter.get("/", async (request, response) => {
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

appAlbumRouter.get("/:id", async (request, response) => {
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

appAlbumRouter.post("/", async (request, response) => {
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

appAlbumRouter.put("/", async (request, response) => {
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
        .json({ error: `The album with the id ${albumID} does not exsists` });
    } else {
      response.json(updatedAlbum);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// ALBUMS DOUBLE ROUTES...
appAlbumRouter.get("artist/:id/", async (request, response) => {
  try {
    const id = request.params.id;

    const queryString = /*sql*/ `
      SELECT albums.*, 
                artists.aristName AS artistName,
                artists.birthDate AS artistsBirthdate,
                artists.activeSince as artistsActive,
                artists.artistImage AS artistImage,
                aritsts.aritstID AS artistId
       FROM albums INNER JOIN artists_albums ON albums.album_ID =  artists_albums.id 
      INNER JOIN artists ON artits.artist_ID = artists_albums.id ;`; // sql query

    // SELECT posts.id AS post_id,
    //        posts.caption,
    //        posts.image AS post_image,
    //        users.id AS user_id,
    //        users.name AS user_name,
    //        users.mail,
    //        users.title,
    //        users.image AS user_image
    // FROM posts
    // INNER JOIN posts_users
    //     ON posts.id = posts_users.post_id
    // INNER JOIN users
    //     ON posts_users.user_id = users.id;

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

export default appAlbumRouter;
