import { Router } from "express";
import dbConnection from "./data/database.js";
const appAlbumArtistsRouter = Router();


appAlbumArtistsRouter.get("/", async (request, response) => {
  
  const [albumResult] = await dbConnection.execute(query);
const queryString = /*sql*/ ` SELECT * FROM albums
INNER JOIN albums_tracks ON albumID = albums_tracks.album_ID
INNER JOIN tracks ON trackID = albums_tracks.track_ID
INNER JOIN artists_tracks ON artists_tracks.track_ID = tracks.trackID
INNER JOIN artists ON artists.artistID = artists_tracks.artist_ID;`;
  if (!albumResult) {
    response
      .status(500)
      .json({ message: "An Internal Server Error Has Occured" });
  } else {
    response.json(albumResult);
  }
});


// ALBUM - TRACKS & ARTISTS -- Kræver at der er 
appAlbumArtistsRouter.get("/:id", async (request, response) => {
  try {
    const id = request.params.id;

    const queryString = /*sql*/ ` SELECT * FROM albums
INNER JOIN albums_tracks ON albumID = albums_tracks.album_ID
INNER JOIN tracks ON trackID = albums_tracks.track_ID
INNER JOIN artists_tracks ON artists_tracks.track_ID = tracks.trackID
INNER JOIN artists ON artists.artistID = artists_tracks.artist_ID
WHERE album_ID = ?; `;

    const values = [id];

    const [albumIdResult] = await dbConnection.execute(queryString, values);
    if (albumIdResult.length === 0) {
      response
        .status(404)
        .json({ error: `The album with the id ${id} does not exsists` });
    } else {
      response.json(albumIdResult);
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

export default appAlbumArtistsRouter;
