'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Users,
    TrendingUp,
    Calendar,
    MessageSquare
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DepartmentAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [department, setDepartment] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, complaintsResponse, profileResponse] = await Promise.all([
                axiosInstance.get('/api/department/dashboard/stats'),
                axiosInstance.get('/api/department/complaints?limit=5'),
                axiosInstance.get('/api/department/profile')
            ]);

            setStats(statsResponse.data);
            setComplaints(complaintsResponse.data.complaints);
            setDepartment(profileResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) {
                router.push('/department/login');
            }
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/api/department/logout');
            router.push('/department/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-500';
            case 'in_progress': return 'bg-yellow-500';
            case 'resolved': return 'bg-green-500';
            case 'closed': return 'bg-gray-500';
            case 'rejected': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const statusData = stats?.statusStats?.map(stat => ({
        name: stat._id,
        value: stat.count
    })) || [];

    const priorityData = stats?.priorityStats?.map(stat => ({
        name: stat._id,
        value: stat.count
    })) || [];

    const monthlyData = stats?.monthlyStats?.map(stat => ({
        month: `${stat._id.month}/${stat._id.year}`,
        complaints: stat.count
    })).reverse() || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {stats?.department} Department
                            </h1>
                            <p className="text-sm text-gray-600">Welcome back, {department?.username}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/department/admin/complaints')}
                            >
                                View All Complaints
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/department/admin/profile')}
                            >
                                Profile
                            </Button>
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalComplaints || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats?.statusStats?.find(s => s._id === 'open')?.count || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats?.statusStats?.find(s => s._id === 'resolved')?.count || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Resolution Days</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(stats?.avgResolutionDays || 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="recent">Recent Complaints</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Priority Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={priorityData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Complaint Trends</CardTitle>
                                <CardDescription>
                                    Complaint volume over the last 12 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="complaints"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Complaints</CardTitle>
                                <CardDescription>Latest complaints in your department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {complaints.map((complaint) => (
                                        <div
                                            key={complaint._id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.push(`/department/admin/complaints/${complaint._id}`)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <Badge className={getPriorityColor(complaint.priority)}>
                                                        {complaint.priority}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        #{complaint.complaintNumber}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium">{complaint.title || 'Untitled'}</h3>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {complaint.description}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <Badge className={`${getStatusColor(complaint.status)} text-white`}>
                                                    {complaint.status}
                                                </Badge>
                                                {complaint.feedback && complaint.feedback.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <MessageSquare className="h-3 w-3 mr-1" />
                                                        {complaint.feedback.length}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
