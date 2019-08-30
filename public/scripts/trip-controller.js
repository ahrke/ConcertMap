import { MarkerInfoWindow, redMarker, greenMarker } from './map.js';
import { isMobileDevice } from './popup.js';
import { postObj } from './api.js';

const getTripInfo = async function(tripId) {
  const req = await fetch(encodeURI(`/trips/${tripId}/stops`), { method: 'GET' });
  const res = await req.json();
  if (res.error) throw new Error(res.error);
  return res;
};

const TripController = function(map, trips, events, isReadOnly) {
  this._map = map;
  this._isReadOnly = isReadOnly;
  this.trips = trips;
  this.events = events.sort((evt1, evt2) => evt2.id - evt1.id);
  this.cur = trips.length > 0 ? 0 : null;

  if (!this._isReadOnly) this.registerTripEditor();
  this.registerTripSwitcher();
  this.update();
};

TripController.prototype.next = function() {
  if (this.cur + 1 >= this.trips.length) return;
  this.cur += 1;
  this.update();
};

TripController.prototype.prev = function() {
  if (this.cur - 1 < 0) return;
  this.cur -= 1;
  this.update();
};

TripController.prototype.setTrip = function(tripId) {
  const newIndex = this.trips.findIndex(trip => String(trip.id) === tripId);
  if (newIndex < 0) return;
  this.cur = newIndex;
  this.update();
};

TripController.prototype.registerTripSwitcher = function() {
  const map = this._map;
  this.tripNameControl = (() => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="trip-name-container" style="text-align: center; font-size: 16px; background: #FFFFFF; padding: 10px; min-width: 250px;">
                            <p class="name"></p>
                            <i class="trip-add-btn fas fa-plus-circle" style="font-size: 16px; display: block; width: 16px; margin: 0 auto; padding: 4px;"></i>
                            <div class="form-group" style="display: none">
                              <input type="text" class="form-control" placeholder="New Trip Name" />
                              <button type="button" class="form-control btn btn-primary">Add Trip</button>
                            </div>
                        </div>`;
    return wrapper.childNodes[0];
  })();
  this.leftNavControl = (() => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<i class="trip-left-btn fas fa-angle-double-left" style="font-size: 16px; background: #FFFFFF; padding: 10px; margin-left: 20px;"></i>`;
    return wrapper.childNodes[0];
  })();
  this.rightNavControl = (() => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<i class="trip-right-btn fas fa-angle-double-right" style="font-size: 16px; background: #FFFFFF; padding: 10px; margin-right: 20px;"></i>`;
    return wrapper.childNodes[0];
  })();

  this.tripNameControl.querySelector('button').addEventListener('click', async(evt) => {
    const formNode = this.tripNameControl.querySelector('.form-group');
    const name = formNode.querySelector('input[type="text"]').value;
    // Add trip
    const { newTrip } = await postObj(`/trips`, {name});
    this.trips.push(newTrip);
    this.setTrip(newTrip.id);
    formNode.style.setProperty('display', 'none');
  });

  this.tripNameControl.querySelector('.trip-add-btn').addEventListener('click', (evt) => {
    const formNode = this.tripNameControl.querySelector('.form-group');
    formNode.style.setProperty('display', 'block');
  })

  this.leftNavControl.addEventListener('click', (evt) => {
    this.prev();
  });

  this.rightNavControl.addEventListener('click', (evt) => {
    this.next();
  });

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.tripNameControl);
  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(this.rightNavControl);
map.controls[google.maps.ControlPosition.LEFT_CENTER].push(this.leftNavControl);
};

TripController.prototype.confirmLink = async function(prevMarker, marker, description) {
  const trip = this.trips[this.cur];
  const prevStop = prevMarker ? Object.values(trip.stops).find(stop => stop['event_id'] === prevMarker.data.id) : null;
  const prevStopId = prevStop ? prevStop.id : null;
  const stop = {
    'trip_id': trip.id,
    'event_id': marker.data.id,
    description
  };
  const { newStop } = await postObj(`/trips/${trip.id}/stops`, { prevStopId, stop });
  trip.stops[newStop.id] = newStop;
  newStop.prev = trip.lastStop;
  newStop.event = this.events.find(event => event.id === stop['event_id']);
  trip.lastStop = newStop;
};

TripController.prototype.confirmRemove = async function(marker) {
  const trip = this.trips[this.cur];
  const stopId = Object.values(trip.stops).find(stop => stop['event_id'] === marker.data.id).id;
  const res = await postObj(`/trips/${trip.id}/stops/${stopId}/delete`, {});
};

TripController.prototype.removeFromLink = function(marker) {
  if (marker === this.markerRoot) {
    this.markerRoot = marker.prev;
    this._map.selectMarker(this.markerRoot);
  }
  this._map.removeMarkerLink(marker);
};

TripController.prototype.addStopPopup = function(marker, description) {
  marker.stopWindow = new MarkerInfoWindow(marker);
  marker.stopWindow.addListener('markerclick', (marker, containerNode, closeBtnNode) => {
    closeBtnNode.addEventListener('click', () => {
      this.removeFromLink(marker);
      this.confirmRemove(marker);
    });
  });
  marker.stopWindow.setClosable(!this._isReadOnly);
  marker.stopWindow.open(description);
};

TripController.prototype.registerTripEditor = function() {
  const map = this._map;

  map.addListener('markerregister', (marker, data) => {
    marker.infoWindow.setClosable(false);
  });

  map.addListener('markermouseover', (marker, event) => {
    marker.infoWindow.open(`${event.name}`);
  });

  map.addListener('markermouseout', (marker, data) => {
    marker.infoWindow.close();
  });

  map.addListener('markerclick', (marker, event) => {
    if (marker.prompt) return;
    if (map.isMarkerLinked(marker)) return;
    if (!this.markerRoot) this.markerRoot = marker;

    if (this.markerRoot !== marker) {
      map.addLink(this.markerRoot, marker);
      this.markerRoot = marker;
    }
    map.selectMarker(this.markerRoot);

    // Create a popup to get input
    const onPopupLoad = (marker, containerNode, closeBtnNode) => {
      const submitBtnNode = containerNode.querySelector('button');

      // popup discard
      closeBtnNode.addEventListener('click', (evt) => {
        delete marker.prompt;
        this.removeFromLink(marker);
      });

      // popup save
      submitBtnNode.addEventListener('click', (evt) => {
        const description = containerNode.querySelector('textarea').value;
        prompt.close();
        delete marker.prompt;
        // Send data to server
        this.confirmLink(marker.prev, marker, description);
        // Create new floating stop description popup
        this.addStopPopup(marker, description);
      });
    };

    const addStopPopup = `<div class="edit-stop-popup form-group">
                            <textarea class="stop-editor form-control" placeholder="Description"></textarea>
                            <button type="button" class="form-control btn btn-primary">Save</button>
                          </div>`;
    const prompt = new MarkerInfoWindow(marker);
    prompt.setClosable(true);
    prompt.addListener('markerclick', onPopupLoad);
    marker.infoWindow.close();
    prompt.open(addStopPopup);
    marker.prompt = prompt;
    if (isMobileDevice()) map.setCenter(marker.getPosition());
  });
};

TripController.prototype.update = async function() {
  const trip = this.trips[this.cur];

  if (!trip.stops) {

    const stopsRes = await getTripInfo(trip.id);

    const stops = {};
    for (let stop of stopsRes) {
      stops[stop.id] = stop;
    }
    for (let stop of stopsRes) {
      stop.event = this.events.find(event => event.id === stop['event_id']);

      if (!stop['next_stop_id']) continue;
      stop.next = stops[stop['next_stop_id']];
      stop.next.prev = stop;
    }

    trip.stops = stops;
    trip.lastStop = (trip['last_stop_id'] ? stops[trip['last_stop_id']] : null);
  }

  this.tripNameControl.querySelector('.name').innerText = trip.name;
  this.render();
};

TripController.prototype.render = function() {
  this.markerRoot = null;
  this._map.selectMarker(null);
  this._map.clear();
  for (let event of this.events) {
    if (event.latlng) {
      const icon = event.id[0] === 'c' ? greenMarker : redMarker;
      const marker = this._map.getNewMarker(event.latlng[0], event.latlng[1], icon);
      this._map.registerMarker(marker, event);
      event.marker = marker;
    }
  }

  const trip = this.trips[this.cur];
  let stop = trip.lastStop;
  while (stop) {
    if (!stop.event) continue;
    if (!stop.prev.event) continue;
    if (stop.prev) this._map.addLink(stop.prev.event.marker, stop.event.marker);
    this.addStopPopup(stop.event.marker, stop.description);
    stop = stop.prev;
  }

  if (!this._isReadOnly && trip.lastStop) {
    this.markerRoot = trip.lastStop.event.marker;
    this._map.selectMarker(this.markerRoot);
  }
};

export { TripController };
