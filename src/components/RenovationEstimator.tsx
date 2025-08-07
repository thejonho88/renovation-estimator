import React, { useState } from "react";

interface FormData {
  type: string;
  property: string;
  zip: string;
  size: string;
  wallHeight: string;
  finish: string;
  scope: string[];
  cabinetLinearFeet: string;
  estimateType: 'Average' | 'Low' | 'High'; // New field
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

// New: Cost categories and their ranges
const COST_CATEGORIES = {
  Finishes: { low: 10, high: 30 },
  Demolition: { low: 2, high: 7 },
  Electrical: { low: 4, high: 10 },
  Plumbing: { low: 4, high: 10 },
  Appliances: { low: 3, high: 10 },
  Millwork: { low: 5, high: 20 },
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
    cabinetLinearFeet: "", // Initialize new field
    estimateType: 'Average', // Default to Average
  });
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Test div to see if component is rendering
  console.log("RenovationEstimator component is rendering");

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
    // const finish = FINISH_LEVELS[formData.finish as keyof typeof FINISH_LEVELS];
    // const type = RENOVATION_TYPES[formData.type as keyof typeof RENOVATION_TYPES];

    // Calculate areas
    const floorArea = size;
    const totalWallArea = calculateWallArea(size, wallHeight);

    // For this new model, use all categories and sum their per-sf cost
    let totalCostPerSF = 0;
    Object.values(COST_CATEGORIES).forEach(cat => {
      if (formData.estimateType === 'Low') {
        totalCostPerSF += cat.low;
      } else if (formData.estimateType === 'High') {
        totalCostPerSF += cat.high;
      } else {
        totalCostPerSF += (cat.low + cat.high) / 2;
      }
    });

    // For now, apply to floor area only (can be adjusted if needed)
    const baseCost = floorArea * totalCostPerSF;
    const laborCost = baseCost * 0.4; // Placeholder ratio
    const materialCost = baseCost * 0.6; // Placeholder ratio

    // Scope adjustments (keep as before)
    const scopeAdjustments = formData.scope.reduce((total: number, item: string) => {
      const scopeItem = SCOPE_ITEMS[item as keyof typeof SCOPE_ITEMS];
      return total + (baseCost * scopeItem.costMultiplier);
    }, 0);

    // Location multiplier (simplified)
    const locationMultiplier = 1.0;

    const totalLow = (baseCost + scopeAdjustments) * locationMultiplier * 0.9;
    const totalHigh = (baseCost + scopeAdjustments) * locationMultiplier * 1.1;

    setCostBreakdown({
      baseCost,
      scopeAdjustments,
      locationMultiplier,
      totalLow,
      totalHigh,
      wallArea: totalWallArea,
      floorArea: floorArea,
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
    <div className="min-h-screen bg-gray-900 py-8">
      {/* Test element to see if component is rendering */}
      <div style={{color: 'white', padding: '20px', textAlign: 'center'}}>
        <h1>Renovation Estimator is Loading...</h1>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Content */}
        <div>
          {/* Top Disclaimer */}
          <div className="bg-gray-800 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-200 font-mono">
                  This calculator is used for educational purposes only. Please verify costs with local contractor.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Renovation Cost Estimator</h1>
            <p className="text-gray-300">Get an accurate estimate for your renovation project</p>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gray-700 px-6 py-4">
              <div className="flex justify-center items-center">
                <div className="flex items-center">
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Project Details */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                  <span className="ml-2 text-white font-medium text-lg">Project Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">What are you renovating?</label>
                    <select
                      className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.type ? 'border-red-500' : 'border-gray-600'
                      }`}
                      value={formData.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                    >
                      <option value="">Select type</option>
                      {Object.keys(RENOVATION_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Property Type</label>
                    <select
                      className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.property ? 'border-red-500' : 'border-gray-600'
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
                    {errors.property && <p className="text-red-400 text-sm mt-1">{errors.property}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Zip Code</label>
                    <input
                      type="text"
                      className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                        errors.zip ? 'border-red-500' : 'border-gray-600'
                      }`}
                      value={formData.zip}
                      onChange={(e) => handleChange("zip", e.target.value)}
                      placeholder="Enter zip code"
                    />
                    {errors.zip && <p className="text-red-400 text-sm mt-1">{errors.zip}</p>}
                  </div>
                </div>
              </div>

              {/* Specifications Section Header */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                  <span className="ml-2 text-white font-medium text-lg">Specifications</span>
                </div>

                {/* New: Estimate Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estimate Type</label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.estimateType}
                    onChange={e => handleChange('estimateType', e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Average">Average</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Renovation Area (SF)</label>
                    <input
                      type="number"
                      className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                        errors.size ? 'border-red-500' : 'border-gray-600'
                      }`}
                      value={formData.size}
                      onChange={(e) => handleChange("size", e.target.value)}
                      placeholder="Enter square footage"
                    />
                    {errors.size && <p className="text-red-400 text-sm mt-1">{errors.size}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Wall Height (feet)</label>
                    <input
                      type="number"
                      className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                        errors.wallHeight ? 'border-red-500' : 'border-gray-600'
                      }`}
                      value={formData.wallHeight}
                      onChange={(e) => handleChange("wallHeight", e.target.value)}
                      placeholder="Enter wall height"
                    />
                    {errors.wallHeight && <p className="text-red-400 text-sm mt-1">{errors.wallHeight}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Finish Level</label>
                    <select
                      className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.finish ? 'border-red-500' : 'border-gray-600'
                      }`}
                      value={formData.finish}
                      onChange={(e) => handleChange("finish", e.target.value)}
                    >
                      <option value="">Select finish</option>
                      {Object.keys(FINISH_LEVELS).map(finish => (
                        <option key={finish} value={finish}>{finish}</option>
                      ))}
                    </select>
                    {errors.finish && <p className="text-red-400 text-sm mt-1">{errors.finish}</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Scope of Work</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(SCOPE_ITEMS).map(([item, details]) => (
                      <div
                        key={item}
                        className={`relative group ${
                          formData.scope.includes(item)
                            ? 'bg-gray-700 border-blue-500'
                            : 'border-gray-600 hover:bg-gray-700'
                        } border rounded-lg p-3 cursor-pointer transition-colors`}
                        onClick={() => toggleScope(item)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.scope.includes(item)}
                            onChange={() => {}}
                            className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 text-sm text-gray-200">{item}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
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

              {/* Add cabinet linear feet input when Kitchen is selected */}
              {formData.type === 'Kitchen' && (
                <div className="p-6 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Cabinet Linear Feet (Optional)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        value={formData.cabinetLinearFeet}
                        onChange={(e) => handleChange("cabinetLinearFeet", e.target.value)}
                        placeholder="Enter cabinet linear feet"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Leave blank to use calculated value based on room size
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculate Button */}
              <button
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                onClick={estimateCosts}
              >
                Calculate Estimate
              </button>

              {/* Results */}
              {costBreakdown && (
                <div className="bg-gray-700 rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Floor Area</span>
                      <span className="font-mono font-medium text-white">{costBreakdown.floorArea.toLocaleString()} SF</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Wall Area</span>
                      <span className="font-mono font-medium text-white">{costBreakdown.wallArea.toLocaleString()} SF</span>
                    </div>
                    {formData.type === 'Kitchen' && (
                      <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-300">IKEA Cabinetry (Linear Ft)</span>
                        <span className="font-mono font-medium text-white">
                          {formData.cabinetLinearFeet 
                            ? formData.cabinetLinearFeet 
                            : Math.sqrt(Number(formData.size)) * 2} LF
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Base Cost</span>
                      <span className="font-mono font-medium text-white">${costBreakdown.baseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Labor Cost</span>
                      <span className="font-mono font-medium text-white">${costBreakdown.laborCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Material Cost</span>
                      <span className="font-mono font-medium text-white">${costBreakdown.materialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Scope Adjustments</span>
                      <span className="font-mono font-medium text-white">${costBreakdown.scopeAdjustments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">Location Factor</span>
                      <span className="font-mono font-medium text-white">x{costBreakdown.locationMultiplier}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-4 mt-4">
                      <div className="flex justify-between items-center p-3 bg-blue-600 rounded-lg">
                        <span className="text-white font-semibold">Estimated Range</span>
                        <span className="font-mono text-white font-bold text-lg">
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
    </div>
  );
} 