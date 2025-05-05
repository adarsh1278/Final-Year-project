'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { registerComplaint } from '@/services/complaintService';
import VoiceInput from '@/components/VoiceInput';
import Chatbot from '@/components/Chatbot/Chatbot';

export default function RegisterComplaintPage() {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      department: '',
      title: '',
      description: '',
      area: '',
      landmark: '',
      severity: 'medium',
      additionalInfo: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [complaintFromChatbot, setComplaintFromChatbot] = useState(null);

  const department = watch('department');
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const complaintData = {
        department: data.department,
        title: data.title,
        description: data.description,
        additionalDetails: {}
      };

      if (data.department === 'Electricity') {
        complaintData.additionalDetails = {
          area: data.area,
          timing: data.timing || 'Not specified',
          frequentIssue: data.frequentIssue === 'true'
        };
      } else if (data.department === 'Water') {
        complaintData.additionalDetails = {
          landmark: data.landmark,
          severity: data.severity,
          wastageObserved: data.wastageObserved === 'true'
        };
      } else {
        complaintData.additionalDetails = {
          generalInfo: data.additionalInfo
        };
      }

      const response = await registerComplaint(complaintData);

      toast({
        title: 'Complaint Registered',
        description: `Your complaint has been successfully registered with number: ${response.complaintNumber}`,
        variant: 'success',
      });

      reset();

      setTimeout(() => {
        router.push('/complaint/history');
      }, 2000);

    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to register complaint',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatbotData = (data, isSubmitted) => {
    setComplaintFromChatbot(data);

    if (isSubmitted && data) {
      const formattedData = {
        department: data.department,
        title: data.title,
        description: data.description,
        ...data.additionalDetails
      };

      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });

      handleSubmit(onSubmit)();
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setValue('description', transcript);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto  bg-[#f7f9fc]">

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2 border-b border-gray-200 font-sans">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-600">
            <Link href="/" className="text-blue-700 hover:underline">Home</Link> &gt; 
            <span className="font-medium text-gray-800"> Register Complaint</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border border-gray-300 rounded-xl bg-white">
            <CardHeader className="bg-[#e8edf5] rounded-t-xl border-b border-gray-300 p-6">
              <CardTitle className="text-2xl font-semibold text-[#1a237e]">Register a Complaint</CardTitle>
              <CardDescription className="text-sm text-[#3c3f4a]">
                Fill out the form to register your complaint or use the chatbot for assistance
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2 bg-[#d9e1f2] text-[#1a237e]">
                  <TabsTrigger value="form">Form</TabsTrigger>
                  <TabsTrigger value="chatbot">Chatbot Assistant</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="form">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        onValueChange={(value) => setValue('department', value)}
                        defaultValue=""
                      >
                        <SelectTrigger className="bg-white border border-gray-300">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electricity">Electricity</SelectItem>
                          <SelectItem value="Water">Water</SelectItem>
                          <SelectItem value="Roads">Roads</SelectItem>
                          <SelectItem value="Sanitation">Sanitation</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-red-600">{errors.department.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Complaint Title</Label>
                      <Input
                        id="title"
                        className="border border-gray-300"
                        placeholder="Brief title of your complaint"
                        {...register('title', {
                          required: 'Title is required'
                        })}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <VoiceInput
                        onTranscriptChange={handleVoiceTranscript}
                        className="w-full border border-gray-300"
                        placeholder="Describe your complaint in detail. You can type or click the microphone icon to speak."
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Conditional Fields */}
                    {/* ...no change to conditional fields logic or content */}
                  </CardContent>

                  <CardFooter className="p-6">
                    <Button
                      type="submit"
                      className="w-full bg-[#1a237e] hover:bg-[#0d1545] text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register Complaint'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="chatbot" className="pt-4 px-6 pb-6">
                <Chatbot />


              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>


    </div>
  );
}
