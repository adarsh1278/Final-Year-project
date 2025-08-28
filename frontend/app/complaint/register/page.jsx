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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { registerComplaint } from '@/services/complaintService';
import VoiceInput from '@/components/VoiceInput';
import Chatbot from '@/components/Chatbot/Chatbot';
import { useTranslation } from 'react-i18next';
import { useAppTranslations } from '@/components/TranslationHelpers';

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
  const { t, translateDepartment } = useAppTranslations();

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
        title: t('complaint.success'),
        description: `${t('complaint.success')} ${response.complaintNumber}`,
        variant: 'success',
      });

      reset();

      setTimeout(() => {
        router.push('/complaint/history');
      }, 2000);

    } catch (error) {
      toast({
        title: t('complaint.error'),
        description: error.response?.data?.message || t('complaint.error'),
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
    <div className="container mx-auto bg-[#f7f9fc]">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2 border-b border-gray-200 font-sans">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-600">
            <Link href="/" className="text-blue-700 hover:underline">{t('nav.home')}</Link> &gt;
            <span className="font-medium text-gray-800"> {t('complaint.register')}</span>
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
              <CardTitle className="text-2xl font-semibold text-[#1a237e]">{t('complaint.register')}</CardTitle>
              <CardDescription className="text-sm text-[#3c3f4a]">
                {t('complaint.descriptionPlaceholder')}
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2 bg-[#d9e1f2] text-[#1a237e]">
                  <TabsTrigger value="form">{t('complaint.formFill')}</TabsTrigger>
                  <TabsTrigger value="chatbot">{t('complaint.chatAssistant')}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="form">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">{t('complaint.department')}</Label>
                      <Select
                        onValueChange={(value) => setValue('department', value)}
                        defaultValue=""
                      >
                        <SelectTrigger className="bg-white border border-gray-300">
                          <SelectValue placeholder={t('complaint.selectDepartment')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electricity">{translateDepartment('Electricity')}</SelectItem>
                          <SelectItem value="Water">{translateDepartment('Water')}</SelectItem>
                          <SelectItem value="Roads">{translateDepartment('Roads')}</SelectItem>
                          <SelectItem value="Sanitation">{translateDepartment('Sanitation')}</SelectItem>
                          <SelectItem value="Parks">{translateDepartment('Parks')}</SelectItem>
                          <SelectItem value="Health">{translateDepartment('Health')}</SelectItem>
                          <SelectItem value="Education">{translateDepartment('Education')}</SelectItem>
                          <SelectItem value="Transportation">{translateDepartment('Transportation')}</SelectItem>
                          <SelectItem value="Building">{translateDepartment('Building')}</SelectItem>
                          <SelectItem value="Environment">{translateDepartment('Environment')}</SelectItem>
                          <SelectItem value="Other">{translateDepartment('Other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-red-600">{errors.department.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">{t('complaint.title')}</Label>
                      <Input
                        id="title"
                        className="border border-gray-300"
                        placeholder={t('complaint.titlePlaceholder')}
                        {...register('title', {
                          required: t('complaint.required')
                        })}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{t('complaint.description')}</Label>
                      <VoiceInput
                        onTranscriptChange={handleVoiceTranscript}
                        className="w-full border border-gray-300"
                        placeholder={t('complaint.descriptionPlaceholder')}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Conditional Fields Based on Department */}
                    {department === 'Electricity' && (
                      <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-medium text-blue-800">{t('complaint.electricityIssue')}</h3>

                        <div className="space-y-2">
                          <Label htmlFor="area">{t('complaint.area')}</Label>
                          <Input
                            id="area"
                            placeholder={t('complaint.areaPlaceholder')}
                            {...register('area')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timing">{t('complaint.timing')}</Label>
                          <Input
                            id="timing"
                            placeholder={t('complaint.timingPlaceholder')}
                            {...register('timing')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t('complaint.frequentIssue')}</Label>
                          <Select onValueChange={(value) => setValue('frequentIssue', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('complaint.selectOption')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">{t('complaint.yes')}</SelectItem>
                              <SelectItem value="false">{t('complaint.no')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {department === 'Water' && (
                      <div className="space-y-4 bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <h3 className="font-medium text-cyan-800">{t('complaint.waterIssue')}</h3>

                        <div className="space-y-2">
                          <Label htmlFor="landmark">{t('complaint.landmark')}</Label>
                          <Input
                            id="landmark"
                            placeholder={t('complaint.landmarkPlaceholder')}
                            {...register('landmark')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t('complaint.severity')}</Label>
                          <Select onValueChange={(value) => setValue('severity', value)} defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{t('priority.low')}</SelectItem>
                              <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                              <SelectItem value="high">{t('priority.high')}</SelectItem>
                              <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{t('complaint.wastageObserved')}</Label>
                          <Select onValueChange={(value) => setValue('wastageObserved', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('complaint.selectOption')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">{t('complaint.yes')}</SelectItem>
                              <SelectItem value="false">{t('complaint.no')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {department && !['Electricity', 'Water'].includes(department) && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-800">{t('complaint.otherIssue')}</h3>

                        <div className="space-y-2">
                          <Label htmlFor="additionalInfo">{t('complaint.additionalInfo')}</Label>
                          <Textarea
                            id="additionalInfo"
                            placeholder={t('complaint.additionalInfoPlaceholder')}
                            {...register('additionalInfo')}
                          />
                        </div>
                      </div>
                    )}
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
                          {t('complaint.submitting')}
                        </>
                      ) : (
                        t('complaint.submit')
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="chatbot">
                <div className="p-6">
                  <Chatbot
                    onComplaintData={handleChatbotData}
                    complaintFromChatbot={complaintFromChatbot}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
