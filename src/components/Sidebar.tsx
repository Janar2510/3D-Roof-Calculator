import React from 'react';
import { RoofDimensions, RoofType, MATERIALS, RoofMaterial, LightSettings } from '../types';
import { cn } from '../lib/utils';
import { Home, Ruler, Layers, DollarSign, Sun } from 'lucide-react';

interface SidebarProps {
  type: RoofType;
  setType: (type: RoofType) => void;
  dims: RoofDimensions;
  setDims: (dims: RoofDimensions) => void;
  material: RoofMaterial;
  setMaterial: (mat: RoofMaterial) => void;
  lightSettings: LightSettings;
  setLightSettings: (settings: LightSettings) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  type, setType, dims, setDims, material, setMaterial, lightSettings, setLightSettings 
}) => {
  const roofTypes: { id: RoofType; label: string; image: string }[] = [
    { 
      id: 'gable', 
      label: 'Gable', 
      image: 'https://picsum.photos/seed/gable-roof/200/150' 
    },
    { 
      id: 'hip', 
      label: 'Hip', 
      image: 'https://picsum.photos/seed/hip-roof/200/150' 
    },
    { 
      id: 'shed', 
      label: 'Shed', 
      image: 'https://picsum.photos/seed/shed-roof/200/150' 
    },
  ];

  const handleDimChange = (key: keyof RoofDimensions, value: number) => {
    setDims({ ...dims, [key]: value });
  };

  const handleLightChange = (key: keyof LightSettings, value: number) => {
    setLightSettings({ ...lightSettings, [key]: value });
  };

  return (
    <div className="w-full lg:w-96 h-full bg-white border-r border-slate-200 flex flex-col overflow-y-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-600" />
          RoofCraft 3D
        </h1>
        <p className="text-sm text-slate-500 mt-1">Real-time roof visualization & calculator</p>
      </div>

      {/* Roof Type Selection */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          Roof Type
        </label>
        <div className="grid grid-cols-1 gap-3">
          {roofTypes.map((rt) => (
            <button
              key={rt.id}
              onClick={() => setType(rt.id)}
              className={cn(
                "group relative flex items-center gap-4 p-3 rounded-xl transition-all border text-left overflow-hidden",
                type === rt.id
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-200"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                <img 
                  src={rt.image} 
                  alt={rt.label} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="font-bold">{rt.label}</div>
                <div className="text-xs text-slate-400">Classic {rt.label.toLowerCase()} design</div>
              </div>
              {type === rt.id && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Dimensions */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Ruler className="w-4 h-4" />
          Dimensions (ft)
        </label>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Width</span>
              <span className="text-xs font-mono text-slate-700">{dims.width} ft</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={dims.width}
              onChange={(e) => handleDimChange('width', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Length</span>
              <span className="text-xs font-mono text-slate-700">{dims.length} ft</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={dims.length}
              onChange={(e) => handleDimChange('length', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Pitch (°)</span>
              <span className="text-xs font-mono text-slate-700">{dims.pitch}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={dims.pitch}
              onChange={(e) => handleDimChange('pitch', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Overhang (ft)</span>
              <span className="text-xs font-mono text-slate-700">{dims.overhang} ft</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={dims.overhang}
              onChange={(e) => handleDimChange('overhang', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Lighting Controls */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Sun className="w-4 h-4" />
          Lighting
        </label>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Ambient Light</span>
              <span className="text-xs font-mono text-slate-700">{lightSettings.ambientIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={lightSettings.ambientIntensity}
              onChange={(e) => handleLightChange('ambientIntensity', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-500">Directional Light</span>
              <span className="text-xs font-mono text-slate-700">{lightSettings.directionalIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={lightSettings.directionalIntensity}
              onChange={(e) => handleLightChange('directionalIntensity', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Material Selection */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          Material
        </label>
        <div className="space-y-2">
          {MATERIALS.map((mat) => (
            <button
              key={mat.name}
              onClick={() => setMaterial(mat)}
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-medium rounded-xl transition-all border flex justify-between items-center",
                material.name === mat.name
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span>{mat.name}</span>
              <span className="text-xs text-slate-400 font-mono">${mat.costPerSqFt}/sqft</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
