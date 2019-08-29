const request = require('request-promise-native');
const { getPreciseDistance } = require('geolib');
const SONGKICK_API_KEY = process.env.SONGKICK_API_KEY;

// We need a way to calculate the distance between two coordinates to determine distance between venue and user
const distance = (loc1, loc2) => getPreciseDistance(loc1, loc2);

const cache = {};

// We call songkick to request the metroId of a certain city
const getMetroIdsRequest = async(loc) => {
  const url = `https://api.songkick.com/api/3.0/search/locations.json?location=geo:${loc.lat},${loc.lng}&apikey=${SONGKICK_API_KEY}`;
  if (cache.hasOwnProperty(url)) return cache[url];
  const res = await request(url);
  cache[url] = res;
  return res;
};

// Using songkick's metroID, we can then find events happening in the city
const getEventsRequest = async(metroId) => {
  const url = `https://api.songkick.com/api/3.0/metro_areas/${metroId}/calendar.json?apikey=${SONGKICK_API_KEY}`;
  if (cache.hasOwnProperty(url)) return cache[url];
  const res = await request(url);
  cache[url] = res;
  return res;
};

// This will help us get collection of events/concerts happening in the chosen city
// returns an array of event objects that meet the dates we're interested in
const getVerifiedEvents = async(lat, lng) => {
  // Perform search for events occuring near given coordinates
  const metroIdsRes = await getMetroIdsRequest({ lat, lng });

  // We'll use an array to represent metroIds already in the metroAreasIds array
  const metroAreaList = [];

  // We need a collection of MetroAreaIds.
  const metroAreasIds = JSON.parse(metroIdsRes).resultsPage.results.location
    .map(loc => {
      const clientLoc = { latitude: lat, longitude: lng };
      const metroAreaLoc = { latitude: loc.metroArea.lat || 0, longitude: loc.metroArea.lng || 0 };
      const metroAreaId = loc.metroArea.id;
      const dist = distance(clientLoc, metroAreaLoc);
      return { metroAreaId, dist };
    })
    .sort((a, b) => a.dist - b.dist)
    .filter((area) => {
      if (metroAreaList.includes(area.metroAreaId)) {
        return false;
      } else {
        metroAreaList.push(area.metroAreaId);
        return true;
      }
    })
    .splice(0, 3)
    .map(area => area.metroAreaId);

  let events = [];

  for (let metroId of metroAreasIds) {
    let eventsRes = JSON.parse(await getEventsRequest(metroId)).resultsPage.results.event;
    for (let eventRes of eventsRes) {
      const artists = eventRes.performance.map(perf => {
        return { 'name': perf.artist.displayName, 'songkick_uri': perf.artist.uri };
      });
      const event = {
        'concert_id': eventRes.id,
        'songkick_uri': eventRes.uri,
        'name': eventRes.displayName,
        'start_date': (new Date(eventRes.start.datetime ? eventRes.start.datetime : eventRes.start.date)).getTime(),
        'artists': artists,
        'venue': eventRes.venue.displayName,
        'latlng': [eventRes.venue.lat || eventRes.location.lat, eventRes.venue.lng || eventRes.location.lng]
      };
      events.push(event);
    }
  }

  return events;
};

// getConcerts(43.645144, -79.403008,'2019-08-25').then(res => console.log(res))

module.exports = { getVerifiedEvents };
