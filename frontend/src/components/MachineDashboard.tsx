import React from 'react';
import Image from 'next/image';
import { MessageSquareIcon, FileTextIcon, ClockIcon } from 'lucide-react';
import { Machine } from '../lib/api';

interface MachineDashboardProps {
  machine: Machine;
  onSelectAction: (actionId: string) => void;
}

export const MachineDashboard: React.FC<MachineDashboardProps> = ({ machine, onSelectAction }) => {
  if (!machine) return null;

  const actions = [
    {
      id: 'chat',
      name: 'Chat',
      icon: <MessageSquareIcon size={24} />,
      description: 'Troubleshoot with AI assistant',
    },
    {
      id: 'manual',
      name: 'Manual',
      icon: <FileTextIcon size={24} />,
      description: 'View machine documentation',
    },
    {
      id: 'history',
      name: 'History',
      icon: <ClockIcon size={24} />,
      description: 'Past troubleshooting sessions',
    },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="h-48 overflow-hidden">
          <Image
            src={machine.image || '/placeholder.png'}
            alt={machine.name}
            className="w-full h-full object-cover"
            width={800}
            height={192}
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{machine.name}</h1>
          </div>
          <p className="text-gray-600 mt-1">{machine.type}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Serial Number:</span>
              <span className="ml-2 font-medium">{machine.serial_number}</span>
            </div>
            <div>
              <span className="text-gray-500">Installed:</span>
              <span className="ml-2 font-medium">{machine.install_date}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Maintenance:</span>
              <span className="ml-2 font-medium">{machine.last_maintenance}</span>
            </div>
            <div>
              <span className="text-gray-500">Department:</span>
              <span className="ml-2 font-medium">{machine.department}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.id)}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 rounded-md text-blue-800 mr-3">{action.icon}</div>
              <h3 className="text-lg font-semibold">{action.name}</h3>
            </div>
            <p className="text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
