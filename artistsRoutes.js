import { Router } from "express";
import dbConnection from "./data/database.js";
const appArtistRouter = Router();

// READ all artists
appArtistRouter.get("/", async (request, response) => {
  try {
    const query = "SELECT * FROM artists ORDER BY artistName;";
    const [artistResult] = await dbConnection.execute(query);
    response.json(artistResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// "SELECT from artists INNER JOIN artists_tracks WHERE artist.artistID = artists_tracks.id;"
// "SELECT * FROM artists ORDER BY artistName;";

// READ artist by id
appArtistRouter.get("/:id", async (request, response) => {
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
appArtistRouter.post("/", async (request, response) => {
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
appArtistRouter.put("/:id", async (request, response) => {
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
appArtistRouter.delete("/:id", async (request, response) => {
  try {
    const artistID = request.params.id;
    const artistsValue = [artistID];

    // Delete all fields with given artist foreignkeys from (artists_tracks)
    const deleteArtistsTrackQuery = `DELETE FROM artists_tracks WHERE artist_ID = ${artistID}`;
    const [deleteArtistsTrack] = await dbConnection.execute(
      deleteArtistsTrackQuery,
      artistsValue
    );

    // Delete all fields with given artist foreignkeys from (artists_albums)
    const deleteArtistAlbumQuery = `DELETE FROM artists_albums WHERE artist_ID = ${artistID}`;
    const [deletealbumTrack] = await dbConnection.execute(
      deleteArtistAlbumQuery,
      artistsValue
    );

    // Delete the artists from (artists)
    const query = "DELETE FROM artists WHERE artistID=?;";
    const deleteResult = await dbConnection.execute(query, artistsValue);

    response.json(deleteArtistsTrack, deletealbumTrack, deleteResult);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

export default appArtistRouter;
