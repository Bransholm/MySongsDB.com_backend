// import { Router } from "express";

// const appRouter = Router(); notes


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

export {
  deleteAlbum,
};
