'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Loader2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="min-h-screen bg-[#fdf6ec] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-300 rounded-lg shadow-sm bg-white">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-3xl font-serif font-semibold tracking-wide text-gray-800">
              {t('auth.citizenLogin')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {t('auth.enterCredentials')}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email', {
                    required: t('auth.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('auth.validEmail')
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Link
                    href="#"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: t('auth.passwordRequired'),
                    minLength: {
                      value: 8,
                      message: t('auth.passwordMin')
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.signingIn')}
                  </>
                ) : (
                  t('auth.loginButton')
                )}
              </Button>

              <p className="text-sm text-center text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link href="/signup" className="text-blue-700 hover:underline font-medium">
                  {t('auth.signupHere')}
                </Link>
              </p>

              <p className="text-sm text-center text-gray-600">
                {t('auth.departmentLogin')}{' '}
                <Link href="/department/login" className="text-blue-700 hover:underline font-medium">
                  {t('auth.loginHere')}
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 pt-4 border-t text-gray-500 text-xs">
                <Lock className="w-4 h-4" />
                This is a secure Government of India website
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
