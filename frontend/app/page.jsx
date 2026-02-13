'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, MessageSquare, CheckCircle, Clock, Shield, Users, FileText,
  ArrowRight, Phone, Zap, BarChart3, Globe, ChevronRight, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const [complaintNumber, setComplaintNumber] = useState('');
  const { t } = useTranslation();
  const router = useRouter();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (complaintNumber.trim()) {
      router.push(`/track/${complaintNumber.trim()}`);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const departments = [
    'Electricity', 'Water Supply', 'Roads & Infrastructure', 'Sanitation',
    'Health Services', 'Education', 'Transportation', 'Building & Construction',
    'Parks & Recreation', 'Environment', 'Other'
  ];

  const stats = [
    { value: '2,45,000+', label: 'Grievances Resolved', icon: <CheckCircle className="h-6 w-6" /> },
    { value: '11', label: 'Departments', icon: <Users className="h-6 w-6" /> },
    { value: '98%', label: 'Satisfaction Rate', icon: <BarChart3 className="h-6 w-6" /> },
    { value: '48 hrs', label: 'Avg. Response Time', icon: <Clock className="h-6 w-6" /> },
  ];

  const features = [
    {
      icon: <MessageSquare className="h-7 w-7 text-blue-600" />,
      title: t('home.features.easy.title'),
      description: t('home.features.easy.description'),
      color: 'bg-blue-50 border-blue-200',
    },
    {
      icon: <Search className="h-7 w-7 text-green-600" />,
      title: t('home.features.realtime.title'),
      description: t('home.features.realtime.description'),
      color: 'bg-green-50 border-green-200',
    },
    {
      icon: <Globe className="h-7 w-7 text-orange-600" />,
      title: t('home.features.multilingual.title'),
      description: t('home.features.multilingual.description'),
      color: 'bg-orange-50 border-orange-200',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Register', desc: 'Create an account with your details', icon: <Users className="h-8 w-8" /> },
    { step: '02', title: 'File Complaint', desc: 'Submit your grievance online or via chatbot', icon: <FileText className="h-8 w-8" /> },
    { step: '03', title: 'Track Status', desc: 'Monitor progress in real-time', icon: <Search className="h-8 w-8" /> },
    { step: '04', title: 'Resolution', desc: 'Get timely resolution from departments', icon: <CheckCircle className="h-8 w-8" /> },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-medium mb-6">
                <Shield className="h-3.5 w-3.5" />
                Government of India Initiative
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Public Grievance
                <span className="block text-yellow-400">Redressal Portal</span>
              </h1>

              <p className="text-lg text-blue-200 mb-8 leading-relaxed max-w-lg">
                {t('home.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/complaint/register">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-6 shadow-lg shadow-yellow-500/20">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {t('home.registerComplaint')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 px-6">
                    Create Account <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Track complaint card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">
                      {t('complaint.track')}
                    </h2>
                  </div>
                  <p className="text-sm text-blue-200 mb-5">Enter your complaint number to check current status</p>

                  <form onSubmit={handleTrackSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="complaintNumber" className="text-sm font-medium text-blue-200 mb-1.5 block">
                        {t('complaint.complaintNumber')}
                      </label>
                      <Input
                        id="complaintNumber"
                        placeholder={t('complaint.trackPlaceholder')}
                        value={complaintNumber}
                        onChange={(e) => setComplaintNumber(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50 h-12 text-base focus:ring-yellow-400 focus:border-yellow-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold h-12 text-base shadow-md"
                      disabled={!complaintNumber.trim()}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t('complaint.trackButton')}
                    </Button>
                  </form>

                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-xs text-blue-300 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-400" />
                      Your complaint number was shared via email when you registered the grievance. Example: ELE-1770950661398-7645
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 border-y border-blue-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={idx}
                className="text-center"
              >
                <div className="flex justify-center mb-2 text-yellow-400">{stat.icon}</div>
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-300 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={0}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {t('home.features.title')}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Empowering citizens with a transparent and efficient grievance management system</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={idx + 1}
              >
                <Card className={`border ${feature.color} h-full hover:shadow-lg transition-shadow duration-300`}>
                  <CardContent className="p-7">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={0}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Four simple steps to get your grievance resolved</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={idx + 1}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 mb-4 border border-blue-100">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-yellow-600 mb-1">STEP {item.step}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 text-gray-300">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={0}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Departments</h2>
            <p className="text-gray-500">File grievances across multiple government departments</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {departments.map((dept, idx) => (
              <motion.div
                key={dept}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} custom={idx * 0.05}
              >
                <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-default shadow-sm">
                  {dept}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 md:p-14 text-center relative overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Start Using Our Services Today
              </h2>
              <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied citizens who have successfully resolved their grievances through our portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold px-8 shadow-lg">
                    {t('nav.signup')} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/complaint/register">
                  <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8">
                    {t('home.registerComplaint')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notice bar */}
      <section className="bg-yellow-50 border-y border-yellow-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3 text-sm">
            <Zap className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Important Notice</p>
              <p className="text-yellow-700">
                This portal is only for public grievances. For emergencies, please dial 112. All complaints are processed within 30 working days as per government norms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
