const request = require('request-promise-native');
const SONGKICK_KEY = process.env.SONGKICK;

let getMetroId = (location) => {
  return request(`https://api.songkick.com/api/3.0/search/locations.json?query=${location}&apikey={your_api_key}`);
}

let getMetro = (metroId) => {
  return request(`https://api.songkick.com/api/3.0/metro_areas/${metroId}/calendar.json?apikey=${SONGKICK_KEY}`);
}

let getConcerts = async (location) => {
  let metroId = await getMetroId(location);
  let metroResults = await metro(metroId.resultsPage.results.location.metroArea.id);

  return metroResults.resultsPage.results;
}

module.exports = {
  getConcerts
}
