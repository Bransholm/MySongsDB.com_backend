import { Router } from "express";
import dbConnection from "./data/database.js";
const appAlbumArtistsRouter = Router();

console.log("KrydsTabel Route");

appAlbumArtistsRouter.get("/", async (request, response) => {
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


export default appAlbumArtistsRouter;
