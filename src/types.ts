export type RoofType = 'gable' | 'hip' | 'shed' | 'gambrel';

export interface RoofDimensions {
  width: number;
  length: number;
  pitch: number; // in degrees or ratio? Let's use degrees for now
  overhang: number;
}

export interface RoofMaterial {
  name: string;
  costPerSqFt: number;
  weightPerSqFt: number;
}

export interface LightSettings {
  ambientIntensity: number;
  directionalIntensity: number;
}

export const MATERIALS: RoofMaterial[] = [
  { name: 'Asphalt Shingles', costPerSqFt: 4.5, weightPerSqFt: 2.5 },
  { name: 'Metal Panels', costPerSqFt: 9.0, weightPerSqFt: 1.5 },
  { name: 'Clay Tiles', costPerSqFt: 15.0, weightPerSqFt: 10.0 },
  { name: 'Slate', costPerSqFt: 25.0, weightPerSqFt: 12.0 },
];
