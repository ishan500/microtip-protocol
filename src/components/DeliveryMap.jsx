import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#10b981;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #10b981;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const driverIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#f59e0b;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 12px #f59e0b;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function DeliveryMap({ customerCoords, driversList = [], activeDriverCoords, isVerified }) {
  const onlineDrivers = driversList.filter(d => d.status === 'Online');

  return (
    <div className="h-72 w-full rounded-xl overflow-hidden relative border border-slate-800 z-10">
      <div className="absolute top-3 right-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        {isVerified ? "City Proximity Verified (2km Geofence)" : "Pune Metro Coverage Active"}
      </div>

      <MapContainer
        center={customerCoords}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {/* 2km Active Geofence Zone */}
        <Circle
          center={customerCoords}
          radius={2000}
          pathOptions={{
            color: isVerified ? '#10b981' : '#f59e0b',
            fillColor: isVerified ? '#10b981' : '#f59e0b',
            fillOpacity: 0.15,
            dashArray: isVerified ? null : '4, 4'
          }}
        />

        {/* Customer Destination Marker */}
        <Marker position={customerCoords} icon={customerIcon}>
          <Popup>
            <div className="text-xs font-sans text-slate-900">
              <strong>Order Delivery Destination</strong>
              <br />Pune Central Hub
            </div>
          </Popup>
        </Marker>

        {/* Online Drivers (Index 0 tracks activeDriverCoords from the slider) */}
        {onlineDrivers.map((driver, index) => {
          const coords =
            index === 0 && activeDriverCoords
              ? activeDriverCoords
              : driver.coords || [
                  customerCoords[0] + (index + 1) * 0.02,
                  customerCoords[1] + (index + 1) * 0.025
                ];

          return (
            <Marker key={index} position={coords} icon={driverIcon}>
              <Popup>
                <div className="text-xs font-sans text-slate-900">
                  <strong>{driver.name}</strong> ({driver.status})
                  <br />Vehicle: {driver.vehicle}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}