'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, User, Phone, Mail, Globe, Calendar, MapPin, Building, AlertTriangle, Loader2, CheckCircle, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/services/axiosInstance';
import { useToast } from '@/hooks/use-toast';

const indianStates = [
  '', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' }
];

export default function EditProfilePage() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    dob: '',
    languagePreference: 'en',
    gender: 'Male',
    idType: '',
    idNumber: '',
    occupation: ''
  });

  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, sms: true });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', isChanging: false });
  const [emailVerifyCode, setEmailVerifyCode] = useState('');
  const [phoneVerifyCode, setPhoneVerifyCode] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  // Load current user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || '',
        dob: user.dob || '',
        languagePreference: user.languagePreference || 'en',
        gender: user.gender || 'Male',
        idType: user.idType || '',
        idNumber: user.idNumber || '',
        occupation: user.occupation || ''
      });
      if (user.notificationPreferences) {
        setNotificationPrefs({
          email: !!user.notificationPreferences.email,
          sms: !!user.notificationPreferences.sms
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { email, ...updateData } = formData; // email can't be changed
      updateData.notificationPreferences = notificationPrefs;
      const res = await axiosInstance.put('/api/auth/profile', updateData);
      
      // Refresh user data in AuthContext
      await refreshUser();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "success",
      });
      
      // Small delay then redirect to profile
      setTimeout(() => router.push('/profile'), 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sendVerification = async (type) => {
    try {
      if (type === 'email') setEmailSending(true);
      if (type === 'phone') setPhoneSending(true);
      const res = await axiosInstance.post('/api/auth/send-verification', { type });
      toast({ title: 'Sent', description: res.data?.message || 'Code sent', variant: 'success' });
    } catch (err) {
      console.error('sendVerification err', err);
      toast({ title: 'Send failed', description: err.response?.data?.message || 'Failed to send', variant: 'destructive' });
    } finally {
      setEmailSending(false); setPhoneSending(false);
    }
  };

  const verifyCodeHandler = async (type) => {
    try {
      if (type === 'email') setVerifyingEmail(true);
      if (type === 'phone') setVerifyingPhone(true);
      const token = type === 'email' ? emailVerifyCode.trim() : phoneVerifyCode.trim();
      const res = await axiosInstance.post('/api/auth/verify', { type, token });
      toast({ title: 'Verified', description: res.data?.message || 'Verified', variant: 'success' });
      await refreshUser();
      setEmailVerifyCode(''); setPhoneVerifyCode('');
    } catch (err) {
      console.error('verify err', err);
      toast({ title: 'Verify failed', description: err.response?.data?.message || 'Invalid or expired code', variant: 'destructive' });
    } finally {
      setVerifyingEmail(false); setVerifyingPhone(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }

    try {
      setPasswordForm(prev => ({ ...prev, isChanging: true }));
      const res = await axiosInstance.patch('/api/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast({ title: 'Password Changed', description: res.data?.message || 'Password updated', variant: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', isChanging: false });
    } catch (err) {
      console.error('Password change error', err);
      toast({ title: 'Change Failed', description: err.response?.data?.message || 'Failed to change password', variant: 'destructive' });
      setPasswordForm(prev => ({ ...prev, isChanging: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!user) return null;

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
                          <Input name="name" value={formData.name} onChange={handleChange} className="pl-10 h-11" required />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="email" name="email" value={formData.email} className="pl-10 h-11 bg-gray-100 cursor-not-allowed" disabled />
                          {!user.emailVerified && (
                            <div className="ml-3">
                              <Button type="button" size="sm" onClick={() => sendVerification('email')} disabled={emailSending} className="h-9 px-3">{emailSending ? 'Sending...' : 'Send Verify'}</Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">Email cannot be changed</p>
                        {!user.emailVerified && (
                          <div className="mt-2 flex items-center gap-2">
                            <Input placeholder="Enter email code" value={emailVerifyCode} onChange={(e) => setEmailVerifyCode(e.target.value)} className="h-9 w-40" />
                            <Button type="button" onClick={() => verifyCodeHandler('email')} disabled={verifyingEmail} className="h-9 px-3">{verifyingEmail ? 'Verifying...' : 'Verify'}</Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                        <div className="relative flex items-center">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input name="phone" value={formData.phone} placeholder="e.g. 9876543210" className="pl-10 h-11 bg-gray-100 cursor-not-allowed" disabled readOnly />
                          {formData.phone && !user.phoneVerified && (
                            <div className="ml-3">
                              <Button type="button" size="sm" onClick={() => sendVerification('phone')} disabled={phoneSending} className="h-9 px-3">{phoneSending ? 'Sending...' : 'Send SMS'}</Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">Mobile number cannot be changed</p>
                        {!user.phoneVerified && (
                          <div className="mt-2 flex items-center gap-2">
                            <Input placeholder="Enter SMS code" value={phoneVerifyCode} onChange={(e) => setPhoneVerifyCode(e.target.value)} className="h-9 w-40" />
                            <Button type="button" onClick={() => verifyCodeHandler('phone')} disabled={verifyingPhone} className="h-9 px-3">{verifyingPhone ? 'Verifying...' : 'Verify'}</Button>
                          </div>
                        )}
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
                          <Input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Engineer, Teacher" className="pl-10 h-11" />
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
                          <Input name="address" value={formData.address} onChange={handleChange} placeholder="House No, Street, Locality" className="pl-10 h-11" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">District</Label>
                        <Input name="district" value={formData.district} onChange={handleChange} placeholder="Enter district" className="h-11" />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">State</Label>
                        <select name="state" value={formData.state} onChange={handleChange}
                          className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                          {indianStates.map(s => (
                            <option key={s} value={s}>{s || 'Select State'}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">PIN Code</Label>
                        <Input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 110001" className="h-11" maxLength={6} />
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
                          <option value="">Select ID Type</option>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="PAN">PAN Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">ID Number</Label>
                        <Input name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Enter ID number" className="h-11" />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Preferred Language</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <select name="languagePreference" value={formData.languagePreference} onChange={handleChange}
                            className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                      {/* Notification Preferences */}
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Globe className="h-4 w-4" /> Notification Preferences
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" checked={notificationPrefs.email} onChange={(e) => setNotificationPrefs(prev => ({ ...prev, email: e.target.checked }))} />
                            <span className="text-sm">Email Notifications</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" checked={notificationPrefs.sms} onChange={(e) => setNotificationPrefs(prev => ({ ...prev, sms: e.target.checked }))} />
                            <span className="text-sm">SMS Notifications</span>
                          </label>
                        </div>
                      </div>

                      {/* Change Password */}
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Lock className="h-4 w-4" /> Change Password
                        </h3>
                        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                          <div>
                            <Label className="text-sm">Current Password</Label>
                            <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} className="h-11" />
                          </div>
                          <div>
                            <Label className="text-sm">New Password</Label>
                            <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} className="h-11" />
                          </div>
                          <div>
                            <Label className="text-sm">Confirm New Password</Label>
                            <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} className="h-11" />
                          </div>
                          <div className="flex gap-3">
                            <Button type="submit" disabled={passwordForm.isChanging} className="h-10 px-4 bg-slate-800 text-white">
                              {passwordForm.isChanging ? 'Saving...' : 'Change Password'}
                            </Button>
                          </div>
                        </form>
                      </div>
                  </div>

                  {/* Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Please ensure that all information provided is accurate. Changes will be saved to your account immediately.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" asChild className="h-11 px-6">
                      <Link href="/profile">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSaving} className="h-11 px-6 bg-blue-800 hover:bg-blue-900 text-white font-semibold">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
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
