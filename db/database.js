// require all query modules
const { getUserWithEmail, getProfile, getUserCustomEvents, getUserEventTags, getUserCreatedTrips, getUserFavouritedTrips } = require('./queries/queries_user');
const { getAllTrips, getTripData } = require('./queries/queries_trips');
const { getCustomEventInfo, getCustomEventArtists } = require('./queries/queries_custom_events');

// require all insert modules
const { addTrip, addStop } = require('./inserts_updates/insert_trips_stops');
const { addTag } = require('./inserts_updates/insert_tag');
const { addUser, addProfile, updateProfileBio, updateProfileAvatarUri } = require('./inserts_updates/insert_users');
const { addCustomEvent } = require('./inserts_updates/insert_custom_events');

module.exports = {
  getUserWithEmail,
  getProfile,
  getUserCustomEvents,
  getUserEventTags,
  getUserCreatedTrips,
  getUserFavouritedTrips,
  getAllTrips,
  getTripData,
  getCustomEventInfo,
  getCustomEventArtists,
  addTrip,
  addStop,
  addTag,
  addUser,
  addProfile,
  updateProfileBio,
  updateProfileAvatarUri,
  addCustomEvent
}
