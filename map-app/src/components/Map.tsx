import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Building {
  id: string;
  name: string;
  coordinates: [number, number][];
  properties: {
    address: string;
    type: string;
  };
}

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const buildings: Building[] = [
    {
      id: 'building-1',
      name: 'Жилой дом №1',
      coordinates: [
        [37.6173, 55.7558],
        [37.6175, 55.7558],
        [37.6175, 55.7556],
        [37.6173, 55.7556],
        [37.6173, 55.7558]
      ],
      properties: {
        address: 'ул. Тверская, 1',
        type: 'жилой'
      }
    },
    {
      id: 'building-2',
      name: 'Офисное здание №2',
      coordinates: [
        [37.6178, 55.7558],
        [37.6180, 55.7558],
        [37.6180, 55.7556],
        [37.6178, 55.7556],
        [37.6178, 55.7558]
      ],
      properties: {
        address: 'ул. Тверская, 2',
        type: 'офис'
      }
    },
    {
      id: 'building-3',
      name: 'Торговый центр №3',
      coordinates: [
        [37.6173, 55.7554],
        [37.6177, 55.7554],
        [37.6177, 55.7552],
        [37.6173, 55.7552],
        [37.6173, 55.7554]
      ],
      properties: {
        address: 'ул. Тверская, 3',
        type: 'торговый'
      }
    }
  ];

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
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

      map.current.addSource('buildings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: buildings.map(building => ({
            type: 'Feature',
            id: building.id,
            geometry: {
              type: 'Polygon',
              coordinates: [building.coordinates]
            },
            properties: {
              name: building.name,
              address: building.properties.address,
              type: building.properties.type
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'buildings-fill',
        type: 'fill',
        source: 'buildings',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'type'], 'жилой'], '#4299e1',
            ['==', ['get', 'type'], 'офис'], '#48bb78',
            ['==', ['get', 'type'], 'торговый'], '#ed8936',
            '#718096'
          ],
          'fill-opacity': 0.7
        }
      });

      map.current.addLayer({
        id: 'buildings-border',
        type: 'line',
        source: 'buildings',
        paint: {
          'line-color': '#2d3748',
          'line-width': 2
        }
      });

      map.current.addLayer({
        id: 'buildings-highlight',
        type: 'fill',
        source: 'buildings',
        paint: {
          'fill-color': '#f56565',
          'fill-opacity': 0.8
        },
        filter: ['==', ['get', 'id'], '']
      });

      map.current.on('click', 'buildings-fill', (e) => {
        if (e.features && e.features[0]) {
          const buildingId = e.features[0].id as string;
          setSelectedBuilding(buildingId);

          if (map.current) {
            map.current.setFilter('buildings-highlight', ['==', ['get', 'id'], buildingId]);
          }
        }
      });

      map.current.on('mouseenter', 'buildings-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'buildings-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const clearSelection = () => {
    setSelectedBuilding(null);
    if (map.current) {
      map.current.setFilter('buildings-highlight', ['==', ['get', 'id'], '']);
    }
  };

  const selectedBuildingData = buildings.find(b => b.id === selectedBuilding);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h2 className="text-lg font-bold mb-2">Интерактивная карта зданий</h2>
        <p className="text-sm text-gray-600 mb-4">
          Кликните на здание на карте для получения информации
        </p>

        {selectedBuildingData ? (
          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-semibold text-blue-900">{selectedBuildingData.name}</h3>
            <p className="text-sm text-blue-700">Адрес: {selectedBuildingData.properties.address}</p>
            <p className="text-sm text-blue-700">Тип: {selectedBuildingData.properties.type}</p>
            <button
              onClick={clearSelection}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Очистить выбор
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Выберите здание на карте</p>
        )}
      </div>
    </div>
  );
};

export default Map;
