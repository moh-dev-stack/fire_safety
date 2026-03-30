import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/** Approximate Jalsa site — Islamabad, UK (Surrey) */
const VENUE: [number, number] = [51.1817, -0.7535];
const DEFAULT_ZOOM = 15;

function FixLeafletIcons() {
  useEffect(() => {
    const Default = L.Icon.Default.prototype as unknown as {
      _getIconUrl?: () => string;
    };
    delete Default._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: new URL(
        "leaflet/dist/images/marker-icon-2x.png",
        import.meta.url,
      ).href,
      iconUrl: new URL(
        "leaflet/dist/images/marker-icon.png",
        import.meta.url,
      ).href,
      shadowUrl: new URL(
        "leaflet/dist/images/marker-shadow.png",
        import.meta.url,
      ).href,
    });
  }, []);
  return null;
}

function MapResize() {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
}

export function MapPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Site map</h1>
        <p className="mt-1 text-slate-600">
          OpenStreetMap view centred on Islamabad, UK (Jalsa Salana site). Pan and
          zoom on touch devices.
        </p>
      </header>
      <div className="h-[min(50vh,420px)] min-h-[280px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <MapContainer
          center={VENUE}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom
        >
          <FixLeafletIcons />
          <MapResize />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={VENUE}>
            <Popup>Islamabad, UK — Jalsa Salana venue (approx.)</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
