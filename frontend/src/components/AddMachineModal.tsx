import React, { useState, ChangeEvent, FormEvent } from 'react';
import { XIcon, UploadIcon } from 'lucide-react';
import { Machine } from '../lib/api';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (machine: Machine) => Promise<void>;
}

export const AddMachineModal: React.FC<AddMachineModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manufacturer: '',
    serialNumber: '',
    description: '',
    age: '',
    notes: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (_e: React.MouseEvent<HTMLButtonElement>) => {
    // This is a placeholder for photo upload functionality
    alert('Photo upload functionality will be implemented in a future update.');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Convert formData to Machine type
    const machine: Machine = {
      name: formData.name,
      type: formData.manufacturer,
      department: formData.location,
      serial_number: formData.serialNumber,
      install_date: formData.age,
      description: formData.description,
      notes: formData.notes,
    };
    await onSubmit(machine);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Add New Machine</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <XIcon size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CNC Mill #3"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Production Floor A"
              />
            </div>
            <div>
              <label
                htmlFor="manufacturer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Manufacturer
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Haas Automation"
              />
            </div>
            <div>
              <label
                htmlFor="serialNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Serial Number
              </label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SN-2023-0045"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Manufacture
              </label>
              <input
                type="text"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Jan 2022"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-1">
              Photos
            </label>
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <button
                type="button"
                onClick={handlePhotoUpload}
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <UploadIcon size={18} className="mr-2" />
                Upload Photos
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Upload photos of the machine (PNG, JPG, JPEG)
              </p>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a detailed description of the machine..."
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes about the machine..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Machine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
