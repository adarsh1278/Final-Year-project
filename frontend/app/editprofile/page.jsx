'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Save, User, Phone, Mail, Globe, Calendar, MapPin, Building, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: 'Delhi',
    pincode: '',
    dob: '1980-01-01',
    preferredLanguage: 'English',
    gender: 'Male',
    idType: 'Aadhaar',
    idNumber: '',
    occupation: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      {/* Breadcrumb */}
      <div className="bg-white py-2.5 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <Link href="/" className="text-blue-700 hover:underline">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/profile" className="text-blue-700 hover:underline">Profile</Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-800">Edit Profile</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-0 shadow-xl overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-6 px-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Edit Profile</CardTitle>
                  <p className="text-blue-200 text-sm mt-0.5">Update your personal information</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleSubmit}>
                {/* Avatar Section */}
                <div className="flex justify-center py-6 bg-gray-50 border-b">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      <User size={56} className="text-blue-500" />
                    </div>
                    <button type="button" className="absolute bottom-1 right-1 bg-blue-800 text-white p-2 rounded-full shadow-md hover:bg-blue-900 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-8 space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input name="fullName" value={formData.fullName} onChange={handleChange} className="pl-10 h-11" required />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="email" name="email" value={formData.email} onChange={handleChange} className="pl-10 h-11" required />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Mobile Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-10 h-11" required />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="date" name="dob" value={formData.dob} onChange={handleChange} className="pl-10 h-11" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Gender</Label>
                        <select name="gender" value={formData.gender} onChange={handleChange}
                          className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Occupation</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input name="occupation" value={formData.occupation} onChange={handleChange} className="pl-10 h-11" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2 space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input name="address" value={formData.address} onChange={handleChange} className="pl-10 h-11" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">District</Label>
                        <Input name="district" value={formData.district} onChange={handleChange} className="h-11" />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">State</Label>
                        <select name="state" value={formData.state} onChange={handleChange}
                          className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                          <option value="Delhi">Delhi</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Gujarat">Gujarat</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">PIN Code</Label>
                        <Input name="pincode" value={formData.pincode} onChange={handleChange} className="h-11" />
                      </div>
                    </div>
                  </div>

                  {/* Identity & Preferences */}
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Identity & Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">ID Type</Label>
                        <select name="idType" value={formData.idType} onChange={handleChange}
                          className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="PAN">PAN Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">ID Number</Label>
                        <Input name="idNumber" value={formData.idNumber} onChange={handleChange} className="h-11" />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Preferred Language</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}
                            className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Bengali">Bengali</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Marathi">Marathi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Please ensure that all information provided is accurate. Fields marked with * are mandatory.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" asChild className="h-11 px-6">
                      <Link href="/profile">Cancel</Link>
                    </Button>
                    <Button type="submit" className="h-11 px-6 bg-blue-800 hover:bg-blue-900 text-white font-semibold">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
