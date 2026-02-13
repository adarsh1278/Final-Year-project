'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Loader2, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] relative">
      {/* Background split */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 h-[45%]"></div>
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
              <Shield className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Secure Login</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Welcome to<br />
              <span className="text-yellow-400">GrievEase Portal</span>
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Login to file grievances, track complaint status, and communicate with departments in real-time.
            </p>

            <div className="space-y-3 text-sm">
              {[
                'File complaints across 11 departments',
                'Real-time status tracking',
                'Direct chat with departments',
                'Multilingual support'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-blue-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  {item}
                </div>
              ))}
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
                  <div className="h-10 w-10 rounded-lg bg-blue-900 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {t('auth.citizenLogin')}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {t('auth.enterCredentials')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-5 px-8 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-11"
                      {...register('email', {
                        required: t('auth.emailRequired'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('auth.validEmail')
                        }
                      })}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">{t('auth.password')}</Label>
                      <Link href="#" className="text-xs text-blue-600 hover:underline">{t('auth.forgotPassword')}</Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="h-11 pr-10"
                        {...register('password', {
                          required: t('auth.passwordRequired'),
                          minLength: { value: 8, message: t('auth.passwordMin') }
                        })}
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
                    className="w-full h-11 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.signingIn')}</>
                    ) : (
                      <>{t('auth.loginButton')} <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  <div className="grid grid-cols-1 gap-2 text-sm text-center">
                    <p className="text-gray-600">
                      {t('auth.noAccount')}{' '}
                      <Link href="/signup" className="text-blue-700 hover:underline font-medium">{t('auth.signupHere')}</Link>
                    </p>
                    <p className="text-gray-600">
                      {t('auth.departmentLogin')}{' '}
                      <Link href="/department/login" className="text-blue-700 hover:underline font-medium">{t('auth.loginHere')}</Link>
                    </p>
                  </div>

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
