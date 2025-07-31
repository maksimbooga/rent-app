import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const PolygonIssues: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [37.6173, 55.7558],
      zoom: 16
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Проблема 1: Сложный полигон с отверстиями
      map.current.addSource('complex-polygon', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              // Внешний контур
              [
                [37.6170, 55.7560],
                [37.6180, 55.7560],
                [37.6180, 55.7550],
                [37.6170, 55.7550],
                [37.6170, 55.7560]
              ],
              // Отверстие (внутренний контур)
              [
                [37.6172, 55.7558],
                [37.6178, 55.7558],
                [37.6178, 55.7552],
                [37.6172, 55.7552],
                [37.6172, 55.7558]
              ]
            ]
          },
          properties: {
            name: 'Сложный полигон с отверстием'
          }
        }
      });

      map.current.addLayer({
        id: 'complex-polygon-fill',
        type: 'fill',
        source: 'complex-polygon',
        paint: {
          'fill-color': '#e53e3e',
          'fill-opacity': 0.5
        }
      });

      // Проблема 2: Множественные полигоны с перекрытием
      map.current.addSource('overlapping-polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [37.6165, 55.7558],
                  [37.6175, 55.7558],
                  [37.6175, 55.7548],
                  [37.6165, 55.7548],
                  [37.6165, 55.7558]
                ]]
              },
              properties: { name: 'Полигон 1', zIndex: 1 }
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [37.6170, 55.7555],
                  [37.6180, 55.7555],
                  [37.6180, 55.7545],
                  [37.6170, 55.7545],
                  [37.6170, 55.7555]
                ]]
              },
              properties: { name: 'Полигон 2', zIndex: 2 }
            }
          ]
        }
      });

      map.current.addLayer({
        id: 'overlapping-polygons-fill',
        type: 'fill',
        source: 'overlapping-polygons',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'zIndex'], 1], '#4299e1',
            ['==', ['get', 'zIndex'], 2], '#48bb78',
            '#718096'
          ],
          'fill-opacity': 0.7
        }
      });

      // Проблема 3: Полигон с самопересечением
      map.current.addSource('self-intersecting', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [37.6160, 55.7540],
              [37.6170, 55.7540],
              [37.6165, 55.7535],
              [37.6175, 55.7545],
              [37.6165, 55.7545],
              [37.6160, 55.7540]
            ]]
          },
          properties: {
            name: 'Полигон с самопересечением'
          }
        }
      });

      map.current.addLayer({
        id: 'self-intersecting-fill',
        type: 'fill',
        source: 'self-intersecting',
        paint: {
          'fill-color': '#ed8936',
          'fill-opacity': 0.6
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Панель с описанием проблем */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-md">
        <h3 className="text-lg font-bold mb-2 text-red-600">Проблемы с полигонами:</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-red-50 p-2 rounded">
            <h4 className="font-semibold text-red-800">1. Сложные полигоны с отверстиями</h4>
            <p className="text-red-700">Трудности с правильным отображением и обработкой кликов</p>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <h4 className="font-semibold text-yellow-800">2. Перекрывающиеся полигоны</h4>
            <p className="text-yellow-700">Проблемы с z-index и определением активного элемента</p>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <h4 className="font-semibold text-orange-800">3. Самопересекающиеся полигоны</h4>
            <p className="text-orange-700">Непредсказуемое поведение при рендеринге</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolygonIssues;