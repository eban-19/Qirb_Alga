import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Upload, Download, X, FileText, Check, BedDouble, Home, DollarSign, Users, Shield, AlertCircle } from 'lucide-react';
import { BulkUploadData } from '../../data/types/dashboardTypes';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  uploadData: BulkUploadData;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  onDownloadTemplate: () => void;
  columns: { key: string; label: string }[];
  errorMessage?: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  uploadData,
  onFileUpload,
  onConfirm,
  onDownloadTemplate,
  columns,
  errorMessage
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Create a proper synthetic event
        const syntheticEvent = {
          target: {
            files: files,
            value: ''
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onFileUpload(syntheticEvent);
      }
    }
  };

  const getIconForTitle = (title: string) => {
    if (title.toLowerCase().includes('room')) return BedDouble;
    if (title.toLowerCase().includes('staff')) return Users;
    return Upload;
  };

  const getThemeForTitle = (title: string) => {
    if (title.toLowerCase().includes('room')) {
      return {
        primary: 'blue',
        gradient: 'from-blue-400 via-blue-500 to-blue-600',
        iconBg: 'bg-blue-100 text-blue-600',
        instructionsBg: 'bg-blue-50 border-blue-200',
        instructionsText: 'text-blue-900 text-blue-800'
      };
    }
    return {
      primary: 'emerald',
      gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
      instructionsBg: 'bg-emerald-50 border-emerald-200',
      instructionsText: 'text-emerald-900 text-emerald-800'
    };
  };

  const theme = getThemeForTitle(title);
  const Icon = getIconForTitle(title);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden bg-white ring-1 ring-slate-200 shadow-none animate-in slide-in-from-bottom-4 duration-300 rounded-[2rem]">
        <CardHeader className="pb-4 px-4 sm:px-6 mt-2">
          <CardTitle className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900">{title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100 transition-all duration-200 hover:scale-110"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-900">Upload Error</h4>
                <p className="text-sm text-red-700 opacity-80">{errorMessage}</p>
              </div>
            </div>
          )}
          {/* Enhanced Instructions */}
          <div className={`${theme.instructionsBg} rounded-xl p-3 sm:p-4 border relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${theme.iconBg}`}>
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <h4 className={`font-bold text-sm sm:text-base ${theme.instructionsText.split(' ')[0]}`}>Instructions:</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {[
                  "Download the template file below",
                  "Fill in your data following the exact format", 
                  "Save as CSV file",
                  "Upload the file below",
                  "Review the preview and confirm import"
                ].map((instruction, index) => (
                  <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full ${theme.iconBg} flex items-center justify-center flex-shrink-0 text-[10px] sm:text-xs font-bold shadow-md`}>
                      {index + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs ${theme.instructionsText.split(' ')[1]}`}>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Upload Area */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={onDownloadTemplate}
                className={`gap-2 sm:gap-3 bg-${theme.primary}-600 hover:bg-${theme.primary}-700 shadow-lg hover:shadow-${theme.primary}-500/25 transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base`}
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Download Template</span>
                <span className="sm:hidden">Template</span>
              </Button>
              <div className="flex-1">
                <div 
                  className={`relative group ${isDragging ? 'scale-[1.02]' : ''} transition-transform duration-200`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={onFileUpload}
                    className={`cursor-pointer h-32 sm:h-48 border-2 border-dashed ${
                      isDragging 
                        ? `border-${theme.primary}-500 bg-${theme.primary}-50` 
                        : 'border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:from-white hover:to-slate-50'
                    } transition-all duration-300 rounded-xl shadow-sm hover:shadow-md`}
                  />
                  {!uploadData.file && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2 sm:p-4">
                      <div className={`p-3 sm:p-6 rounded-full ${theme.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-white/50`}>
                        <Upload className="h-6 w-6 sm:h-10 sm:w-10" />
                      </div>
                      <span className="font-bold text-sm sm:text-xl text-slate-700 mt-2 sm:mt-4 text-center">Upload the csv file</span>
                    </div>
                  )}
                  {/* Drag overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${theme.primary}-50 to-${theme.primary}-100 border-2 border-dashed border-${theme.primary}-400 rounded-xl flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${
                    isDragging ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className={`p-2 sm:p-4 rounded-full ${theme.iconBg} animate-bounce shadow-lg border-2 border-white/50`}>
                      <Upload className="h-4 w-4 sm:h-8 sm:w-8" />
                    </div>
                    <span className="font-bold text-sm sm:text-xl text-center">Drop your CSV file here</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* File type info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-600">Supported format:</span>
                <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white rounded text-[10px] sm:text-xs font-mono border border-slate-200">.csv</code>
              </div>
              <div className="h-3 w-px sm:h-4 sm:w-px bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-600">Max size:</span>
                <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white rounded text-[10px] sm:text-xs font-mono border border-slate-200">10MB</code>
              </div>
            </div>
          </div>

          {/* Enhanced File Preview */}
          {uploadData.file && (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${theme.instructionsBg} border`}>
                <div className={`p-2 rounded-lg ${theme.iconBg} animate-pulse`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className={`font-semibold ${theme.instructionsText.split(' ')[0]}`}>File selected:</span>
                  <p className="text-sm text-slate-600 mt-1">{uploadData.file.name}</p>
                </div>
                <div className="text-xs text-slate-500">
                  {(uploadData.file.size / 1024).toFixed(1)} KB
                </div>
              </div>

              {uploadData.preview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">Preview (first 5 records)</h3>
                  </div>
                  
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className={`bg-gradient-to-r ${theme.gradient}`}>
                          <TableRow>
                            {columns.map((col) => (
                              <TableHead key={col.key} className="whitespace-nowrap text-white font-bold text-sm px-4 py-3">
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadData.preview.map((row, index) => (
                            <TableRow key={index} className="hover:bg-slate-50 transition-colors duration-200">
                              {columns.map((col) => (
                                <TableCell key={col.key} className="whitespace-nowrap px-4 py-3 font-medium">
                                  {row[col.key] || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Total records ready to import</div>
                    <div className="text-2xl font-bold text-slate-900">{uploadData.data.length}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="px-6 py-3 hover:bg-slate-100 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={onConfirm}
                    className={`gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 px-6 py-3`}
                  >
                    <Check className="h-5 w-5" />
                    Import {uploadData.data.length} Records
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
