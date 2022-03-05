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

module.exports = { mapSongDBToSongModel, mapSongsDBToSongsModel };
