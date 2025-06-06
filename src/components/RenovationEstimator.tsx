import React, { useState } from "react";

interface FormData {
  type: string;
  property: string;
  zip: string;
  size: string;
  wallHeight: string;
  finish: string;
  scope: string[];
}

interface CostBreakdown {
  baseCost: number;
  scopeAdjustments: number;
  locationMultiplier: number;
  totalLow: number;
  totalHigh: number;
  wallArea: number;
  floorArea: number;
  laborCost: number;
  materialCost: number;
}

const RENOVATION_TYPES = {
  Kitchen: { 
    baseMultiplier: 1.2,
    wallAreaMultiplier: 0.7,
    floorAreaMultiplier: 1.0,
    laborRatio: 0.4,
    ikeaBaseCost: 200, // Base cost per linear foot for IKEA cabinets
    cabinetAreaRatio: 0.6 // 60% of wall area typically covered by cabinets
  },
  Bathroom: { 
    baseMultiplier: 1.1,
    wallAreaMultiplier: 0.8, // Bathroom walls often have fixtures and tiles
    floorAreaMultiplier: 1.0,
    laborRatio: 0.45 // 45% labor, 55% materials
  },
  "Whole Interior": { 
    baseMultiplier: 1.0,
    wallAreaMultiplier: 1.0,
    floorAreaMultiplier: 1.0,
    laborRatio: 0.35 // 35% labor, 65% materials
  },
  Flooring: { 
    baseMultiplier: 0.8,
    wallAreaMultiplier: 0.0, // Flooring doesn't use wall area
    floorAreaMultiplier: 1.0,
    laborRatio: 0.3 // 30% labor, 70% materials
  },
  Painting: { 
    baseMultiplier: 0.6,
    wallAreaMultiplier: 1.0,
    floorAreaMultiplier: 0.0, // Painting doesn't use floor area
    laborRatio: 0.5 // 50% labor, 50% materials
  },
  Other: { 
    baseMultiplier: 1.0,
    wallAreaMultiplier: 0.5, // Default to half wall area for other types
    floorAreaMultiplier: 1.0,
    laborRatio: 0.4 // 40% labor, 60% materials
  },
} as const;

const FINISH_LEVELS = {
  Budget: { 
    multiplier: 1.0, 
    baseCostPerSF: 100,
    ikeaMultiplier: 1.0 // Standard IKEA cabinets
  },
  "Mid-range": { 
    multiplier: 1.5, 
    baseCostPerSF: 200,
    ikeaMultiplier: 1.3 // IKEA cabinets with upgrades
  },
  "High-end / Luxury": { 
    multiplier: 2.5, 
    baseCostPerSF: 350,
    ikeaMultiplier: 1.8 // IKEA cabinets with premium upgrades
  },
} as const;

const SCOPE_ITEMS = {
  Demolition: { 
    costMultiplier: 0.1,
    description: "Removal of existing cabinetry, wall removal or openings, electrical outlets, plumbing lines, and lights."
  },
  Plumbing: { 
    costMultiplier: 0.15,
    description: "Water lines, sink relocation, and gas line modifications."
  },
  Electrical: { 
    costMultiplier: 0.12,
    description: "Electrical work including lighting, electrical outlets, and panels (if required)."
  },
  Millwork: { 
    costMultiplier: 0.2,
    description: "Cabinetry and built-ins, including custom or off-the-shelf options."
  },
  "Appliance Install": { 
    costMultiplier: 0.1,
    description: "Installation of new appliances including refrigerator, range, dishwasher, and other kitchen equipment."
  },
  "Permits/Design": { 
    costMultiplier: 0.08,
    description: "Permits required by local jurisdiction/building codes. Check with your architect before beginning work."
  }
} as const;

export default function RenovationEstimator() {
  const [formData, setFormData] = useState<FormData>({
    type: "",
    property: "",
    zip: "",
    size: "",
    wallHeight: "8", // Default to standard 8-foot ceiling
    finish: "",
    scope: [],
  });
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.type) newErrors.type = "Please select a renovation type";
    if (!formData.property) newErrors.property = "Please select a property type";
    if (!formData.zip) newErrors.zip = "Please enter a zip code";
    if (!formData.size) newErrors.size = "Please enter the area size";
    if (!formData.wallHeight) newErrors.wallHeight = "Please enter wall height";
    if (!formData.finish) newErrors.finish = "Please select a finish level";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateWallArea = (floorArea: number, wallHeight: number): number => {
    // Assuming a rectangular room, calculate wall area
    // For a square room: 4 walls * height * sqrt(area)
    const wallLength = Math.sqrt(floorArea) * 4; // Perimeter of the room
    return wallLength * wallHeight;
  };

  const estimateCosts = () => {
    if (!validateForm()) return;

    const size = Number(formData.size);
    const wallHeight = Number(formData.wallHeight);
    const finish = FINISH_LEVELS[formData.finish as keyof typeof FINISH_LEVELS];
    const type = RENOVATION_TYPES[formData.type as keyof typeof RENOVATION_TYPES];
    
    // Calculate areas
    const floorArea = size;
    const totalWallArea = calculateWallArea(size, wallHeight);
    
    // Apply type-specific multipliers
    const effectiveWallArea = totalWallArea * type.wallAreaMultiplier;
    const effectiveFloorArea = floorArea * type.floorAreaMultiplier;
    
    let baseCost: number;
    let laborCost: number;
    let materialCost: number;

    // Special calculation for kitchen with IKEA cabinets
    if (formData.type === 'Kitchen') {
      // Calculate cabinet area (linear feet)
      const cabinetLength = Math.sqrt(size) * 2; // Assuming square kitchen, perimeter for cabinets
      const ikeaCabinetCost = cabinetLength * (type as typeof RENOVATION_TYPES['Kitchen']).ikeaBaseCost * finish.ikeaMultiplier;
      
      // Calculate other material costs (excluding cabinets)
      const otherMaterialCost = (effectiveWallArea + effectiveFloorArea) * finish.baseCostPerSF * type.baseMultiplier * 0.4;
      
      // Total material cost
      materialCost = ikeaCabinetCost + otherMaterialCost;
      
      // Labor cost (40% of total)
      laborCost = (materialCost / 0.6) * 0.4;
      
      // Base cost is sum of labor and materials
      baseCost = laborCost + materialCost;
    } else {
      // Original calculation for other renovation types
      baseCost = (effectiveWallArea + effectiveFloorArea) * finish.baseCostPerSF * type.baseMultiplier;
      laborCost = baseCost * type.laborRatio;
      materialCost = baseCost * (1 - type.laborRatio);
    }
    
    // Scope adjustments
    const scopeAdjustments = formData.scope.reduce((total: number, item: string) => {
      const scopeItem = SCOPE_ITEMS[item as keyof typeof SCOPE_ITEMS];
      return total + (baseCost * scopeItem.costMultiplier);
    }, 0);
    
    // Location multiplier (simplified - could be enhanced with actual zip code data)
    const locationMultiplier = 1.0; // Default to 1.0, could be adjusted based on zip code
    
    const totalLow = (baseCost + scopeAdjustments) * locationMultiplier * 0.9;
    const totalHigh = (baseCost + scopeAdjustments) * locationMultiplier * 1.1;
    
    setCostBreakdown({
      baseCost,
      scopeAdjustments,
      locationMultiplier,
      totalLow,
      totalHigh,
      wallArea: effectiveWallArea,
      floorArea: effectiveFloorArea,
      laborCost,
      materialCost
    });
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleScope = (item: string) => {
    const updated = formData.scope.includes(item)
      ? formData.scope.filter(i => i !== item)
      : [...formData.scope, item];
    handleChange("scope", updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Renovation Cost Estimator</h1>
          <p className="text-gray-600">Get an accurate estimate for your renovation project</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <span className="ml-2 text-white font-medium">Project Details</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-blue-500"></div>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <span className="ml-2 text-white font-medium">Specifications</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Step 1: Project Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What are you renovating?</label>
                  <select
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="">Select type</option>
                    {Object.keys(RENOVATION_TYPES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.property ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.property}
                    onChange={(e) => handleChange("property", e.target.value)}
                  >
                    <option value="">Select property</option>
                    <option>Apartment</option>
                    <option>Condo</option>
                    <option>Single-family home</option>
                    <option>Multi-family</option>
                  </select>
                  {errors.property && <p className="text-red-500 text-sm mt-1">{errors.property}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                      errors.zip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                    placeholder="Enter zip code"
                  />
                  {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Project Specifications */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renovation Area (SF)</label>
                  <input
                    type="number"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                      errors.size ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.size}
                    onChange={(e) => handleChange("size", e.target.value)}
                    placeholder="Enter square footage"
                  />
                  {errors.size && <p className="text-red-500 text-sm mt-1">{errors.size}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wall Height (feet)</label>
                  <input
                    type="number"
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                      errors.wallHeight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.wallHeight}
                    onChange={(e) => handleChange("wallHeight", e.target.value)}
                    placeholder="Enter wall height"
                  />
                  {errors.wallHeight && <p className="text-red-500 text-sm mt-1">{errors.wallHeight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finish Level</label>
                  <select
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.finish ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.finish}
                    onChange={(e) => handleChange("finish", e.target.value)}
                  >
                    <option value="">Select finish</option>
                    {Object.keys(FINISH_LEVELS).map(finish => (
                      <option key={finish} value={finish}>{finish}</option>
                    ))}
                  </select>
                  {errors.finish && <p className="text-red-500 text-sm mt-1">{errors.finish}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope of Work</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(SCOPE_ITEMS).map(([item, details]) => (
                    <div
                      key={item}
                      className={`relative group ${
                        formData.scope.includes(item)
                          ? 'bg-blue-50 border-blue-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      } border rounded-lg p-3 cursor-pointer transition-colors`}
                      onClick={() => toggleScope(item)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.scope.includes(item)}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{item}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {details.description}
                      </div>
                      <div className="absolute right-2 top-2 text-xs text-gray-400">
                        +{(details.costMultiplier * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={estimateCosts}
            >
              Calculate Estimate
            </button>

            {/* Results */}
            {costBreakdown && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Floor Area</span>
                    <span className="font-mono font-medium">{costBreakdown.floorArea.toLocaleString()} SF</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Wall Area</span>
                    <span className="font-mono font-medium">{costBreakdown.wallArea.toLocaleString()} SF</span>
                  </div>
                  {formData.type === 'Kitchen' && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">IKEA Cabinetry (Est. Linear Ft)</span>
                      <span className="font-mono font-medium">{Math.sqrt(Number(formData.size)) * 2} LF</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Base Cost</span>
                    <span className="font-mono font-medium">${costBreakdown.baseCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Labor Cost</span>
                    <span className="font-mono font-medium">${costBreakdown.laborCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Material Cost</span>
                    <span className="font-mono font-medium">${costBreakdown.materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Scope Adjustments</span>
                    <span className="font-mono font-medium">${costBreakdown.scopeAdjustments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Location Factor</span>
                    <span className="font-mono font-medium">x{costBreakdown.locationMultiplier}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-900 font-semibold">Estimated Range</span>
                      <span className="font-mono text-blue-600 font-bold text-lg">
                        ${costBreakdown.totalLow.toLocaleString()} – ${costBreakdown.totalHigh.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 