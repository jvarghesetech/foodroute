'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { SimulateResult } from '@/lib/foodroute/types';

export interface FoodBankStatsPanelData {
  id: string;
  name: string;
  demandPct: number;
  erBeds: number;
  totalBeds: number;
  phone: string;
  specialties: string[];
}

interface CongestionLayerProps {
  map: mapboxgl.Map | null;
  foodBanks: any[];
  congestion: any[];
  onFoodBankSelect?: (foodBank: FoodBankStatsPanelData | null) => void;
  simulationResult?: SimulateResult | null;
}

export default function DemandLayer({ map, foodBanks, congestion, onFoodBankSelect, simulationResult }: CongestionLayerProps) {

  useEffect(() => {
    if (!map || foodBanks.length === 0) return;

    const loadMap: Record<string, number> = {};
    for (const s of congestion) {
      loadMap[s.foodBankId] = s.demandPct;
    }

    const features = foodBanks.map((h: any) => {
      const hId = String(h._id ?? h.id);
      // Use simulation "after" demand if available, otherwise congestion data
      const pct = simulationResult?.after?.[hId] !== undefined
        ? simulationResult.after[hId]
        : (loadMap[hId] ?? 70);
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [h.longitude, h.latitude]
        },
        properties: {
          name: h.name,
          demandPct: pct,
          id: h._id ?? h.id,
          erBeds: h.erBeds ?? 0,
          totalBeds: h.totalBeds ?? 0,
          phone: h.phone ?? '',
          specialties: Array.isArray(h.specialties) ? h.specialties.join(', ') : '',
          website: h.website ?? '',
          waitMinutes: loadMap[h._id ?? h.id] ? Math.round((loadMap[h._id ?? h.id] / 100) * 180 + 30) : 60,
        }
      };
    });

    const sourceId = 'foodBank-congestion';
    const layerId = 'foodBank-circles';

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features
      });
      return;
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features }
    });

    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'demandPct'],
          0, 12,
          100, 30
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'demandPct'],
          0, '#22c55e',
          50, '#eab308',
          75, '#f97316',
          100, '#dc2626'
        ],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.addLayer({
      id: 'foodBank-labels',
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 2.5],
        'text-anchor': 'top',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#1e293b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // --- Click handler: send selected foodBank to right-side panel ---
    const handleLayerClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const props = feat.properties!;
      const demandPct = Math.round(Number(props.demandPct ?? 70));
      const specialtiesRaw = String(props.specialties ?? '');
      const specialties = specialtiesRaw
        ? specialtiesRaw.split(', ').filter(Boolean)
        : [];

      onFoodBankSelect?.({
        id: String(props.id ?? ''),
        name: String(props.name ?? 'FoodBank'),
        demandPct,
        erBeds: Number(props.erBeds ?? 0),
        totalBeds: Number(props.totalBeds ?? 0),
        phone: String(props.phone ?? ''),
        specialties,
      });
    };

    const handleMapClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: [layerId] });
      if (!hits.length) onFoodBankSelect?.(null);
    };

    map.on('click', layerId, handleLayerClick);
    map.on('click', handleMapClick);

    // --- Cursor pointer on hover ---
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      try {
        map.off('click', layerId, handleLayerClick);
        map.off('click', handleMapClick);
        if (map && map.getStyle()) {
          if (map.getLayer('foodBank-labels')) map.removeLayer('foodBank-labels');
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        }
      } catch {
        // map already removed/destroyed — nothing to clean up
      }
    };
  }, [map, foodBanks, congestion, onFoodBankSelect, simulationResult]);

  return null;
}

