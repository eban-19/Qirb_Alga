import { useLanguage } from './use-language';
import apiService from '../services/api';
import { Package, Staff, Room } from '../types/dashboard';

export const useDashboardHandlers = (
  data: any,
  ui: any,
  loadRealData: () => Promise<void>
) => {
  const { language } = useLanguage();

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
    await loadRealData(pensionId);
  };

  // --- STAFF HANDLERS ---
  const handleEditStaff = (staff: Staff) => {
    ui.setEditingStaff(staff);
    ui.setNewStaff({ ...staff });
    ui.setShowAddStaffModal(true);
  };

  const handleSaveStaff = async () => {
    try {
      const pensionId = parseInt(data.selectedPensionId);
      if (!pensionId) {
        alert('No pension selected. Please ensure your pension is set up correctly.');
        return;
      }

      if (ui.editingStaff) {
        const staffId = ui.editingStaff.id || ui.editingStaff.staff_id;
        await apiService.updateStaff(staffId, ui.newStaff);
      } else {
        await apiService.addStaff(pensionId, ui.newStaff);
      }
      ui.setShowAddStaffModal(false);
      ui.setEditingStaff(null);
      await loadRealData();
    } catch (error: any) {
      console.error('Save staff error:', error);
      const msg = error?.originalResponse?.message || error?.message || 'Failed to save staff member.';
      alert(msg);
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
      const pensionId = parseInt(data.selectedPensionId);
      if (!pensionId) {
        alert('No pension selected.');
        return;
      }

      for (const staff of ui.staffBulkUpload.data) {
        await apiService.addStaff(pensionId, {
          ...staff,
          salary: parseFloat(staff.salary) || 0
        });
      }
      
      ui.setShowStaffBulkUploadModal(false);
      ui.setStaffBulkUpload({ file: null, data: [], preview: [] });
      await loadRealData();
    } catch (error: any) {
      console.error('Confirm staff bulk upload error:', error);
      alert(error?.message || 'Failed to upload staff data.');
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
      ui.setErrorMessage('');
      const roomNumbersList = ui.newRoom.roomNumbers
        ? ui.newRoom.roomNumbers
            .split(',')
            .map((num: string) => num.trim())
            .filter((num: string) => num.length > 0)
        : [];
      
      const selectedPackage = data.packages.find((p: Package) => String(p.id || p.package_id) === String(ui.newRoom.package));
      
      // If no room numbers provided, use quantity/numberOfRooms
      const finalRoomNumbers = roomNumbersList.length > 0 
        ? roomNumbersList 
        : Array.from({ length: parseInt(ui.newRoom.numberOfRooms) || 1 }, (_, i) => `${selectedPackage?.name || 'Room'} ${i + 1}`);

      // CLIENT-SIDE CHECK: Prevent duplicate room numbers within the same pension
      const existingRoomNumbers = data.roomsData.map((r: any) => String(r.room_number || r.number || r.id || ''));
      const duplicatesInNewList = finalRoomNumbers.filter((item: string, index: number) => finalRoomNumbers.indexOf(item) !== index);
      
      if (duplicatesInNewList.length > 0) {
        ui.setErrorMessage(`Duplicate room numbers found: ${duplicatesInNewList.join(', ')}.`);
        return;
      }

      const alreadyExists = finalRoomNumbers.filter(num => existingRoomNumbers.includes(String(num)));
      if (alreadyExists.length > 0) {
        ui.setErrorMessage(`Room numbers already exist: ${alreadyExists.join(', ')}.`);
        return;
      }

      // PACKAGE CONSISTENCY CHECK: Ensure capacity and beds match existing rooms in this package
      const packageId = ui.newRoom.package;
      const existingPackageRoom = data.roomsData.find((r: any) => String(r.package_id) === String(packageId));
      
      if (existingPackageRoom) {
        const requiredCapacity = parseInt(existingPackageRoom.capacity);
        const requiredBeds = parseInt(existingPackageRoom.number_of_beds || existingPackageRoom.beds);
        
        if (parseInt(ui.newRoom.capacity) !== requiredCapacity || parseInt(ui.newRoom.numberOfBeds) !== requiredBeds) {
          ui.setErrorMessage(`Consistency Error: All rooms in this package must have a capacity of ${requiredCapacity} and ${requiredBeds} bed(s).`);
          return;
        }
      }

      for (const roomNumber of finalRoomNumbers) {
        await apiService.createRoom({
          pension_id: data.selectedPensionId,
          packageId: ui.newRoom.package, // Fixed field name
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

  const handleUpdateRoomStatus = async (roomId: string | number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Occupied' : 'Available';
      await apiService.updateRoom(Number(roomId), { availability_status: newStatus });
      await loadRealData();
    } catch (error) {
      console.error('Update room status error:', error);
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
      ui.setErrorMessage('');
      const roomsToUpload = ui.roomsBulkUpload.data;
      const existingRoomNumbers = data.roomsData.map((r: any) => String(r.room_number || r.number || r.id || ''));
      
      // Check for duplicates within the upload itself
      const uploadedNumbers = roomsToUpload.map((r: any) => String(r.room_number || ''));
      const duplicatesInUpload = uploadedNumbers.filter((item, index) => uploadedNumbers.indexOf(item) !== index && item !== '');
      
      if (duplicatesInUpload.length > 0) {
        ui.setErrorMessage(`Duplicate room numbers in upload: ${duplicatesInUpload.join(', ')}.`);
        return;
      }

      // Check against existing rooms
      const conflicts = uploadedNumbers.filter(num => num !== '' && existingRoomNumbers.includes(num));
      if (conflicts.length > 0) {
        ui.setErrorMessage(`Room numbers already exist: ${conflicts.join(', ')}.`);
        return;
      }
      
      for (const roomData of roomsToUpload) {
        const selectedPackage = data.packages.find((p: Package) => 
          p.name.toLowerCase() === (roomData.package_name || '').toLowerCase()
        );
        
        const pkgId = selectedPackage?.id || selectedPackage?.package_id || null;

        // CONSISTENCY CHECK: Ensure bulk upload rooms match existing rooms in the same package
        if (pkgId) {
          const existingRoom = data.roomsData.find((r: any) => String(r.package_id) === String(pkgId));
          if (existingRoom) {
            const reqCap = parseInt(existingRoom.capacity);
            const reqBeds = parseInt(existingRoom.number_of_beds || existingRoom.beds);
            
            if (parseInt(roomData.capacity) !== reqCap || parseInt(roomData.number_of_beds) !== reqBeds) {
              ui.setErrorMessage(`Consistency Error: Room ${roomData.room_number} in package "${selectedPackage.name}" must have capacity ${reqCap} and ${reqBeds} bed(s).`);
              return;
            }
          }
        }

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
  const handlePackageImageUpload = async (file: File) => {
    try {
      const response = await apiService.uploadImage(file);
      if (response.success && response.data) {
        ui.setNewPackage((prev: any) => {
          const currentImages = prev.images || [];
          const updatedImages = [...currentImages, response.data.url];
          return {
            ...prev,
            images: updatedImages,
            // Keep image for backward compatibility if needed
            image: updatedImages.length > 0 ? updatedImages[0] : prev.image
          };
        });
      }
    } catch (error: any) {
      console.error('Package image upload error:', error);
      alert(error.message || 'Failed to upload image. Please check file size and type.');
    }
  };

  const handleAddPackage = async () => {
    try {
      let packageData = { 
        ...ui.newPackage,
        price: parseFloat(ui.newPackage.price) || 0
      };
      
      if (ui.editingPackage) {
        const pkgId = ui.editingPackage.id || ui.editingPackage.package_id;
        await apiService.updatePackage(data.selectedPensionId, pkgId, packageData);
      } else {
        await apiService.createPackage(data.selectedPensionId, packageData);
      }
      ui.setShowAddPackageModal(false);
      await loadRealData();
    } catch (error: any) {
      console.error('Save package error:', error);
      alert(error.message || 'Failed to save package.');
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
      const selectedPackage = data.packages.find((p: Package) => String(p.id || p.package_id) === String(ui.walkInForm.packageId));
      
      const payload = {
        pensionId: data.selectedPensionId,
        packageName: selectedPackage?.name,
        guestName: ui.walkInForm.guestName,
        phoneNumber: ui.walkInForm.phoneNumber,
        checkIn: ui.walkInForm.checkIn,
        checkOut: ui.walkInForm.checkOut
      };

      const response = await apiService.createWalkInBooking(payload);
      
      if (response.success) {
        ui.setShowWalkInModal(false);
        ui.setWalkInForm({
          guestName: '', 
          phoneNumber: '', 
          checkIn: new Date().toISOString().split('T')[0], 
          checkOut: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          packageId: ''
        });
        await loadRealData();
      }
    } catch (error: any) {
      console.error('Walk-in booking error:', error);
      alert(error.message || 'Failed to create walk-in booking');
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
      let finalSettings: any = {
        name: ui.propertySettings.name,
        description: ui.propertySettings.description,
        address: ui.propertySettings.address,
        phone: ui.propertySettings.phone,
        email: ui.propertySettings.email,
        capacity: parseInt(ui.propertySettings.capacity) || 0,
        owner_info: ui.propertySettings.ownerInfo,
        room_details: ui.propertySettings.roomDetails,
        image_url: ui.propertySettings.imageUrl,
        latitude: ui.propertySettings.latitude,
        longitude: ui.propertySettings.longitude
      };

      // Upload profile image if selected
      if (ui.pensionProfileImageFile) {
        const uploadResp = await apiService.uploadImage(ui.pensionProfileImageFile);
        if (uploadResp.success && uploadResp.data) {
          finalSettings.image_url = uploadResp.data.url;
          ui.setPensionProfileImageFile(null);
        }
      }

      await apiService.updatePension(data.selectedPensionId, finalSettings);
      ui.showSuccess();
      await loadRealData();
    } catch (error: any) {
      console.error('Save property settings error:', error);
      alert(error.message || 'Failed to update property settings.');
    } finally {
      ui.setIsUpdating(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    ui.setIsUpdating(true);
    try {
      const response = await apiService.changePassword(
        ui.securitySettings.currentPassword,
        ui.securitySettings.newPassword
      );
      
      if (response.success) {
        ui.showSuccess();
        ui.setSecuritySettings({
          currentPassword: '',
          newPassword: '',
          twoFactorEnabled: ui.securitySettings.twoFactorEnabled
        });
      }
    } catch (error: any) {
      console.error('Save security settings error:', error);
      // You might want to show an error message to the user here
      if (error.originalResponse?.message) {
        alert(error.originalResponse.message);
      } else {
        alert('Failed to update security settings');
      }
    } finally {
      ui.setIsUpdating(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const expenseData = {
      category: formData.get('category'),
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount') as string),
      expense_date: formData.get('expense_date')
    };

    try {
      const response = await apiService.addExpense(data.selectedPensionId, expenseData);
      if (response.success) {
        // Reset form
        (e.target as HTMLFormElement).reset();
        await loadRealData();
      }
    } catch (error) {
      console.error('Add expense error:', error);
    }
  };

  return {
    handleCreatePension: async () => {
      try {
        let pensionData = { ...ui.newPension };
        
        // Upload image if selected
        if (ui.pensionImageFile) {
          const uploadResp = await apiService.uploadImage(ui.pensionImageFile);
          if (uploadResp.success && uploadResp.data) {
            pensionData.image_url = uploadResp.data.url;
            ui.setPensionImageFile(null);
          }
        }

        const response = await apiService.createPension(pensionData);
        if (response.success) {
          ui.setShowCreatePension(false);
          await loadRealData();
        }
      } catch (error) {
        console.error('Create pension error:', error);
      }
    },
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
    handleUpdateRoomStatus,
    handleAddPackage,
    handlePackageImageUpload,
    handleDeletePackage,
    handleToggleMostPopular,
    handleUpdateBookingStatus,
    handleCompleteEarly,
    handleWalkInSubmit,
    handleSavePropertySettings,
    handleSaveSecuritySettings,
    handleAddExpense
  };
};
