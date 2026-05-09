import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import { Package, Staff, Room } from '../types/dashboard';

export const useDashboardHandlers = (
  data: any,
  ui: any,
  loadRealData: () => Promise<void>
) => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  // --- PENSION HANDLERS ---
  const handleCreatePension = async () => {
    try {
      const response = await apiService.createPension(ui.newPension);
      if (response.success) {
        ui.setShowCreatePension(false);
        await loadRealData();
      }
    } catch (error) {
      console.error('Create pension error:', error);
    }
  };

  const handlePensionSelectionChange = async (pensionId: string) => {
    data.setSelectedPensionId(pensionId);
    // Refresh relevant data for the new pension
    await loadRealData();
  };

  // --- STAFF HANDLERS ---
  const handleEditStaff = (staff: Staff) => {
    ui.setEditingStaff(staff);
    ui.setNewStaff({ ...staff });
    ui.setShowAddStaffModal(true);
  };

  const handleSaveStaff = async () => {
    try {
      if (ui.editingStaff) {
        await apiService.updateStaff(ui.editingStaff.id, ui.newStaff);
      } else {
        await apiService.createStaff({ ...ui.newStaff, pension_id: data.selectedPensionId });
      }
      ui.setShowAddStaffModal(false);
      await loadRealData();
    } catch (error) {
      console.error('Save staff error:', error);
    }
  };

  const handleDeleteStaff = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await apiService.deleteStaff(id);
        await loadRealData();
      } catch (error) {
        console.error('Delete staff error:', error);
      }
    }
  };

  const handleStaffFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry: any = {};
        headers.forEach((header, index) => {
          entry[header] = values[index];
        });
        return entry;
      });

      ui.setStaffBulkUpload({
        file,
        data: parsedData,
        preview: parsedData.slice(0, 5)
      });
    };
    reader.readAsText(file);
  };

  const handleConfirmStaffBulkUpload = async () => {
    try {
      const staffToUpload = ui.staffBulkUpload.data.map((s: any) => ({
        ...s,
        pension_id: data.selectedPensionId,
        salary: parseFloat(s.salary) || 0
      }));

      for (const staff of staffToUpload) {
        await apiService.createStaff(staff);
      }
      
      ui.setShowStaffBulkUploadModal(false);
      ui.setStaffBulkUpload({ file: null, data: [], preview: [] });
      await loadRealData();
    } catch (error) {
      console.error('Confirm staff bulk upload error:', error);
    }
  };

  const handleDownloadStaffTemplate = () => {
    const headers = 'full_name,role,department,phone,email,salary,status\n';
    const sample = 'John Doe,Manager,Front Desk,+251911122334,john@example.com,15000,active\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_template.csv';
    a.click();
  };

  // --- ROOM HANDLERS ---
  const handleAddRoom = async () => {
    try {
      const roomNumbersList = ui.newRoom.roomNumbers
        .split(',')
        .map((num: string) => num.trim())
        .filter((num: string) => num.length > 0);
      
      const selectedPackage = data.packages.find((p: Package) => String(p.id || p.package_id) === String(ui.newRoom.package));
      
      for (const roomNumber of roomNumbersList) {
        await apiService.createRoom({
          pension_id: data.selectedPensionId,
          package_id: ui.newRoom.package,
          room_number: roomNumber,
          room_type: selectedPackage?.name || 'Standard',
          capacity: parseInt(ui.newRoom.capacity) || 1,
          price_per_night: parseFloat(selectedPackage?.price || '0'),
          number_of_beds: parseInt(ui.newRoom.numberOfBeds) || 1,
          availability_status: ui.newRoom.status
        });
      }
      ui.setShowAddRoomModal(false);
      await loadRealData();
    } catch (error) {
      console.error('Add room error:', error);
    }
  };

  const handleDeleteRoom = async (roomId: string | number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await apiService.deleteRoom(roomId);
        await loadRealData();
      } catch (error) {
        console.error('Delete room error:', error);
      }
    }
  };

  const handleRoomFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry: any = {};
        headers.forEach((header, index) => {
          entry[header] = values[index];
        });
        return entry;
      });

      ui.setRoomsBulkUpload({
        file,
        data: parsedData,
        preview: parsedData.slice(0, 5)
      });
    };
    reader.readAsText(file);
  };

  const handleConfirmRoomBulkUpload = async () => {
    try {
      const roomsToUpload = ui.roomsBulkUpload.data;
      
      for (const roomData of roomsToUpload) {
        const selectedPackage = data.packages.find((p: Package) => 
          p.name.toLowerCase() === (roomData.package_name || '').toLowerCase()
        );

        await apiService.createRoom({
          pension_id: data.selectedPensionId,
          package_id: selectedPackage?.id || selectedPackage?.package_id || null,
          room_number: roomData.room_number,
          room_type: roomData.room_type || selectedPackage?.name || 'Standard',
          capacity: parseInt(roomData.capacity) || 1,
          price_per_night: parseFloat(roomData.price || selectedPackage?.price || '0'),
          number_of_beds: parseInt(roomData.number_of_beds) || 1,
          availability_status: roomData.status || 'Available'
        });
      }
      
      ui.setShowRoomsBulkUploadModal(false);
      ui.setRoomsBulkUpload({ file: null, data: [], preview: [] });
      await loadRealData();
    } catch (error) {
      console.error('Confirm room bulk upload error:', error);
    }
  };

  const handleDownloadRoomTemplate = () => {
    const headers = 'room_number,room_type,package_name,capacity,number_of_beds,price,status\n';
    const sample = '101,Standard,Basic,2,1,500,Available\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms_template.csv';
    a.click();
  };

  // --- PACKAGE HANDLERS ---
  const handleAddPackage = async () => {
    try {
      if (ui.editingPackage) {
        await apiService.updatePackage(data.selectedPensionId, ui.editingPackage.id, ui.newPackage);
      } else {
        await apiService.createPackage(data.selectedPensionId, ui.newPackage);
      }
      ui.setShowAddPackageModal(false);
      await loadRealData();
    } catch (error) {
      console.error('Save package error:', error);
    }
  };

  const handleToggleMostPopular = async (packageId: string) => {
    try {
      const pkg = data.packages.find((p: Package) => String(p.id || p.package_id) === String(packageId));
      if (!pkg) return;
      
      await apiService.updatePackage(data.selectedPensionId, pkg.id || pkg.package_id, {
        isMostPopular: !pkg.isMostPopular
      });
      await loadRealData();
    } catch (error) {
      console.error('Toggle most popular error:', error);
    }
  };

  const handleDeletePackage = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await apiService.deletePackage(data.selectedPensionId, id);
        await loadRealData();
      } catch (error) {
        console.error('Delete package error:', error);
      }
    }
  };

  // --- BOOKING HANDLERS ---
  const handleUpdateBookingStatus = async (bookingId: string | number, newStatus: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        await loadRealData();
      }
    } catch (error) {
      console.error('Update booking status error:', error);
    }
  };

  const handleWalkInSubmit = async () => {
    try {
      // Implement walk-in logic
      ui.setShowWalkInModal(false);
      await loadRealData();
    } catch (error) {
      console.error('Walk-in booking error:', error);
    }
  };

  const handleCompleteEarly = async (bookingId: string | number) => {
    try {
      const response = await apiService.completeBookingEarly(bookingId);
      if (response.success) {
        await loadRealData();
      }
    } catch (error) {
      console.error('Complete booking early error:', error);
    }
  };

  // --- SETTINGS HANDLERS ---
  const handleSavePropertySettings = async () => {
    ui.setIsUpdating(true);
    try {
      await apiService.updatePension(data.selectedPensionId, ui.propertySettings);
      ui.showSuccess();
      await loadRealData();
    } catch (error) {
      console.error('Save property settings error:', error);
    } finally {
      ui.setIsUpdating(false);
    }
  };

  return {
    handleCreatePension,
    handlePensionSelectionChange,
    handleEditStaff,
    handleSaveStaff,
    handleDeleteStaff,
    handleStaffFileUpload,
    handleConfirmStaffBulkUpload,
    handleDownloadStaffTemplate,
    handleAddRoom,
    handleDeleteRoom,
    handleRoomFileUpload,
    handleConfirmRoomBulkUpload,
    handleDownloadRoomTemplate,
    handleAddPackage,
    handleDeletePackage,
    handleToggleMostPopular,
    handleUpdateBookingStatus,
    handleCompleteEarly,
    handleWalkInSubmit,
    handleSavePropertySettings
  };
};
