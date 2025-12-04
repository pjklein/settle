import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Ruler, Home } from 'lucide-react';

const Marketplace = ({ onPropertySelect, selectedProperty }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState([0, 1000000]);
  const [loading, setLoading] = useState(true);

  // Mock property data - in production, fetch from smart contract
  const mockProperties = [
    {
      id: 'prop-001',
      address: '875 North Michigan Avenue, Chicago, IL 60611',
      propertyType: 'apartment',
      squareFeet: 3500,
      estimatedPrice: 450000,
      coordinates: { lat: 41.8960, lng: -87.6241 },
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2015,
      zoning: 'Commercial',
      parcelId: 'CHI-001-2024'
    },
    {
      id: 'prop-002',
      address: '101 East Erie Street, Chicago, IL 60611',
      propertyType: 'office',
      squareFeet: 5000,
      estimatedPrice: 750000,
      coordinates: { lat: 41.8916, lng: -87.6209 },
      bedrooms: 0,
      bathrooms: 3,
      yearBuilt: 2010,
      zoning: 'Commercial',
      parcelId: 'CHI-002-2024'
    },
    {
      id: 'prop-003',
      address: '360 North State Street, Chicago, IL 60654',
      propertyType: 'penthouse',
      squareFeet: 8000,
      estimatedPrice: 1200000,
      coordinates: { lat: 41.8858, lng: -87.6278 },
      bedrooms: 4,
      bathrooms: 4,
      yearBuilt: 2018,
      zoning: 'Residential',
      parcelId: 'CHI-003-2024'
    },
    {
      id: 'prop-004',
      address: '200 West Madison Street, Chicago, IL 60606',
      propertyType: 'retail',
      squareFeet: 2500,
      estimatedPrice: 350000,
      coordinates: { lat: 41.8830, lng: -87.6357 },
      bedrooms: 0,
      bathrooms: 1,
      yearBuilt: 2005,
      zoning: 'Commercial',
      parcelId: 'CHI-004-2024'
    },
    {
      id: 'prop-005',
      address: '1000 South Michigan Avenue, Chicago, IL 60605',
      propertyType: 'residential',
      squareFeet: 2200,
      estimatedPrice: 550000,
      coordinates: { lat: 41.8626, lng: -87.6237 },
      bedrooms: 2,
      bathrooms: 2,
      yearBuilt: 2012,
      zoning: 'Residential',
      parcelId: 'CHI-005-2024'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      setLoading(false);
    }, 500);
  }, []);

  // Update filtered properties when search or filters change
  useEffect(() => {
    let filtered = properties;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prop =>
        prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.propertyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.parcelId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply property type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(prop => prop.propertyType === filterType);
    }

    // Apply price range filter
    filtered = filtered.filter(prop =>
      prop.estimatedPrice >= filterPriceRange[0] &&
      prop.estimatedPrice <= filterPriceRange[1]
    );

    setFilteredProperties(filtered);
  }, [searchTerm, filterType, filterPriceRange, properties]);

  const propertyTypeOptions = [
    { value: 'all', label: 'All Properties' },
    { value: 'residential', label: 'Residential' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'penthouse', label: 'Penthouse' }
  ];

  const getPropertyIcon = (type) => {
    const icons = {
      residential: '🏠',
      apartment: '🏢',
      office: '🏛️',
      retail: '🛍️',
      penthouse: '✨'
    };
    return icons[type] || '🏘️';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Real Estate Marketplace</h1>
          <p className="text-gray-600">Browse and select properties for settlement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 Search
                </label>
                <input
                  type="text"
                  placeholder="Address, type, parcel ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Property Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏠 Property Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  {propertyTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 Price Range
                </label>
                <div className="space-y-2">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterPriceRange[0]}
                      onChange={(e) => setFilterPriceRange([parseInt(e.target.value) || 0, filterPriceRange[1]])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterPriceRange[1]}
                      onChange={(e) => setFilterPriceRange([filterPriceRange[0], parseInt(e.target.value) || 1000000])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ${(filterPriceRange[0] / 1000).toFixed(0)}K - ${(filterPriceRange[1] / 1000).toFixed(0)}K
                </p>
              </div>

              {/* Results Count */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-indigo-600">{filteredProperties.length}</span> property/properties found
                </p>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading properties...</p>
                </div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-5xl mb-4">🏚️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map(property => (
                  <div
                    key={property.id}
                    onClick={() => onPropertySelect(property)}
                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden border-2 transition ${
                      selectedProperty?.id === property.id
                        ? 'border-indigo-600 shadow-lg'
                        : 'border-transparent hover:border-indigo-300'
                    }`}
                  >
                    {/* Property Image/Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative flex items-center justify-center">
                      <span className="text-5xl">{getPropertyIcon(property.propertyType)}</span>
                      {selectedProperty?.id === property.id && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          ✓ Selected
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      {/* Address */}
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <h3 className="font-bold text-gray-900 text-sm">{property.address}</h3>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">
                          ${(property.estimatedPrice / 1000).toFixed(0)}K
                        </span>
                      </div>

                      {/* Property Features */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Home className="w-4 h-4" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                        )}
                        {property.bathrooms > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>🚿 {property.bathrooms} bath</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Ruler className="w-4 h-4" />
                          <span>{(property.squareFeet / 1000).toFixed(1)}K sq ft</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📅 {property.yearBuilt}</span>
                        </div>
                      </div>

                      {/* Property Type & Zoning */}
                      <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                          {property.propertyType}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {property.zoning}
                        </span>
                      </div>

                      {/* Parcel ID */}
                      <div className="text-xs text-gray-500 pb-3 border-b">
                        Parcel ID: {property.parcelId}
                      </div>

                      {/* Selection Button */}
                      <button
                        onClick={() => onPropertySelect(property)}
                        className={`w-full mt-4 px-4 py-2 rounded-lg font-bold transition ${
                          selectedProperty?.id === property.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {selectedProperty?.id === property.id ? '✓ Selected' : 'Select Property'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
