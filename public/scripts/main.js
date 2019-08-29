import { LinkedMarkerMap, MarkerInfoWindow } from './map.js';
import { registerNewEventPopup } from './popup.js';

let map;
const artists = {};
let events;

const onGMapLoad = async () => {
  // const { coords } = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res));
  map = new LinkedMarkerMap(document.querySelector('.gmap-container'), {
    // center: { lat: coords.latitude, lng: coords.longitude },
    center: { lat: 43.661539, lng: -79.411079 },
    zoom: 14
  });

  map.addListener('markerselect', (marker) => {
    console.log('Marker Selected', marker.listNode);
    marker.listNode.classList.add('selected');
  });

  map.addListener('markerdeselect', (marker) => {
    console.log('Marker DEselected', marker.listNode);
    marker.listNode.classList.remove('selected');
  });

  map.addListener('markerclick', (marker, data) => {
    showArtist(data.concert_id);
  });

  map.addListener('markermouseover', (marker, data) => {
    const isPopupEnabled = document.querySelector('.content .main .popup').classList.contains('enabled');
    if (!isPopupEnabled && !map.selectedMarker) {
      map.selectMarker(marker);
      marker.listNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  map.addListener('markermouseout', (marker, data) => {
    const isPopupEnabled = document.querySelector('.content .main .popup').classList.contains('enabled');
    if (!isPopupEnabled && map.selectedMarker) {
      map.selectMarker(null);
    }
  });

  map.addListener('markerregister', (marker, data) => {
    if (!marker.listNode) {
      marker.listNode = getListNode({ concert_id: 0, image640: null, name: data[0], start_date: (new Date()).getTime() });
      marker.listNode.marker = marker;
      registerListNode(marker.listNode);
    }
  });

  registerNewEventPopup(map);

  events = window.embededData; // Replace with AJAX

  document.querySelector('.popup .close-btn').addEventListener('click', function(evt) {
    this.closest('.popup').classList.remove('enabled');
    map.selectMarker(null);
  });

  renderMarkers(events);
};

const getListNode = (event) => {
  const formatTime = (m) => m.getUTCHours() + m.getUTCMinutes() + m.getUTCSeconds() === 0 ? '' : ' ' + [m.getUTCHours(), m.getUTCMinutes(), m.getUTCSeconds()].join(':');
  const formatDate = (m) => [m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate()].join('/') + formatTime(m);
  const wrapper = document.createElement('div');
  wrapper.innerHTML =
    `<li data-event-id="${event.concert_id}">
        <img src='${event.image640 ? event.image640 : '#'}'>
        <p class='detail'>
          <span class='title'>${event.name.split('(')[0]}</span>
          <time><span class='date'>${formatDate(new Date(event.start_date))}</span></time>
        </p>
        <button class="locate-btn fas fa-map-marker-alt"></button>
    </li>`;
  wrapper.childNodes[0].addEventListener('click', () => showArtist(event.concert_id));
  return wrapper.childNodes[0];
};

const registerListNode = (...listNodes) => {
  const onListMouseEnter = function(evt) {
    const isPopupEnabled = document.querySelector('.content .main .popup').classList.contains('enabled');
    if (!isPopupEnabled) map.selectMarker(this.marker);
  };

  const onListMouseOut = function(evt) {
    const isPopupEnabled = document.querySelector('.content .main .popup').classList.contains('enabled');
    if (!isPopupEnabled) map.selectMarker(null);
  };

  const onListLocate = function(evt) {
    const isPopupEnabled = document.querySelector('.content .main .popup').classList.contains('enabled');
    if (isPopupEnabled) return;
    evt.stopPropagation();
    const listNode = evt.target.closest('li');
    map.setCenter(listNode.marker.position);
    map.selectMarker(listNode.marker);
  };

  const containerNode = document.querySelector('.nav-list');
  for (let listNode of listNodes) {
    listNode.addEventListener('mouseenter', onListMouseEnter);
    listNode.addEventListener('mouseleave', onListMouseOut);
    listNode.querySelector('.locate-btn').addEventListener('click', onListLocate);
  }
  containerNode.append(...listNodes);
};

const renderMarkers = (eventsRes) => {
  const listNodes = [];
  const containerNode = document.querySelector('.nav-list');
  containerNode.childNodes.forEach(n => containerNode.removeChild(n));
  for (let eventRes of eventsRes) {
    const listNode = getListNode(eventRes);
    listNodes.push(listNode);
    if (eventRes.latlng) {
      const marker = map.getNewMarker(eventRes.latlng[0], eventRes.latlng[1]);
      marker.listNode = listNode;
      listNode.marker = marker;
      map.registerMarker(marker, eventRes);
    }
  }
  registerListNode(...listNodes);
};

const showArtist = async (concertId) => {
  try {
    const sampleArtistName = events.find(evt => evt.concert_id === concertId).artists[0].name;
    const artist = await getArtistInfo(sampleArtistName);
    const popupNode = document.querySelector('.content .main .popup');
    const artistNode = popupNode.querySelector('.artist-area');
    artistNode.innerHTML =
      `<div class="artist">
        <img src="${artist.image640 ? artist.image640 : '#'}"/>
        <h1 class='name'>${artist.name}</h1>
        <iframe class="player" src="${artist.iframeUrl}" width="300" height="600" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
      </div>`;
    popupNode.classList.add('enabled');
    const eventListNode = document.querySelector(`[data-event-id="${concertId}"]`);
    map.selectMarker(eventListNode.marker);
  } catch (err) {
    console.log(err.message);
  }
}

const getArtistInfo = async (name) => {
  if (artists.hasOwnProperty(name)) return artists[name];

  let spotifyRes;
  const accessToken = sessionStorage.getItem('spotify_token');
  const headers = new Headers({ 'Authorization': `Bearer ${accessToken}` });
  // Search for artist in spotify database
  spotifyRes = await fetch(
    encodeURI(`https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`),
    { method: 'GET', headers }
  );
  const artistsRes = (await spotifyRes.json()).artists.items;

  if (artistsRes.length === 0) throw new Error(`Artist "${name}" not found`);

  const artistRes = artistsRes[0];

  spotifyRes = await fetch(
    `https://api.spotify.com/v1/artists/${artistRes.id}/albums?market=ES&limit=1`,
    { method: 'GET', headers }
  );
  const albumsRes = (await spotifyRes.json()).items;

  if (albumsRes.length === 0) throw new Error(`Artist "${name}" has no album`);

  artistRes.image640 = artistRes.images.length > 0 ? artistRes.images[0].url : null;
  artistRes.sampleAlbum = albumsRes[0];
  artistRes.iframeUrl = `https://open.spotify.com/embed/album/${albumsRes[0].id}`

  artists[name] = artistRes;

  return artistRes;
};

const getVenueDetails = async (query) => {
  service = new google.maps.places.PlacesService(map);

  const placesRes = await new Promise((resolve, reject) => {
    service.findPlaceFromQuery({ query, fields: ['place_id'] }, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });

  if (placesRes) {

  }

  const detailRes = await new Promise((resolve, reject) => {
    service.getDetails({ placeId: placesRes[0]['place_id'] }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(place);
      } else {
        reject(status);
      }
    });
  });

  return
};
$(document).ready(() => {
  google.maps.event.addDomListener(window, 'load', onGMapLoad);
});
