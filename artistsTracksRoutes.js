import { Router } from "express";
import dbConnection from "./data/database.js";
const appArtistsTracksRouter = Router();

appArtistsTracksRouter.get("/", async (request, response) => {
  const [albumResult] = await dbConnection.execute(query);
  const queryString = /*sql*/ ` SELECT * FROM artists
INNER JOIN artists_tracks ON artistID = artists_tracks.artist_ID
INNER JOIN tracks ON trackID = artists_tracks.track_ID
INNER JOIN albums_tracks ON albums_tracks.track_ID = tracks.trackID
INNER JOIN albums ON albums.albumID = albums_tracks.album_ID; `;
  if (!albumResult) {
    response
      .status(500)
      .json({ message: "An Internal Server Error Has Occured" });
  } else {
    response.json(albumResult);
  }
});

appArtistsTracksRouter.get("/:id", async (request, response) => {
  try {
    const id = request.params.id;

    const queryString = /*sql*/ ` SELECT * FROM artists
INNER JOIN artists_tracks ON artistID = artists_tracks.artist_ID
INNER JOIN tracks ON trackID = artists_tracks.track_ID
INNER JOIN albums_tracks ON albums_tracks.track_ID = tracks.trackID
INNER JOIN albums ON albums.albumID = albums_tracks.album_ID
WHERE artistID = ?; `;

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

export default appArtistsTracksRouter;
