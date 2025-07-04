import React, { useState } from 'react';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import { AddMachineModal } from './AddMachineModal';
import { Machine } from '../lib/api';

interface HomeScreenProps {
  machines: Machine[];
  loading?: boolean;
  error?: string | null;
  onSelectMachine: (machine: Machine) => void;
  onAddMachine: (machine: Machine) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  machines,
  loading = false,
  error = null,
  onSelectMachine,
  onAddMachine,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMachine = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitMachine = async (machineData: Machine) => {
    await onAddMachine(machineData);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <span className="text-blue-800 text-xl font-bold">Loading machines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4">
        <span className="text-red-600 text-xl font-bold mb-2">{error}</span>
        <button
          onClick={handleAddMachine}
          className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mt-4"
        >
          <PlusIcon size={18} className="mr-2" />
          Add Machine
        </button>
        <AddMachineModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitMachine}
        />
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4">
        <AlertCircleIcon size={48} className="text-blue-800 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Machines Added</h2>
        <p className="text-gray-600 mb-4 text-center">
          No machines have been added to the system yet. Contact your administrator to get started.
        </p>
        <button
          onClick={handleAddMachine}
          className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusIcon size={18} className="mr-2" />
          Add Machine
        </button>
        <AddMachineModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitMachine}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Machines</h1>
        <button
          onClick={handleAddMachine}
          className="bg-blue-800 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusIcon size={18} className="mr-2" />
          Add Machine
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {machines.map((machine) => (
          <button
            key={machine.id}
            onClick={() => onSelectMachine(machine)}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{machine.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{machine.type}</p>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Last active: {machine.last_activity || 'N/A'}</span>
            </div>
          </button>
        ))}
      </div>
      <AddMachineModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMachine}
      />
    </div>
  );
};
