import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

export function CustomersTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg sm:ml-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Customers Management</h2>
            <p className="text-slate-600">View and manage registered customers</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-2xl p-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Name</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Email</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Phone</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Total Bookings</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Placeholder empty state for customers */}
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="text-slate-500 text-lg">No customers found</div>
                    <div className="text-slate-400 text-sm mt-2">Data will be populated when endpoints are integrated.</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
