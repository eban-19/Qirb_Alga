import { useLanguage } from './use-language';
import apiService from '../services/api';
import { Package, Staff, Room } from '../types/dashboard';
import { toast } from 'sonner';
import {
  validateName,
  validatePhone,
  validateEmail,
  validatePassword,
  validateDateRange,
  validatePrice,
  validateRequiredText
} from '../utils/validation';

export const useDashboardHandlers = (
  data: any,
  ui: any,
  loadRealData: () => Promise<void>
) => {
  const { language } = useLanguage();

  // --- PENSION HANDLERS ---
  const handleCreatePension = async () => {
    try {
      const pensionName = ui.newPension.name || ui.newPension.name_en || '';
      const nameVal = validateRequiredText(pensionName, 'Pension name', 2, 100);
      if (!nameVal.isValid) {
        alert(nameVal.error);
        return;
      }
      if (ui.newPension.phone) {
        const phoneVal = validatePhone(ui.newPension.phone, false);
        if (!phoneVal.isValid) {
          alert(phoneVal.error);
          return;
        }
      }
      if (ui.newPension.email) {
        const emailVal = validateEmail(ui.newPension.email, false);
        if (!emailVal.isValid) {
          alert(emailVal.error);
          return;
        }
      }

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

      const nameVal = validateName(ui.newStaff.full_name, 'Staff name', true);
      if (!nameVal.isValid) {
        alert(nameVal.error);
        return;
      }
      const phoneVal = validatePhone(ui.newStaff.phone, true);
      if (!phoneVal.isValid) {
        alert(phoneVal.error);
        return;
      }
      if (ui.newStaff.email && ui.newStaff.email.trim()) {
        const emailVal = validateEmail(ui.newStaff.email, false);
        if (!emailVal.isValid) {
          alert(emailVal.error);
          return;
        }
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
    try {
      await apiService.deleteStaff(id);
      await loadRealData();
    } catch (error) {
      console.error('Delete staff error:', error);
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
    try {
      await apiService.deleteRoom(roomId);
      await loadRealData();
    } catch (error) {
      console.error('Delete room error:', error);
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
      const pkgName = (language === 'en' ? ui.newPackage.name_en : language === 'am' ? ui.newPackage.name_am : ui.newPackage.name_om) || ui.newPackage.name || '';
      const nameVal = validateRequiredText(pkgName, 'Package Name', 2, 80);
      if (!nameVal.isValid) {
        alert(nameVal.error);
        return;
      }
      const priceVal = validatePrice(ui.newPackage.price, 'Price per night', 1);
      if (!priceVal.isValid) {
        alert(priceVal.error);
        return;
      }

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
    try {
      await apiService.deletePackage(data.selectedPensionId, id);
      await loadRealData();
    } catch (error) {
      console.error('Delete package error:', error);
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
      const nameVal = validateName(ui.walkInForm.guestName, 'Guest name', true);
      if (!nameVal.isValid) {
        alert(nameVal.error);
        return;
      }
      const phoneVal = validatePhone(ui.walkInForm.phoneNumber, true, true);
      if (!phoneVal.isValid) {
        alert(phoneVal.error);
        return;
      }
      const dateVal = validateDateRange(ui.walkInForm.checkIn, ui.walkInForm.checkOut, true);
      if (!dateVal.isValid) {
        alert(dateVal.error);
        return;
      }
      if (!ui.walkInForm.packageId) {
        alert('Please select a room package');
        return;
      }

      const selectedPackage = data.packages.find((p: Package) => String(p.id || p.package_id) === String(ui.walkInForm.packageId));

      const payload = {
        pensionId: data.selectedPensionId,
        packageName: selectedPackage?.name,
        guestName: ui.walkInForm.guestName.trim(),
        phoneNumber: ui.walkInForm.phoneNumber.trim(),
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
    if (!ui.securitySettings.currentPassword) {
      alert('Current password is required');
      return;
    }
    const passVal = validatePassword(ui.securitySettings.newPassword, true);
    if (!passVal.isValid) {
      alert(passVal.error);
      return;
    }

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
    const category = (formData.get('category') as string)?.trim();
    const amountStr = formData.get('amount') as string;
    const expenseDate = formData.get('expense_date') as string;
    const description = (formData.get('description') as string)?.trim();

    if (!category) {
      toast.error('Expense category is required');
      return;
    }

    const priceVal = validatePrice(amountStr, 'Expense amount', 0.01);
    if (!priceVal.isValid) {
      toast.error(priceVal.error);
      return;
    }

    if (!expenseDate) {
      toast.error('Expense date is required');
      return;
    }

    const expenseData = {
      category,
      description,
      amount: parseFloat(amountStr),
      expense_date: expenseDate
    };

    try {
      const response = await apiService.addExpense(data.selectedPensionId, expenseData);
      if (response.success) {
        toast.success(response.message || 'Expense logged successfully!');
        // Reset form
        (e.target as HTMLFormElement).reset();
        await loadRealData();
      } else {
        toast.error(response.message || 'Failed to log expense.');
      }
    } catch (error: any) {
      console.error('Add expense error:', error);
      toast.error(error.originalResponse?.message || error.message || 'An error occurred while logging the expense.');
    }
  };

  const handleUpdateExpense = async (expenseId: number, expenseData: any) => {
    try {
      ui.setIsUpdating(true);
      const response = await apiService.updateExpense(expenseId, expenseData);
      if (response.success) {
        toast.success(response.message || 'Expense updated successfully!');
        await loadRealData();
        return true;
      } else {
        toast.error(response.message || 'Failed to update expense.');
        return false;
      }
    } catch (error: any) {
      console.error('Update expense error:', error);
      toast.error(error.originalResponse?.message || error.message || 'An error occurred while updating the expense.');
      return false;
    } finally {
      ui.setIsUpdating(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      ui.setIsUpdating(true);
      const response = await apiService.deleteExpense(expenseId);
      if (response.success) {
        toast.success(response.message || 'Expense deleted successfully!');
        await loadRealData();
        return true;
      } else {
        toast.error(response.message || 'Failed to delete expense.');
        return false;
      }
    } catch (error: any) {
      console.error('Delete expense error:', error);
      toast.error(error.originalResponse?.message || error.message || 'An error occurred while deleting the expense.');
      return false;
    } finally {
      ui.setIsUpdating(false);
    }
  };

  const handleExportTransactions = () => {
    const transactions = data.recentTransactions;
    if (!transactions || transactions.length === 0) {
      toast.error('No transactions to export.');
      return;
    }

    const headers = 'Date,Description,Category,Amount,Status\n';
    const rows = transactions.map((t: any) => {
      const category = t.type === 'income' ? 'REVENUE' : 'EXPENSE';
      return `${t.date},"${t.description}",${category},${t.amount},${t.status}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Transactions exported successfully!');
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
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleExportTransactions
  };
};
