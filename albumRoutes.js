function readAllAlbums() {
  return async (request, response) => {
    const query = "SELECT * FROM albums";
    const [albumResult] = await dbConnection.execute(query);

    if (!albumResult) {
      response
        .status(500)
        .json({ message: "An Internal Server Error Has Occured" });
    } else {
      response.json(albumResult);
    }
  };
}

function readSpecificAlbum() {
  return async (request, response) => {
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
  };
}

function createNewAlbum() {
  return async (request, response) => {
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
  };
}

export { readAllAlbums, readSpecificAlbum, createNewAlbum };
