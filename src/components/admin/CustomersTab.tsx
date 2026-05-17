import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalBookings: number;
  joinedAt: string;
}

interface CustomersTabProps {
  customers: Customer[];
}

export function CustomersTab({ customers = [] }: CustomersTabProps) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    return customers.filter(c => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-slate-700 mb-0.5">{customers.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-blue-700 mb-0.5">
              {customers.filter(c => c.totalBookings > 0).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Bookers</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-emerald-700 mb-0.5">
              {customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Bookings Made</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-3xl opacity-50"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-2xl p-6 sm:p-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Customer</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6">Contact</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">Total Bookings</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-center">Status</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4 px-6 text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <div className="text-slate-500 text-lg font-medium">No customers found</div>
                        <div className="text-slate-400 text-sm mt-1">Try adjusting your search filters.</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {customer.name?.substring(0, 2).toUpperCase() || 'CU'}
                            </div>
                            <span className="font-semibold text-slate-900">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold">
                            {customer.totalBookings}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge className={`${
                            customer.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                          }`}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right text-sm text-slate-500">
                          <div className="flex items-center justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(customer.joinedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
