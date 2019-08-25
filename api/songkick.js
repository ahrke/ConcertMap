const request = require('request-promise-native');
const { SONGKICK } = require('../config');
const { getPreciseDistance } = require('geolib');

// We need a way to calculate the distance between two coordinates to determine distance between venue and user
const distance = (loc1, loc2) => {
  return getPreciseDistance(loc1, loc2);
}

// We call songkick to request the metroId of a certain city
let getMetroId = (loc) => {
  return request(`https://api.songkick.com/api/3.0/search/locations.json?location=geo:${loc.latitude},${loc.longitude}&apikey=${SONGKICK}`)
}

// Using songkick's metroID, we can then find events happening in the city
let getMetro = (metroId) => {
  return request(`https://api.songkick.com/api/3.0/metro_areas/${metroId}/calendar.json?apikey=${SONGKICK}`);
}

// This will help us get collection of events/concerts happening in the chosen city
// returns an array of event objects that meet the dates we're interested in
let getConcerts = async (lat, lng, date) => {
  let coordinates = {
    latitude: lat,
    longitude: lng
  }

  // Perform search for events occuring near given coordinates
  let metroAreasSearch = await getMetroId(coordinates);

  // We'll use an array to represent metroIds already in the metroAreasIds array
  let mAreaList = [];

  // We need a collection of MetroAreaIds. Using new Set() to create a unique array
  let metroAreasIds = JSON.parse(metroAreasSearch).resultsPage.results.location.map(loc => {
    let locCoordinates = {
      latitude: loc.metroArea.lat || 0,
      longitude: loc.metroArea.lng || 0
    }

    let d = distance(coordinates, locCoordinates)

    return {
      loc,
      d
    };
  })
  .sort((a,b) => a.d - b.d)
  .filter(loc_inner => {
    if (mAreaList.includes(loc_inner.loc.metroArea.id)) {
      return false;
    } else {
      mAreaList.push(loc_inner.loc.metroArea.id)

      return true;
    }
  })
  .splice(0,3)
  .map(ma => {
    return ma.loc.metroArea.id
  });

  let listOfEvents = [];

  for (let metroId of metroAreasIds) {
    let metroResults = await getMetro(metroId);
    let events = JSON.parse(metroResults).resultsPage.results.event;

    for (let event of events) {
      if(event.start.date == date) {

        let toAdd = {
          songkick_event_id: event.id,
          songkick_uri: event.uri,
          concertName: event.displayName,
          start: event.start,
          performers: event.performance,
          venue: event.venue.displayName
        }
        listOfEvents.push(toAdd)
      }
    }
  }

  return listOfEvents
}

// getConcerts(43.645144, -79.403008,'2019-08-25').then(res => console.log(res))

module.exports = {
  getConcerts
}
