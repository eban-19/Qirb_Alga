import { useState } from 'react';
import { ViewModes, BulkUploadData } from '../data/types/dashboardTypes';

export const useDashboard = () => {
  // View modes for different sections
  const [viewModes, setViewModes] = useState<ViewModes>({
    rooms: 'card',
    bookings: 'card',
    guests: 'card',
    transactions: 'card'
  });

  // Rooms bulk upload state
  const [showRoomsBulkUploadModal, setShowRoomsBulkUploadModal] = useState(false);
  const [roomsBulkUpload, setRoomsBulkUpload] = useState<BulkUploadData>({
    file: null,
    data: [],
    preview: []
  });

  // Add room modal state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Toggle view mode for a section
  const toggleViewMode = (section: keyof ViewModes) => {
    setViewModes(prev => ({
      ...prev,
      [section]: prev[section] === 'card' ? 'table' : 'card'
    }));
  };

  // Rooms bulk upload handlers
  const handleRoomsBulkFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRoomsBulkUpload(prev => ({ ...prev, file }));
      // Parse CSV file and set data/preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
        setRoomsBulkUpload(prev => ({ ...prev, data, preview: data.slice(0, 5) }));
      };
      reader.readAsText(file);
    }
  };

  const handleRoomsBulkUploadConfirm = () => {
    // Implement bulk upload logic here
    setShowRoomsBulkUploadModal(false);
    setRoomsBulkUpload({ file: null, data: [], preview: [] });
  };

  // Download template handlers
  const downloadRoomsTemplate = () => {
    const csvContent = "id,type,floor,price,status,capacity,amenities\n" +
                      "R001,Standard Single,1,1500,Available,1,Wifi,TV,AC";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    // State
    viewModes,
    showRoomsBulkUploadModal,
    roomsBulkUpload,
    showAddRoomModal,

    // Actions
    setViewModes,
    toggleViewMode,
    setShowRoomsBulkUploadModal,
    setShowAddRoomModal,

    // Handlers
    handleRoomsBulkFileUpload,
    handleRoomsBulkUploadConfirm,
    downloadRoomsTemplate
  };
};
