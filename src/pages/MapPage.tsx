import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { publicAsset } from "../lib/publicAsset";

/** Approximate Jalsa site - Islamabad, UK (Surrey) */
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
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Site map</h1>
        <p className="mt-1 text-slate-600">
          Sign and equipment map for Jalsa Salana UK 2025, followed by an
          OpenStreetMap view of the site. Pan and zoom on touch devices.
        </p>
      </header>
      <section className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        {!mapLoaded && (
          <div className="flex h-48 items-center justify-center bg-slate-50 text-sm text-slate-500">
            <svg className="mr-2 h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Loading sign and equipment map...
          </div>
        )}
        <img
          src={publicAsset("js2025-map.svg")}
          alt="Fire and Safety Sign and Equipment Map - Jalsa Salana UK 2025"
          decoding="async"
          onLoad={() => setMapLoaded(true)}
          className={`w-full h-auto object-contain${mapLoaded ? "" : " hidden"}`}
        />
      </section>

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
            <Popup>Islamabad, UK - Jalsa Salana venue (approx.)</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
