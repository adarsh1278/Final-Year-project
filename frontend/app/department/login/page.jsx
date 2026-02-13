'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Building2, Shield, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { departmentLogin } = useAuth();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await departmentLogin(data.username, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 h-[45%]"></div>
      <div className="absolute bottom-0 inset-x-0 bg-gray-50 h-[55%]"></div>

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8 items-start">
          {/* Left info panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 text-white pt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Department Access</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Department<br />
              <span className="text-yellow-400">Control Panel</span>
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Access the department dashboard to manage, respond to, and resolve citizen grievances.
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-300 text-sm">Restricted Access</p>
                  <p className="text-blue-200 text-xs mt-1">This login is for authorized government department personnel only. Unauthorized access attempts are logged and monitored.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Login form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3"
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="pb-2 pt-8 px-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Department Login</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Enter your department credentials</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-5 px-8 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <Input
                      id="username"
                      placeholder="department_username"
                      className="h-11"
                      {...register('username', { required: 'Username is required' })}
                    />
                    {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                      <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="h-11 pr-10"
                        {...register('password', { required: 'Password is required' })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</>
                    ) : (
                      <>Login to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  <p className="text-sm text-center text-gray-600">
                    Are you a citizen?{' '}
                    <Link href="/login" className="text-blue-700 hover:underline font-medium">Citizen Login</Link>
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-3 border-t text-gray-400 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    Secure Government Portal | IT Act, 2000 Compliant
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
