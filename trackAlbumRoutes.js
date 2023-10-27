import { Router } from "express";
import dbConnection from "./data/database.js";
const appTracksAlbumsRouter = Router();


appAlbumArtistsRouter.get("/:id", async (request, response) => {
  try {
    const id = request.params.id;

    const queryString = /*sql*/ ` SELECT * FROM artists_albums INNER JOIN albums ON album_ID = albums.albumID INNER JOIN artists ON artists.artistID = artist_ID WHERE album_ID = ?; `;

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

export default appTracksAlbumsRouter;