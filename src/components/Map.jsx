import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sample property boundaries (Chicago area) - demo data
const SAMPLE_PROPERTIES = [
  {
    id: 1,
    address: '875 North Michigan Avenue, Chicago, IL',
    bounds: [[41.8968, -87.6251], [41.8952, -87.6231]],
    price: 850000,
    area: 2500,
  },
  {
    id: 2,
    address: '101 East Erie Street, Chicago, IL',
    bounds: [[41.8924, -87.6219], [41.8908, -87.6199]],
    price: 1200000,
    area: 3200,
  },
  {
    id: 3,
    address: '360 North State Street, Chicago, IL',
    bounds: [[41.8866, -87.6288], [41.8850, -87.6268]],
    price: 950000,
    area: 2800,
  },
  {
    id: 4,
    address: '200 West Madison Street, Chicago, IL',
    bounds: [[41.8838, -87.6367], [41.8822, -87.6347]],
    price: 1100000,
    area: 3100,
  },
  {
    id: 5,
    address: '1000 South Michigan Avenue, Chicago, IL',
    bounds: [[41.8634, -87.6247], [41.8618, -87.6227]],
    price: 780000,
    area: 2400,
  },
];

const PropertyRectangle = ({ property, isSelected, onSelect }) => {
  const popupRef = React.useRef(null);

  const handleSelectClick = () => {
    onSelect(property);
    // Close the popup
    if (popupRef.current) {
      popupRef.current.closePopup();
    }
  };

  return (
    <Rectangle
      ref={popupRef}
      bounds={property.bounds}
      pathOptions={{
        color: isSelected ? '#ef4444' : '#3b82f6',
        weight: isSelected ? 3 : 2,
        opacity: isSelected ? 1 : 0.7,
        fillColor: isSelected ? '#fecaca' : '#bfdbfe',
        fillOpacity: isSelected ? 0.3 : 0.1,
      }}
      eventHandlers={{
        click: () => onSelect(property),
        mouseover: (e) => {
          e.target.setStyle({
            weight: isSelected ? 3 : 3,
            opacity: 1,
            fillOpacity: isSelected ? 0.3 : 0.2,
          });
        },
        mouseout: (e) => {
          e.target.setStyle({
            weight: isSelected ? 3 : 2,
            opacity: isSelected ? 1 : 0.7,
            fillOpacity: isSelected ? 0.3 : 0.1,
          });
        },
      }}
    >
      <Popup>
        <div className="p-2 text-sm">
          <p className="font-bold">{property.address}</p>
          <p className="text-gray-600">Area: {property.area.toLocaleString()} sq ft</p>
          <p className="text-gray-600">Est. Price: ${property.price.toLocaleString()}</p>
          <button
            onClick={handleSelectClick}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 w-full"
          >
            Select Property
          </button>
        </div>
      </Popup>
    </Rectangle>
  );
};

const Map = ({ mapCenter, selectedProperty, onPropertySelect }) => {
  const [hoveredProperty, setHoveredProperty] = useState(null);

  const handlePropertySelect = (property) => {
    console.log('✅ Property selected:', property.address);
    onPropertySelect({
      lat: (property.bounds[0][0] + property.bounds[1][0]) / 2,
      lng: (property.bounds[0][1] + property.bounds[1][1]) / 2,
      address: property.address,
      id: property.id,
      area: property.area,
      estimatedPrice: property.price,
    });
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '400px', width: '100%', cursor: 'grab' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Render all sample properties as rectangles */}
      {SAMPLE_PROPERTIES.map((property) => (
        <PropertyRectangle
          key={property.id}
          property={property}
          isSelected={selectedProperty?.id === property.id}
          onSelect={handlePropertySelect}
        />
      ))}

      {/* Selected property marker at center */}
      {selectedProperty && (
        <Marker 
          position={[selectedProperty.lat, selectedProperty.lng]}
          icon={L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })}
        >
          <Popup>
            <div className="p-2">
              <p className="font-bold text-sm">Selected Property</p>
              <p className="text-xs text-gray-600">{selectedProperty.address}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
