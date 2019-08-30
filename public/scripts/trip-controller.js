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
  this.update();
};

TripController.prototype.confirmLink = async function(prevMarker, marker, description) {
  const trip = this.trips[this.cur];
  const prevStop = Object.values(trip.stops).find(stop => stop['event_id'] === prevMarker.data.id);
  const prevStopId = prevStop ? prevStop.id : null;
  const stop = {
    'trip_id': trip.id,
    'event_id': marker.data.id,
    description
  };
  console.log('Add', {prevStopId, stop});
};

TripController.prototype.removeFromLink = function(marker) {
  if (marker === this.markerRoot) {
    this.markerRoot = marker.prev;
    this._map.selectMarker(this.markerRoot);
  }
  this._map.removeMarkerLink(marker);

  const trip = this.trips[this.cur];
  const stopId = Object.values(trip.stops).find(stop => stop['event_id'] === marker.data.id).id;
  console.log('Remove', {tripId: trip.id, stopId});
};

TripController.prototype.addStopPopup = function(marker, description) {
  marker.stopWindow = new MarkerInfoWindow(marker);
  marker.stopWindow.addListener('markerclick', (marker, containerNode, closeBtnNode) => {
    closeBtnNode.addEventListener('click', () => this.removeFromLink(marker));
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

  if (trip.stops) return;

  // const stopsRes = await getTripInfo(trip.id);

  // TEST:
  trip['last_stop_id'] = 3;
  const stopsRes = [
    { id: 1, event_id: 'c14', next_stop_id: 2, description: "A" },
    { id: 2, event_id: 'c12', next_stop_id: 3, description: "B" },
    { id: 3, event_id: 'c13', next_stop_id: null, description: "C" }
  ];

  const stops = {};
  for (let stop of stopsRes) {
    stops[stop.id] = stop;
  }
  for (let stop of stopsRes) {
    stop.event = this.events.find(event => event.id === stop['event_id']);

    if (stop['next_stop_id'] === null) continue;
    stop.next = stops[stop['next_stop_id']];
    stop.next.prev = stop;
  }

  trip.stops = stops;
  trip.lastStop = (trip['last_stop_id'] ? stops[trip['last_stop_id']] : null);

  this.render();
};

TripController.prototype.render = function() {
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
    if (stop.prev) this._map.addLink(stop.prev.event.marker, stop.event.marker);
    this.addStopPopup(stop.event.marker, stop.description);
    stop = stop.prev;
  }

  if (!this._isReadOnly && trip.lastStop) {
    this.markerRoot = trip.lastStop.event.marker;
    this._map.selectMarker(this.markerRoot);
  }
};

TripController.prototype.next = function() {
  if (this.cur + 1 >= this.trips.length) return;
  this.cur += 1;
  this.update();
};

TripController.prototype.prev = function() {
  if (this.cur - 1 <= 0) return;
  this.cur -= 1;
  this.update();
};

export { TripController };
