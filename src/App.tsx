import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import RoofVisualizer from './components/RoofVisualizer';
import { RoofDimensions, RoofType, MATERIALS, RoofMaterial, LightSettings } from './types';
import { calculateRoofArea } from './lib/roof-math';
import { Calculator, Zap, Info, TrendingUp } from 'lucide-react';

export default function App() {
  const [type, setType] = useState<RoofType>('gable');
  const [dims, setDims] = useState<RoofDimensions>({
    width: 30,
    length: 40,
    pitch: 20,
    overhang: 1.5,
  });
  const [material, setMaterial] = useState<RoofMaterial>(MATERIALS[0]);
  const [lightSettings, setLightSettings] = useState<LightSettings>({
    ambientIntensity: 0.7,
    directionalIntensity: 1.2,
  });

  const stats = useMemo(() => {
    const area = calculateRoofArea(type, dims);
    const totalCost = area * material.costPerSqFt;
    const totalWeight = area * material.weightPerSqFt;
    const squares = Math.ceil(area / 100); // 1 square = 100 sq ft

    return {
      area: Math.round(area),
      totalCost: Math.round(totalCost),
      totalWeight: Math.round(totalWeight),
      squares,
    };
  }, [type, dims, material]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Controls */}
      <Sidebar
        type={type}
        setType={setType}
        dims={dims}
        setDims={setDims}
        material={material}
        setMaterial={setMaterial}
        lightSettings={lightSettings}
        setLightSettings={setLightSettings}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Surface Area"
            value={`${stats.area} sq ft`}
            icon={<Calculator className="w-4 h-4 text-blue-500" />}
            subtext={`${stats.squares} Squares`}
          />
          <StatCard
            label="Estimated Cost"
            value={`$${stats.totalCost.toLocaleString()}`}
            icon={<TrendingUp className="w-4 h-4 text-green-500" />}
            subtext={`Incl. ${material.name}`}
          />
          <StatCard
            label="Total Weight"
            value={`${stats.totalWeight.toLocaleString()} lbs`}
            icon={<Zap className="w-4 h-4 text-amber-500" />}
            subtext="Structural Load"
          />
          <StatCard
            label="Roof Pitch"
            value={`${dims.pitch}°`}
            icon={<Info className="w-4 h-4 text-indigo-500" />}
            subtext="Slope Angle"
          />
        </div>

        {/* 3D Visualizer Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 relative min-h-[400px]">
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live 3D Preview
          </div>
          <RoofVisualizer type={type} dims={dims} lightSettings={lightSettings} />
        </div>

        {/* Footer Info */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold">Ready to build?</h3>
            <p className="text-blue-100 text-sm">Download your full report and material list for this {type} roof.</p>
          </div>
          <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Export Report (PDF)
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, subtext }: { label: string; value: string; icon: React.ReactNode; subtext: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-1">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 font-medium">{subtext}</div>
    </div>
  );
}
