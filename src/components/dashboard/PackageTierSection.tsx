import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Package as PackageIcon,
  Star,
  Edit2,
  Trash as TrashIcon,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Package, Room } from '../../types/dashboard';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { ViewPackageModal } from './ViewPackageModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useLanguage } from '../../hooks/use-language';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PackageTierSectionProps {
  packages: Package[];
  rooms: Room[];
  onToggleMostPopular: (id: string) => void;
  onEditPackage: (pkg: Package) => void;
  onDeletePackage: (id: string | number) => void;
  onAddNewPackage: () => void;
  pagination?: { page: number; limit: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  selectedRows?: (string | number)[];
  onToggleSelection?: (id: string | number) => void;
  onSelectAll?: (ids: (string | number)[]) => void;
  totalItems?: number;
  language?: string;
}

export const PackageTierSection: React.FC<PackageTierSectionProps> = ({
  packages = [],
  rooms,
  onToggleMostPopular,
  onEditPackage,
  onDeletePackage,
  onAddNewPackage,
  pagination = { page: 1, limit: 10 },
  onPageChange,
  onLimitChange,
  selectedRows = [],
  onToggleSelection,
  onSelectAll,
  totalItems = 0,
  language: langProp
}) => {
  const { language } = useLanguage();
  const currentLang = langProp || language;
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  const handleViewDetails = (pkg: Package) => {
    setViewingPackage(pkg);
    setIsViewModalOpen(true);
  };

  const getPackageStats = (packageId: string | number) => {
    const packageRooms = rooms.filter(r => String(r.package_id) === String(packageId));
    const availableRooms = packageRooms.filter(r => r.status === 'Available').length;
    return {
      total: packageRooms.length,
      available: availableRooms
    };
  };

  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">
              {selectedRows.length} selected
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block">{selectedRows.length === 1 ? '1 tier selected' : `${selectedRows.length} tiers selected`}</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length === 1 && (
              <Button 
                size="sm" 
                variant="outline"
                className="font-bold text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 shadow-sm"
                onClick={() => {
                  const pkg = packages.find(p => String(p.id || p.package_id) === String(selectedRows[0]));
                  if (pkg) onEditPackage(pkg);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                Edit Tier
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              className="font-bold text-slate-600 border-slate-200"
              onClick={() => onSelectAll?.([])}
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm"
              onClick={() => setShowConfirmDelete(true)}
            >
              <TrashIcon className="h-4 w-4 mr-1.5" />
              {selectedRows.length === 1 ? 'Delete' : `Delete ${selectedRows.length}`}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          selectedRows.forEach(id => onDeletePackage?.(id));
          onSelectAll?.([]);
        }}
        title={selectedRows.length === 1 ? "Delete Package Tier" : "Delete Package Tiers"}
        description={`Are you sure you want to permanently delete ${selectedRows.length === 1 ? "this package tier" : "these " + selectedRows.length + " package tiers"}? This will also affect any rooms associated with ${selectedRows.length === 1 ? "this tier" : "these tiers"}.`}
        itemCount={selectedRows.length}
      />


      {/* Section Header - outside the table card */}
      <div className="flex justify-end mb-4 animate-fade-in">
        <Button
          onClick={onAddNewPackage}
          className="h-10 sm:h-11 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex gap-2 items-center text-xs sm:text-sm"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Create New Tier</span>
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[60px] px-6 py-4">
                    <Checkbox 
                      checked={packages.length > 0 && selectedRows.length === packages.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectAll?.(packages.map(p => p.id || p.package_id));
                        } else {
                          onSelectAll?.([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600">Package Name</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-center">Price / Night</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-center">Room Inventory</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-center">Status</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100">
                          <PackageIcon className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">No Package Tiers Found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">Start by creating your first package tier to define room pricing.</p>
                        <Button onClick={onAddNewPackage} variant="outline" className="mt-8 rounded-2xl border-2 font-bold px-8">
                          Create First Tier
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => {
                    const pkgId = pkg.id || pkg.package_id;
                    const stats = getPackageStats(pkgId);
                    return (
                      <TableRow key={pkgId} className={`group hover:bg-slate-50/50 transition-colors border-slate-100 ${selectedRows.includes(pkgId) ? 'bg-blue-50/30' : ''}`}>
                        <TableCell className="px-6 py-4">
                          <Checkbox 
                            checked={selectedRows.includes(pkgId)}
                            onCheckedChange={() => onToggleSelection?.(pkgId)}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{pkg.name}</span>
                            {pkg.isMostPopular && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5 text-[10px] font-black uppercase">Most Popular</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <span className="text-lg font-black text-blue-600">ETB {Number(pkg.price).toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</p>
                                <p className="text-sm font-black text-slate-700">{stats.total}</p>
                              </div>
                              <div className="w-px h-6 bg-slate-200"></div>
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Available</p>
                                <p className="text-sm font-black text-emerald-600">{stats.available}</p>
                              </div>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${stats.available === 0 ? 'bg-slate-300' : 'bg-emerald-500'}`}
                                style={{ width: `${stats.total > 0 ? (stats.available / stats.total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          {stats.total > 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex gap-1.5 px-3 w-fit mx-auto">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none flex gap-1.5 px-3 w-fit mx-auto">
                              <AlertCircle className="h-3 w-3" />
                              No Rooms
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-7 sm:h-9 px-1.5 sm:px-3 gap-1 sm:gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all duration-300 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold shrink-0"
                                >
                                  <span className="text-[10px] sm:text-xs font-bold">Actions</span>
                                  <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50 shrink-0" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-1">
                                <DropdownMenuItem 
                                  onClick={() => onToggleMostPopular(String(pkgId))}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-amber-50 focus:text-amber-600 transition-colors"
                                >
                                  <Star className={`h-4 w-4 ${pkg.isMostPopular ? 'fill-current' : ''}`} />
                                  <span className="font-bold text-sm">{pkg.isMostPopular ? "Remove Popular" : "Mark Popular"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleViewDetails(pkg)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="font-bold text-sm">View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onEditPackage(pkg)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  <span className="font-bold text-sm">Edit Tier</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem 
                                  onClick={() => setPackageToDelete(pkg)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="font-bold text-sm">Delete Tier</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-50 flex flex-row items-center justify-between gap-1.5 sm:gap-4 bg-slate-50/30 overflow-hidden">
            <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
              <span className="hidden xs:inline sm:inline">Showing </span>
              <span className="text-slate-900">{packages.length}</span> of <span className="text-slate-900">{totalItems}</span>
              <span className="hidden xs:inline sm:inline"> tiers</span>
            </div>

            <div className="flex flex-row items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1 shrink-0">
                <Select
                  value={String(pagination.limit)}
                  onValueChange={(val) => onLimitChange?.(parseInt(val))}
                >
                  <SelectTrigger className="w-[70px] sm:w-[125px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                    <div className="flex items-center">
                      <span className="sm:hidden">{pagination.limit}/p</span>
                      <span className="hidden sm:inline">{pagination.limit} / page</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                
                {getPageNumbers().map(pageNum => (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "ghost"}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 p-0 ${
                      pagination.page === pageNum 
                        ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewPackageModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        pkg={viewingPackage}
        language={currentLang}
      />

      {/* Individual Package Tier Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={!!packageToDelete}
        onClose={() => setPackageToDelete(null)}
        onConfirm={() => {
          if (packageToDelete && onDeletePackage) {
            onDeletePackage(packageToDelete.id || packageToDelete.package_id);
          }
          setPackageToDelete(null);
        }}
        title="Delete Package Tier"
        description={`Are you sure you want to permanently delete the package tier "${packageToDelete?.name || ''}"? This will affect any rooms associated with this tier.`}
        itemCount={1}
      />
    </div>
  );
};


