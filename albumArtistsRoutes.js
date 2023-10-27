import { Router } from "express";
import dbConnection from "./data/database.js";
const appAlbumArtistsRouter = Router();

console.log("KrydsTabel Route");

// ALBUMS DOUBLE ROUTES...
appAlbumArtistsRouter.get("/id:", async (request, response) => {
  try {
    console.log("album + artists");
    const id = request.params.id;
    const values = [id];

    // const queryString = /*sql*/ `
    //   SELECT albums.*,
    //             artists.aristName AS artistName,
    //             artists.birthDate AS artistsBirthdate,
    //             artists.activeSince as artistsActive,
    //             artists.artistImage AS artistImage,
    //             aritsts.aritstID AS artistId
    //    FROM albums INNER JOIN artists_albums ON albums.album_ID =  artists_albums.id
    //   INNER JOIN artists ON artits.artist_ID = artists_albums.id ;`; // sql query

    const queryString = /*sql*/ `
      SELECT * FROM albums;`;

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

export default appAlbumArtistsRouter;
