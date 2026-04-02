import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Star, Eye, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";



interface PensionOwner {

  id: string;

  businessName: string;

  ownerName: string;

  email: string;

  phone: string;

  businessId: string;

  status: "pending" | "verified" | "rejected" | "suspended";

  registrationDate: string;

  totalProperties: number;

  totalRevenue: number;

  rating: number;

  documentStatus: "pending" | "approved" | "rejected";

  lastActive: string;

}



interface OwnerCardProps {

  owner: PensionOwner;

  onAction: (action: string, ownerId: string) => void;

}



export function OwnerCard({ owner, onAction }: OwnerCardProps) {

  return (

    <div className="group relative">

      {/* Compact glass morphism container */}

      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transform hover:scale-102 hover:-translate-y-1 transition-all duration-400">

        

        {/* Subtle gradient overlay on hover */}

        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

        

        {/* Small decorative orbs */}

        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl group-hover:from-blue-400/30 group-hover:to-indigo-400/30 transition-all duration-400"></div>

        

        <div className="relative z-10 p-4 sm:p-5">

          {/* Compact Header */}

          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-4">

            {/* Compact Avatar */}

            <div className="relative">

              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-400"></div>

              <Avatar className="relative w-14 h-14 ring-3 ring-white/50 group-hover:ring-4 group-hover:ring-blue-200 transform group-hover:scale-105 transition-all duration-400">

                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg shadow-lg">

                  {(owner.ownerName || 'Unknown Owner').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}

                </AvatarFallback>

              </Avatar>

            </div>

            

            {/* Compact Owner Info */}

            <div className="flex-1 min-w-0 text-center sm:text-left">

              <h3 className="font-black text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors duration-300 truncate">

                {owner.businessName || 'Unknown Business'}

              </h3>

              <p className="font-semibold text-sm text-slate-600 mb-1 group-hover:text-slate-800 transition-colors duration-300 truncate">

                {owner.ownerName || 'Unknown Owner'}

              </p>

              <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300 truncate">

                {owner.email || 'No email'}

              </p>

            </div>

          </div>

          

          {/* Compact Status & Metrics */}

          <div className="flex items-center justify-between mb-4">

            {/* Status Badge */}

            <div className={`

              px-3 py-1 text-xs font-black rounded-full border-2 transform hover:scale-105 transition-all duration-300

              ${owner.status === 'verified' 

                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-700 hover:from-emerald-600 hover:to-green-700 shadow-md' 

                : owner.status === 'pending' 

                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-700 hover:from-amber-600 hover:to-orange-700 shadow-md'

                : owner.status === 'rejected' 

                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-red-700 hover:from-red-600 hover:to-pink-700 shadow-md'

                : 'bg-gradient-to-r from-slate-500 to-gray-600 text-white border-slate-700 hover:from-slate-600 hover:to-gray-700 shadow-md'

              }

            `}>

              <div className="flex items-center gap-1">

                {owner.status === 'verified' && <CheckCircle className="w-3 h-3" />}

                {owner.status === 'pending' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}

                {owner.status === 'rejected' && <XCircle className="w-3 h-3" />}

                {owner.status === 'suspended' && <div className="w-2 h-2 bg-white rounded-full"></div>}

                <span className="font-black">{owner.status}</span>

              </div>

            </div>

            

            {/* Compact Metrics */}

            <div className="flex items-center gap-2">

              {/* Properties Count */}

              <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-black rounded-full border border-purple-600 shadow-md">

                <div className="flex items-center gap-1">

                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>

                  <span>{owner.totalProperties || 0}</span>

                </div>

              </div>

              

              {/* Rating if available */}

              {(owner.rating || 0) > 0 && (

                <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-black rounded-full border border-yellow-600 shadow-md">

                  <div className="flex items-center gap-1">

                    <Star className="w-3 h-3 text-white fill-current" />

                    <span>{owner.rating}</span>

                  </div>

                </div>

              )}

            </div>

          </div>

          

          {/* Compact Action Buttons */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t-2 border-slate-200">

            <div className="flex items-center justify-center sm:justify-start gap-2">

              {/* View Button */}

              <Button 

                size="sm" 

                onClick={() => onAction('view', owner.id)}

                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg border border-blue-700 hover:border-blue-800 transform hover:scale-105 transition-all duration-300 shadow-md"

              >

                <Eye className="w-3 h-3" />

              </Button>

              

              {/* Edit Button */}

              {/* <Button 

                size="sm" 

                onClick={() => onAction('edit', owner.id)}

                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-3 py-1.5 rounded-lg border border-emerald-700 hover:border-emerald-800 transform hover:scale-105 transition-all duration-300 shadow-md"

              >

                <Edit className="w-3 h-3" />

              </Button> */}

            </div>

            

            {/* Conditional Actions */}

            {owner.status === 'pending' && (

              <div className="flex items-center gap-2">

                {/* Verify Button */}

                <Button 

                  size="sm" 

                  onClick={() => onAction('verify', owner.id)}

                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg border border-green-700 hover:border-green-800 transform hover:scale-105 transition-all duration-300 shadow-md"

                >

                  <CheckCircle className="w-3 h-3" />

                </Button>

                

                {/* Reject Button */}

                <Button 

                  size="sm" 

                  onClick={() => onAction('reject', owner.id)}

                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-3 py-1.5 rounded-lg border border-red-700 hover:border-red-800 transform hover:scale-105 transition-all duration-300 shadow-md"

                >

                  <XCircle className="w-3 h-3" />

                </Button>

              </div>

            )}

            

            {/* Delete Button */}

            <Button 

              size="sm" 

              onClick={() => onAction('delete', owner.id)}

              className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-semibold px-3 py-1.5 rounded-lg border border-red-900 hover:border-red-950 transform hover:scale-105 transition-all duration-300 shadow-md"

            >

              <Trash2 className="w-3 h-3" />

            </Button>

          </div>

        </div>

      </div>

    </div>

  );

}

