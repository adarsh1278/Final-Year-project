'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    ArrowLeft,
    Edit,
    Save,
    Lock
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function DepartmentProfile() {
    const [department, setDepartment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        phone: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchDepartmentProfile();
    }, []);

    const fetchDepartmentProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/department/profile');
            setDepartment(response.data);
            setFormData({
                email: response.data.email || '',
                phone: response.data.phone || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                router.push('/department/login');
            }
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            setSubmitting(true);
            await axiosInstance.put('/api/department/profile', formData);
            await fetchDepartmentProfile();
            setEditing(false);
            setSubmitting(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.put('/api/department/profile/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordForm(false);
            setSubmitting(false);
            alert('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Error changing password. Please check your current password.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/department/admin')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Department Profile</h1>
                                <p className="text-sm text-gray-600">Manage your department information</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Profile Card */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center">
                                            <User className="h-5 w-5 mr-2" />
                                            Profile Information
                                        </CardTitle>
                                        <CardDescription>
                                            View and update your department information
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditing(!editing)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        {editing ? 'Cancel' : 'Edit'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Department Name</label>
                                        <div className="mt-1">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className="text-lg py-2 px-4">
                                                    {department.name}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Username</label>
                                        <div className="mt-1">
                                            <Input value={department.username} disabled />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <div className="mt-1">
                                            {editing ? (
                                                <Input
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="Enter email address"
                                                />
                                            ) : (
                                                <Input value={department.email || 'Not provided'} disabled />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Phone</label>
                                        <div className="mt-1">
                                            {editing ? (
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    placeholder="Enter phone number"
                                                />
                                            ) : (
                                                <Input value={department.phone || 'Not provided'} disabled />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {editing && (
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData({
                                                    email: department.email || '',
                                                    phone: department.phone || ''
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleProfileUpdate} disabled={submitting}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Password Change Card */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Lock className="h-5 w-5 mr-2" />
                                    Security Settings
                                </CardTitle>
                                <CardDescription>
                                    Change your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showPasswordForm ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordForm(true)}
                                    >
                                        Change Password
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                placeholder="Enter current password"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setPasswordForm({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handlePasswordChange}
                                                disabled={
                                                    !passwordForm.currentPassword ||
                                                    !passwordForm.newPassword ||
                                                    !passwordForm.confirmPassword ||
                                                    submitting
                                                }
                                            >
                                                {submitting ? 'Updating...' : 'Update Password'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Account Created
                                    </div>
                                    <div className="text-sm">
                                        {new Date(department.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Last Login
                                    </div>
                                    <div className="text-sm">
                                        {department.lastLogin
                                            ? new Date(department.lastLogin).toLocaleString()
                                            : 'Never'
                                        }
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-sm text-gray-600 mb-2">Account Status</div>
                                    <Badge variant={department.isActive ? "default" : "destructive"}>
                                        {department.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-sm text-gray-600 mb-2">Role</div>
                                    <Badge variant="outline">
                                        {department.role}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Permissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {department.permissions && department.permissions.length > 0 ? (
                                        department.permissions.map((permission, index) => (
                                            <Badge key={index} variant="secondary" className="mr-2 mb-2">
                                                {permission.replace('_', ' ')}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No permissions assigned</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
