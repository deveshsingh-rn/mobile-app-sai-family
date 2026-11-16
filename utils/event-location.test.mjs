import assert from "node:assert/strict";
import test from "node:test";

import { createEventMapUrl, createGoogleMapsAppUrl, getEventMapCoordinate } from "./event-location.ts";

test("accepts finite event coordinates for the map preview", () => {
  assert.deepEqual(getEventMapCoordinate({ latitude: 28.4595, longitude: 77.0266 }), {
    latitude: 28.4595,
    longitude: 77.0266,
  });
});

test("does not pin missing, invalid or placeholder coordinates", () => {
  assert.equal(getEventMapCoordinate({ address: "Gurugram" }), null);
  assert.equal(getEventMapCoordinate({ latitude: 0, longitude: 0 }), null);
  assert.equal(getEventMapCoordinate({ latitude: 91, longitude: 77 }), null);
  assert.equal(getEventMapCoordinate({ latitude: Number.NaN, longitude: 77 }), null);
});

test("address-only events still open the location in Maps", () => {
  const url = createEventMapUrl({
    address: "Sector 20, Gurugram",
    city: "Gurugram",
    venueName: "Sai Hall",
  });
  assert.ok(url?.startsWith("https://www.google.com/maps/search/?api=1&query="));
  assert.ok(url?.includes("Sai%20Hall"));
});

test("events with coordinates open their map pin", () => {
  assert.equal(
    createEventMapUrl({ latitude: 28.4595, longitude: 77.0266 }),
    "https://www.google.com/maps/search/?api=1&query=28.4595%2C77.0266"
  );
});

test("iOS Google Maps app link pins coordinates, or searches the address", () => {
  assert.equal(
    createGoogleMapsAppUrl({ latitude: 28.4595, longitude: 77.0266 }),
    "comgooglemaps://?q=28.4595%2C77.0266&center=28.4595,77.0266&zoom=16"
  );
  assert.equal(
    createGoogleMapsAppUrl({ address: "Sector 20", city: "Gurugram" }),
    "comgooglemaps://?q=Sector%2020%2C%20Gurugram"
  );
  assert.equal(createGoogleMapsAppUrl({}), null);
  assert.equal(createEventMapUrl({}), null);
});
