/* eslint-disable camelcase */
const mapSongDBToSongModel = ({
  album_id,
  ...args
}) => ({
  ...args,
  albumId: album_id,
});

const mapSongsDBToSongsModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapAlbumDBToAlbumModel = ({
  cover_url,
  ...args
}) => ({
  ...args,
  coverUrl: cover_url,
});

module.exports = { mapSongDBToSongModel, mapSongsDBToSongsModel, mapAlbumDBToAlbumModel };
