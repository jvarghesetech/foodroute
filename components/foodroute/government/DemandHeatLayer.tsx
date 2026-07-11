'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import type { SimulateResult } from '@/lib/foodroute/types';

interface FoodBankTrafficHeatLayerProps {
  map: mapboxgl.Map | null;
  foodBanks: Array<{
    _id?: { toString: () => string };
    id?: string;
    latitude?: number;
    longitude?: number;
    erBeds?: number;
  }>;
  congestion: Array<{
    foodBankId: string;
    demandPct: number;
  }>;
  simulationResult?: SimulateResult | null;
  proposedLocations?: Array<{
    lat: number;
    lng: number;
    erBeds?: number;
  }>;
}

const LAYER_PREFIX = 'hosp-heat';

function getColorForDemand(occ: number): string {
  if (occ < 50) return '#eab308';   // yellow (low traffic)
  if (occ < 70) return '#f59e0b';   // amber
  if (occ < 85) return '#f97316';   // orange
  return '#dc2626';                  // red
}

function getOpacityForDemand(occ: number): number {
  if (occ < 50) return 0.06;
  if (occ < 70) return 0.10;
  if (occ < 85) return 0.16;
  return 0.20;
}

export default function FoodBankTrafficHeatLayer({
  map,
  foodBanks,
  congestion,
  simulationResult,
  proposedLocations = [],
}: FoodBankTrafficHeatLayerProps) {
  const layersRef = useRef<string[]>([]);
  const sourcesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!map || foodBanks.length === 0) return;

    function cleanup() {
      if (!map) return;
      for (const lid of layersRef.current) {
        try { if (map.getLayer(lid)) map.removeLayer(lid); } catch { /* */ }
      }
      for (const sid of sourcesRef.current) {
        try { if (map.getSource(sid)) map.removeSource(sid); } catch { /* */ }
      }
      layersRef.current = [];
      sourcesRef.current = [];
    }

    function addLayers() {
      if (!map) return;
      cleanup();

      // Build demand lookup
      const occLookup: Record<string, number> = {};
      for (const c of congestion) {
        occLookup[c.foodBankId] = c.demandPct;
      }

      // 3 concentric rings for gradient effect
      const rings = [
        { radiusFactor: 0.35, opacityFactor: 1.0 },   // inner — strongest
        { radiusFactor: 0.65, opacityFactor: 0.6 },   // middle
        { radiusFactor: 1.0,  opacityFactor: 0.3 },   // outer — faintest
      ];

      // Create per-foodBank gradient zones using multiple concentric rings
      // This creates a heat-gradient effect: intense near foodBank, fading outward
      for (let hIdx = 0; hIdx < foodBanks.length; hIdx++) {
        const h = foodBanks[hIdx];
        const lat = h.latitude;
        const lng = h.longitude;
        if (!lat || !lng) continue;

        const hId = (h._id?.toString() ?? h.id) || '';

        // Use simulation "after" demand if available, otherwise congestion data
        let occ: number;
        if (simulationResult?.after?.[hId] !== undefined) {
          occ = simulationResult.after[hId];
        } else {
          occ = occLookup[hId] ?? 70;
        }

        const color = getColorForDemand(occ);
        const baseOpacity = getOpacityForDemand(occ);

        // Radius scales with erBeds + demand
        const beds = h.erBeds ?? 30;
        const maxRadiusKm = Math.min(2, Math.max(0.8, 0.8 + (beds / 60) * 0.6 + (occ / 100) * 0.6));

        for (let rIdx = rings.length - 1; rIdx >= 0; rIdx--) {
          const ring = rings[rIdx];
          const radius = maxRadiusKm * ring.radiusFactor;
          const opacity = baseOpacity * ring.opacityFactor;

          const circle = turf.circle([lng, lat], radius, { units: 'kilometers', steps: 64 });
          const srcId = `${LAYER_PREFIX}-src-${hIdx}-${rIdx}`;
          const fillId = `${LAYER_PREFIX}-fill-${hIdx}-${rIdx}`;

          if (map.getSource(srcId)) { try { if (map.getLayer(fillId)) map.removeLayer(fillId); map.removeSource(srcId); } catch { /* */ } }
          map.addSource(srcId, { type: 'geojson', data: circle });
          sourcesRef.current.push(srcId);

          if (map.getLayer(fillId)) { try { map.removeLayer(fillId); } catch { /* */ } }
          map.addLayer({
            id: fillId,
            type: 'fill',
            source: srcId,
            paint: {
              'fill-color': color,
              'fill-opacity': opacity,
            },
          });
          layersRef.current.push(fillId);
        }
      }

      // Render circles for proposed/new buildings using simulationResult.proposedAfter
      if (simulationResult?.proposedAfter && proposedLocations.length > 0) {
        for (let pIdx = 0; pIdx < proposedLocations.length; pIdx++) {
          const p = proposedLocations[pIdx];
          const proposedKey = `proposed-${pIdx}`;
          const occ = simulationResult.proposedAfter[proposedKey] ?? 0;

          const color = getColorForDemand(occ);
          const baseOpacity = getOpacityForDemand(occ);
          const beds = p.erBeds ?? 30;
          const maxRadiusKm = Math.min(2, Math.max(0.8, 0.8 + (beds / 60) * 0.6 + (occ / 100) * 0.6));

          for (let rIdx = rings.length - 1; rIdx >= 0; rIdx--) {
            const ring = rings[rIdx];
            const radius = maxRadiusKm * ring.radiusFactor;
            const opacity = baseOpacity * ring.opacityFactor;

            const circle = turf.circle([p.lng, p.lat], radius, { units: 'kilometers', steps: 64 });
            const srcId = `${LAYER_PREFIX}-prop-src-${pIdx}-${rIdx}`;
            const fillId = `${LAYER_PREFIX}-prop-fill-${pIdx}-${rIdx}`;

            if (map.getSource(srcId)) { try { if (map.getLayer(fillId)) map.removeLayer(fillId); map.removeSource(srcId); } catch { /* */ } }
            map.addSource(srcId, { type: 'geojson', data: circle });
            sourcesRef.current.push(srcId);

            if (map.getLayer(fillId)) { try { map.removeLayer(fillId); } catch { /* */ } }
            map.addLayer({
              id: fillId,
              type: 'fill',
              source: srcId,
              paint: {
                'fill-color': color,
                'fill-opacity': opacity,
              },
            });
            layersRef.current.push(fillId);
          }
        }
      }
    }

    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.once('style.load', addLayers);
    }

    return cleanup;
  }, [map, foodBanks, congestion, simulationResult, proposedLocations]);

  return null;
}
