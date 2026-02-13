'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Shield, ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supportedLanguages } from '@/utils/translator';

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', languagePreference: 'en' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = data;
      await signup(userData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 h-[35%]"></div>
      <div className="absolute bottom-0 inset-x-0 bg-gray-50 h-[65%]"></div>

      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8 items-start">
          {/* Left info panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 text-white pt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">New Registration</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Create Your<br />
              <span className="text-yellow-400">Citizen Account</span>
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Register to access all grievance services. Your data is protected under the IT Act, 2000.
            </p>
            <div className="space-y-3 text-sm">
              {['File complaints online 24x7', 'Track real-time status updates', 'Multilingual chatbot assistance', 'Rate and review resolutions'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-blue-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Signup form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3"
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="pb-2 pt-8 px-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-lg bg-blue-900 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Citizen Registration</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Fill in your details to create an account</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4 px-8 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                      <Input id="name" placeholder="John Doe" className="h-11" {...register('name', { required: 'Name is required' })} />
                      {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <Input id="email" type="email" placeholder="your@email.com" className="h-11" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })} />
                      {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input id="phone" placeholder="9876543210" className="h-11" {...register('phone', { required: 'Phone required', pattern: { value: /^[0-9]{10}$/, message: '10 digits required' } })} />
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="h-11 pr-10" {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Re-enter password" className="h-11" {...register('confirmPassword', { required: 'Confirm password', validate: v => v === password || 'Passwords do not match' })} />
                      {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="languagePreference" className="text-sm font-medium text-gray-700">Preferred Language</Label>
                    <Select onValueChange={(value) => setValue('languagePreference', value)} defaultValue="en">
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              {lang.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
                  <Button type="submit" className="w-full h-11 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-base" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                    ) : (
                      <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-700 hover:underline font-medium">Log in</Link>
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-3 border-t text-gray-400 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    This is a secure Government of India website
                  </div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
