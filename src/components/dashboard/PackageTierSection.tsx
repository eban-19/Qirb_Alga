import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
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
  const { t, language } = useLanguage();
  const currentLang = langProp || language;
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
        <div className="sticky top-0 z-20 bg-white border border-slate-200 p-3 rounded-xl shadow-md flex flex-col xs:flex-row items-center justify-between gap-3 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 w-full xs:w-auto">
            <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold shrink-0">
              {selectedRows.length} {t.dashboard?.selected || 'selected'}
            </Badge>
            <p className="text-sm font-medium text-slate-600 hidden sm:block truncate">
              {selectedRows.length === 1
                ? (t.dashboard?.oneStaffMemberSelected || '1 tier selected').replace('staff member', 'tier')
                : (t.dashboard?.multipleStaffMembersSelected || '{count} tiers selected').replace('{count}', String(selectedRows.length)).replace('staff members', 'tiers')}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full xs:w-auto">
            {selectedRows.length === 1 && (
              <Button
                size="sm"
                variant="outline"
                className="font-bold text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 shadow-sm flex-1 xs:flex-none h-10"
                onClick={() => {
                  const pkg = packages.find(p => String(p.id || p.package_id) === String(selectedRows[0]));
                  if (pkg) onEditPackage(pkg);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                <span>{t.dashboard?.editTier || 'Edit Tier'}</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="font-bold text-slate-600 border-slate-200 flex-1 xs:flex-none h-10"
              onClick={() => onSelectAll?.([])}
            >
              <span>{t.dashboard?.clear || 'Clear'}</span>
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-sm flex-1 xs:flex-none h-10"
              onClick={() => setShowConfirmDelete(true)}
            >
              <TrashIcon className="h-4 w-4 mr-1.5" />
              <span>{selectedRows.length === 1 ? (t.dashboard?.delete || 'Delete') : `${t.dashboard?.delete || 'Delete'} ${selectedRows.length}`}</span>
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
        title={selectedRows.length === 1 ? (t.dashboard?.deletePackageTier || "Delete Package Tier") : (t.dashboard?.deletePackageTiers || "Delete Package Tiers")}
        description={selectedRows.length === 1
          ? (t.dashboard?.confirmDeletePackageSingleDescription || "Are you sure you want to permanently delete this package tier? This will also affect any rooms associated with this tier.")
          : (t.dashboard?.confirmDeletePackageMultipleDescription || `Are you sure you want to permanently delete these ${selectedRows.length} package tiers? This will also affect any rooms associated with these tiers.`)
        }
        itemCount={selectedRows.length}
      />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50">
            <PackageIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.dashboard?.packageTiers || "Package Tiers"}</h2>
            <p className="text-slate-500 text-sm font-medium mt-0.5">{t.dashboard?.packageTiersDescription || "Manage your property's room categories and pricing levels."}</p>
          </div>
        </div>
        <Button
          onClick={onAddNewPackage}
          className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>{t.dashboard?.createNewTier || "Create New Tier"}</span>
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
                  <TableHead className="px-6 py-4 font-bold text-slate-600">{t.dashboard?.packageName || "Package Name"}</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-center">{t.dashboard?.priceNight || "Price / Night"}</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-center">{t.dashboard?.roomInventory || "Room Inventory"}</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-center">{t.dashboard?.status || "Status"}</TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-600 text-right">{t.dashboard?.actions || "Actions"}</TableHead>
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
                        <h3 className="text-xl font-black text-slate-900">{t.dashboard?.noPackageTiersFound || "No Package Tiers Found"}</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">{t.dashboard?.startCreatePackageTier || "Start by creating your first package tier to define room pricing."}</p>
                        <Button onClick={onAddNewPackage} variant="outline" className="mt-8 rounded-2xl border-2 font-bold px-8">
                          {t.dashboard?.createFirstTier || "Create First Tier"}
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
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5 text-[10px] font-black uppercase">{t.dashboard?.mostPopular || "Most Popular"}</Badge>
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.dashboard?.amount || "Total"}</p>
                                <p className="text-sm font-black text-slate-700">{stats.total}</p>
                              </div>
                              <div className="w-px h-6 bg-slate-200"></div>
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.dashboard?.availableRooms || "Available"}</p>
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
                              {t.dashboard?.active || "Active"}
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none flex gap-1.5 px-3 w-fit mx-auto">
                              <AlertCircle className="h-3 w-3" />
                              {t.dashboard?.noRooms || "No Rooms"}
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
                                  className="h-9 px-3 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all duration-300 rounded-lg"
                                >
                                  <span className="text-xs font-bold">{t.dashboard?.actions || "Actions"}</span>
                                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200 p-1">
                                <DropdownMenuItem
                                  onClick={() => onToggleMostPopular(String(pkgId))}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-amber-50 focus:text-amber-600 transition-colors"
                                >
                                  <Star className={`h-4 w-4 ${pkg.isMostPopular ? 'fill-current' : ''}`} />
                                  <span className="font-bold text-sm">{pkg.isMostPopular ? (t.dashboard?.removePopular || "Remove Popular") : (t.dashboard?.markPopular || "Mark Popular")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(pkg)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="font-bold text-sm">{t.dashboard?.viewDetails || "View Details"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onEditPackage(pkg)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  <span className="font-bold text-sm">{t.dashboard?.editTier || "Edit Tier"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                  onClick={() => onDeletePackage(pkgId)}
                                  className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="font-bold text-sm">{t.dashboard?.deleteTier || "Delete Tier"}</span>
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

          {/* Unified Pagination Footer */}
          <div className="p-3 sm:p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 gap-2 overflow-hidden">
            <div className="text-[10px] sm:text-sm font-bold text-slate-500 shrink-0">
              <span className="hidden sm:inline">
                {t.dashboard?.showingTiers ? (
                  t.dashboard.showingTiers.replace('{count}', String(packages.length)).replace('{total}', String(totalItems))
                ) : (
                  <>Showing <span className="text-slate-900">{packages.length}</span> of <span className="text-slate-900">{totalItems}</span></>
                )}
              </span>
              <span className="sm:hidden text-slate-900 font-extrabold">{packages.length}/{totalItems}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Select
                value={String(pagination.limit)}
                onValueChange={(val) => onLimitChange?.(parseInt(val))}
              >
                <SelectTrigger className="w-[65px] sm:w-[130px] h-8 sm:h-10 border-slate-200 rounded-lg text-slate-600 font-medium bg-white px-1 sm:px-3 text-[10px] sm:text-sm">
                  <div className="flex items-center justify-center w-full">
                    <span className="sm:hidden">{pagination.limit}/p</span>
                    <span className="hidden sm:inline">{pagination.limit} {t.dashboard?.perPage || '/ page'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-400 p-0"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map(pageNum => (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "ghost"}
                      onClick={() => onPageChange?.(pageNum)}
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm transition-all duration-200 p-0 ${pagination.page === pageNum
                          ? "bg-[#F29F1F] text-slate-900 hover:bg-[#F29F1F]/90 shadow-md shadow-orange-200"
                          : "text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

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
    </div>
  );
};
