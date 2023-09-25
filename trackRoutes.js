import { Router } from "express";
import dbConnection from "./data/database.js";
const appArtistRoutes = Router();

// READ all tracks //
appArtistRoutes.get("/", async (request, response) => {
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
appArtistRoutes.get("/:trackID", async (request, response) => {
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
appArtistRoutes.post("/", async (request, response) => {
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
    const [newTrack] = await dbConnection.execute(query, values);
    console.log(newTrack);

    const newTrackID = newTrack.insertId;

    for (const artist of track.artistIds) {
      console.log(typeof artist);

      const artistQuery =
        "INSERT INTO artists_tracks (artist_ID, track_ID) VALUES (?,?)";

      const artistValue = [artist, newTrackID];

      const [artistsTracksResult] = await dbConnection.execute(
        artistQuery,
        artistValue
      );
      console.log(artistsTracksResult);
    }
    response.json({ message: "You created a new track" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Internal server error" });
  }
});

// Update a track //
appArtistRoutes.put("/:trackID", async (request, response) => {
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
appArtistRoutes.delete("/:trackID", deleteTrack());

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

export default appArtistRoutes;
