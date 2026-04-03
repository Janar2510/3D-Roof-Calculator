import * as THREE from 'three';
import { RoofDimensions, RoofType } from '../types';

export function createRoofGeometry(type: RoofType, dims: RoofDimensions): THREE.BufferGeometry {
  const { width, length, pitch, overhang } = dims;
  const rad = (pitch * Math.PI) / 180;
  const height = (width / 2) * Math.tan(rad);

  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];

  // Base footprint (for reference or floor)
  // We'll just build the roof planes

  if (type === 'gable') {
    // Two rectangular planes
    const halfW = width / 2;
    const halfL = length / 2;
    
    // Left Plane
    // Top Ridge: (0, height, -halfL) to (0, height, halfL)
    // Bottom Edge: (-halfW - overhang, 0, -halfL - overhang) to (-halfW - overhang, 0, halfL + overhang)
    
    // Triangle 1 (Left side)
    vertices.push(0, height, -halfL);
    vertices.push(-halfW - overhang, 0, -halfL - overhang);
    vertices.push(-halfW - overhang, 0, halfL + overhang);
    
    // Triangle 2 (Left side)
    vertices.push(0, height, -halfL);
    vertices.push(-halfW - overhang, 0, halfL + overhang);
    vertices.push(0, height, halfL);

    // Right Plane
    vertices.push(0, height, -halfL);
    vertices.push(halfW + overhang, 0, halfL + overhang);
    vertices.push(halfW + overhang, 0, -halfL - overhang);

    vertices.push(0, height, -halfL);
    vertices.push(0, height, halfL);
    vertices.push(halfW + overhang, 0, halfL + overhang);

  } else if (type === 'hip') {
    const halfW = width / 2;
    const halfL = length / 2;
    const peakOffset = Math.min(halfW, halfL) * 0.8; // Simple hip peak

    // Hip is more complex. Let's simplify: 4 triangles meeting at a ridge
    // Ridge length = length - width (if length > width)
    const ridgeHalfL = Math.max(0, halfL - halfW);

    // Front Triangle
    vertices.push(0, height, ridgeHalfL);
    vertices.push(-halfW - overhang, 0, halfL + overhang);
    vertices.push(halfW + overhang, 0, halfL + overhang);

    // Back Triangle
    vertices.push(0, height, -ridgeHalfL);
    vertices.push(halfW + overhang, 0, -halfL - overhang);
    vertices.push(-halfW - overhang, 0, -halfL - overhang);

    // Left Side (Trapezoid or Triangle)
    vertices.push(0, height, ridgeHalfL);
    vertices.push(-halfW - overhang, 0, -halfL - overhang);
    vertices.push(-halfW - overhang, 0, halfL + overhang);
    
    if (ridgeHalfL > 0) {
      vertices.push(0, height, ridgeHalfL);
      vertices.push(0, height, -ridgeHalfL);
      vertices.push(-halfW - overhang, 0, -halfL - overhang);
    }

    // Right Side
    vertices.push(0, height, ridgeHalfL);
    vertices.push(halfW + overhang, 0, halfL + overhang);
    vertices.push(halfW + overhang, 0, -halfL - overhang);

    if (ridgeHalfL > 0) {
      vertices.push(0, height, ridgeHalfL);
      vertices.push(halfW + overhang, 0, -halfL - overhang);
      vertices.push(0, height, -ridgeHalfL);
    }

  } else if (type === 'shed') {
    const halfW = width / 2;
    const halfL = length / 2;
    const shedHeight = width * Math.tan(rad);

    // Single plane
    vertices.push(-halfW - overhang, shedHeight, -halfL - overhang);
    vertices.push(-halfW - overhang, shedHeight, halfL + overhang);
    vertices.push(halfW + overhang, 0, halfL + overhang);

    vertices.push(-halfW - overhang, shedHeight, -halfL - overhang);
    vertices.push(halfW + overhang, 0, halfL + overhang);
    vertices.push(halfW + overhang, 0, -halfL - overhang);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function calculateRoofArea(type: RoofType, dims: RoofDimensions): number {
  const { width, length, pitch, overhang } = dims;
  const rad = (pitch * Math.PI) / 180;
  const cosPitch = Math.cos(rad);
  
  // Basic footprint area with overhang
  const totalW = width + 2 * overhang;
  const totalL = length + 2 * overhang;
  const footprintArea = totalW * totalL;

  if (type === 'shed' || type === 'gable' || type === 'hip') {
    // For these types, the surface area is roughly footprint / cos(pitch)
    // This is exact for shed and gable. For hip it's also true if all pitches are same.
    return footprintArea / cosPitch;
  }
  
  return footprintArea; // Fallback
}
