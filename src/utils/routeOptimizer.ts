import { PubLocation } from '../data/debrecenPubs';

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Create distance matrix between all pubs
function createDistanceMatrix(pubs: PubLocation[]): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < pubs.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < pubs.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = calculateDistance(
          pubs[i].lat, pubs[i].lng,
          pubs[j].lat, pubs[j].lng
        );
      }
    }
  }
  return matrix;
}

// Nearest neighbor algorithm for TSP approximation
function nearestNeighborTSP(distanceMatrix: number[][]): number[] {
  const n = distanceMatrix.length;
  const visited = new Array(n).fill(false);
  const route = [0]; // Start from first pub
  visited[0] = true;
  
  for (let i = 1; i < n; i++) {
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    
    const currentPub = route[route.length - 1];
    
    for (let j = 0; j < n; j++) {
      if (!visited[j] && distanceMatrix[currentPub][j] < nearestDistance) {
        nearestDistance = distanceMatrix[currentPub][j];
        nearestIndex = j;
      }
    }
    
    if (nearestIndex !== -1) {
      route.push(nearestIndex);
      visited[nearestIndex] = true;
    }
  }
  
  return route;
}

// 2-opt improvement for better route optimization
function twoOptImprovement(route: number[], distanceMatrix: number[][]): number[] {
  const n = route.length;
  let improved = true;
  let bestRoute = [...route];
  
  while (improved) {
    improved = false;
    
    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j - i === 1) continue; // Skip adjacent edges
        
        const currentDistance = 
          distanceMatrix[bestRoute[i - 1]][bestRoute[i]] +
          distanceMatrix[bestRoute[j]][bestRoute[(j + 1) % n]];
          
        const newDistance = 
          distanceMatrix[bestRoute[i - 1]][bestRoute[j]] +
          distanceMatrix[bestRoute[i]][bestRoute[(j + 1) % n]];
        
        if (newDistance < currentDistance) {
          // Reverse the route between i and j
          const newRoute = [...bestRoute];
          for (let k = 0; k <= (j - i) / 2; k++) {
            const temp = newRoute[i + k];
            newRoute[i + k] = newRoute[j - k];
            newRoute[j - k] = temp;
          }
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }
  
  return bestRoute;
}

export interface OptimizedRoute {
  pubs: PubLocation[];
  totalDistance: number;
  estimatedWalkingTime: number; // in minutes
}

export function optimizeRoute(selectedPubs: PubLocation[]): OptimizedRoute {
  if (selectedPubs.length <= 1) {
    return {
      pubs: selectedPubs,
      totalDistance: 0,
      estimatedWalkingTime: 0
    };
  }
  
  // Create distance matrix
  const distanceMatrix = createDistanceMatrix(selectedPubs);
  
  // Get initial route using nearest neighbor
  let routeIndices = nearestNeighborTSP(distanceMatrix);
  
  // Improve route using 2-opt
  if (selectedPubs.length > 3) {
    routeIndices = twoOptImprovement(routeIndices, distanceMatrix);
  }
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < routeIndices.length - 1; i++) {
    totalDistance += distanceMatrix[routeIndices[i]][routeIndices[i + 1]];
  }
  
  // Convert back to pub objects
  const optimizedPubs = routeIndices.map(index => selectedPubs[index]);
  
  // Estimate walking time (assuming 5 km/h walking speed)
  const estimatedWalkingTime = Math.round((totalDistance / 5) * 60);
  
  return {
    pubs: optimizedPubs,
    totalDistance: Math.round(totalDistance * 1000) / 1000, // Round to 3 decimal places
    estimatedWalkingTime
  };
}