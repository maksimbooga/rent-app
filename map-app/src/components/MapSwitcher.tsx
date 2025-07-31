import React, { useState } from 'react';
import Map from './Map';
import PolygonIssues from './PolygonIssues';

const MapSwitcher: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'issues'>('main');

  return (
    <div className="relative w-full h-screen">
      {currentView === 'main' ? <Map /> : <PolygonIssues />}
      
      {/* Панель переключения */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('main')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentView === 'main'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Основная карта
          </button>
          <button
            onClick={() => setCurrentView('issues')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentView === 'issues'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Проблемы полигонов
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSwitcher;