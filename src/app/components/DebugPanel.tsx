import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/api';
import { X } from 'lucide-react';
import { Button } from './ui/button';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    adminToken: '',
    adminUser: '',
    apiToken: '',
    timestamp: ''
  });

  const updateDebugInfo = () => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    const apiToken = getAuthToken();

    setDebugInfo({
      adminToken: adminToken ? adminToken.substring(0, 40) + '...' : 'NOT SET',
      adminUser: adminUser ? 'FOUND' : 'NOT SET',
      apiToken: apiToken ? apiToken.substring(0, 40) + '...' : 'NOT SET',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg z-50 text-sm"
      >
        Show Debug Panel
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-600 rounded-lg shadow-2xl z-50 max-w-md">
      <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between rounded-t-lg">
        <span className="font-semibold">🐛 Debug Panel</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-3 text-xs font-mono">
        <div>
          <div className="font-semibold text-gray-700 mb-1">localStorage admin_token:</div>
          <div className="bg-gray-100 p-2 rounded break-all">
            {debugInfo.adminToken}
          </div>
        </div>

        <div>
          <div className="font-semibold text-gray-700 mb-1">localStorage admin_user:</div>
          <div className="bg-gray-100 p-2 rounded">
            {debugInfo.adminUser}
          </div>
        </div>

        <div>
          <div className="font-semibold text-gray-700 mb-1">API authToken (in memory):</div>
          <div className="bg-gray-100 p-2 rounded break-all">
            {debugInfo.apiToken}
          </div>
        </div>

        <div className="text-gray-500 text-center pt-2 border-t">
          Last updated: {debugInfo.timestamp}
        </div>

        <Button
          onClick={updateDebugInfo}
          className="w-full"
          size="sm"
          style={{ backgroundColor: '#5B7DB1' }}
        >
          Refresh Now
        </Button>
      </div>
    </div>
  );
};
