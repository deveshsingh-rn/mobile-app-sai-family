import assert from "node:assert/strict";
import test from "node:test";

import { createEventMapUrl, getEventMapCoordinate } from "./event-location.ts";

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
  assert.ok(url?.startsWith("https://www.openstreetmap.org/search?query="));
  assert.ok(url?.includes("Sai%20Hall"));
});

test("events with coordinates open their map pin", () => {
  assert.equal(
    createEventMapUrl({ latitude: 28.4595, longitude: 77.0266 }),
    "https://www.openstreetmap.org/?mlat=28.4595&mlon=77.0266#map=16/28.4595/77.0266"
  );
});
