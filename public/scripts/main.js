import { LinkedMarkerMap, MarkerInfoWindow } from './map.js';
import { registerNewEventPopup } from './popup.js';

let map;
let artists = {};
let hashParams = {};

let icons = [];
icons.push('<i class="fas fa-bread-slice"></i>');
icons.push('<i class="fas fa-bone"></i>');
icons.push('<i class="fas fa-bacon"></i>');
icons.push('<i class="fas fa-cookie"></i>');
icons.push('<i class="fas fa-hamburger"></i>');
icons.push('<i class="fas fa-atom"></i>');
icons.push('<i class="fas fa-brain"></i>');
icons.push('<i class="fas fa-burn"></i>');
icons.push('<i class="fas fa-fire"></i>');
icons.push('<i class="fas fa-guitar"></i>');
icons.push('<i class="fas fa-drum"></i>');
icons.push('<i class="fas fa-baby-carriage"></i>');

const getRandomIcon = () => {
  return icons[Math.floor(Math.random() * icons.length)]
}

const onGMapLoad = async () => {
  // const { coords } = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res));
  window.map = map;
  map = new LinkedMarkerMap(document.querySelector('.gmap-container'), {
    // center: { lat: coords.latitude, lng: coords.longitude },
    center: { lat: 43.661539, lng: -79.411079 },
    zoom: 14
  });

  map.addListener('markerselect', (marker) => {
    marker.listNode.classList.add('selected');
  });

  map.addListener('markerdeselect', (marker) => {
    marker.listNode.classList.remove('selected');
  });

  map.addListener('markerclick', (marker, data) => {
    showArtist(data.concert_id);
  });

  map.addListener('markermouseover', (marker, data) => {
    if (!map.selectedMarker) {
      map.selectMarker(marker);
      marker.listNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  map.addListener('markermouseout', (marker, data) => {
    if (map.selectedMarker) {
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

  // Initialize data
  $(document).ready(() => {
    const initializeAsync = async () => {
      document.querySelector('.popup .close-btn').addEventListener('click', function(evt) {
        this.closest('.popup').classList.remove('enabled');
      });

      window.embededData.splice(25); // @TODO ONLY FOR TESTING UNTIL SPOTIFY API IS FIXED

      renderMarkers(window.embededData);

      const spotifyToken = sessionStorage.getItem('spotify_token');
      const collection = window.embededData
        .map(event => {
          const artists = event.artists.map(artist => artist.name);
          return { id: event.concert_id, artists };
        });
      artists = await getArtistsInfo(collection, spotifyToken);
    };

    initializeAsync();
  });
};

const getListNode = (event) => {
  const formatTime = (m) => m.getUTCHours() + m.getUTCMinutes() + m.getUTCSeconds() === 0 ? '' : ' ' + [m.getUTCHours(), m.getUTCMinutes(), m.getUTCSeconds()].join(':');
  const formatDate = (m) => [m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate()].join('/') + formatTime(m);
  const wrapper = document.createElement('div');
  // <img src='${event.image640 ? event.image640 : '#'}'>
  wrapper.innerHTML =
    `<li data-event-id="${event.concert_id}">
        ${getRandomIcon()}
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

const onListMouseEnter = function(evt) {
  map.selectMarker(this.marker);
};

const onListMouseOut = function(evt) {
  map.selectMarker(null);
};

const onListLocate = function(evt) {
  evt.stopPropagation();
  const listNode = evt.target.closest('li');
  map.setCenter(listNode.marker.position);
  map.selectMarker(listNode.marker);
};

const getArtistsInfo = async (artists, access_token) => {
  let artistsCollection = {};

  for (let a of artists) {

    let venueArtists = [];

    for (let artist of a.artists) {
      let aObj = {};

      // Search for artist in spotify database
      let artistInfo = await $.ajax({
        url: "https://api.spotify.com/v1/search?q=" + artist + "&type=artist",
        type: "GET",
        headers: {
          "Authorization": "Bearer " + access_token
        }
      })

      // Create an object to hold artist information
      if (artistInfo.artists.items.length === 0) {
        continue;
      }
      let a = artistInfo.artists.items[0];
      aObj.name = a.name || 0;
      aObj.href = a.href || 0;
      aObj.id = a.id || 0;
      if (a.images[0]) {
        aObj.image640 = a.images[0].url;
      }

      let albumUrl = `https://api.spotify.com/v1/artists/${a.id}/albums?market=ES&limit=2`
      let albumInfo = await $.ajax({
        url: albumUrl,
        type: "GET",
        headers: {
          "Authorization": "Bearer " + access_token
        }
      })

      aObj.iframeUrl = `https://open.spotify.com/embed/album/${albumInfo.items[0].id}`

      venueArtists.push(aObj);
    }
    artistsCollection[a.id] = venueArtists;
  }

  return artistsCollection;
};

const artistDisplay = (artist, containerNode) => {
  containerNode.innerHTML =
    `<div class="artist">
      <img src="${artist.image640 ? artist.image640 : '#'}"/>
      <h1 class='name'>${artist.name}</h1>
      <iframe class="player" src="${artist.iframeUrl}" width="300" height="600" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    </div>`;
};

const showArtist = (id) => {
  if (!artists[id]) return;
  const popupNode = document.querySelector('.content .main .popup');
  popupNode.classList.add('enabled');
  artistDisplay(artists[id][0], popupNode.querySelector('.artist-area'));
}

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
