'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, MessageSquare, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const [complaintNumber, setComplaintNumber] = useState('');
  const { t } = useTranslation();
  const router = useRouter();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (complaintNumber) {
      router.push(`/track/${complaintNumber}`);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: t('home.features.easy.title'),
      description: t('home.features.easy.description')
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: t('home.features.realtime.title'),
      description: t('home.features.realtime.description')
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: t('home.features.multilingual.title'),
      description: t('home.features.multilingual.description')
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#f5efe6] py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-primary text-blue-950">
                GRIEVEASE
              </h1>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-2 text-primary text-blue-950">
                {t('home.title')}
              </h2>
              <p className="uppercase tracking-wide text-sm font-semibold text-muted-foreground mt-4 mb-2">
                Efficient | Transparent | Accountable
              </p>
              <p className="text-base text-muted-foreground mb-6">
                {t('home.description')}
              </p>
            </motion.div>

            <motion.div
              className="md:w-1/2 bg-white border border-border rounded-lg shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4 text-primary">
                {t('complaint.track')}
              </h2>
              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="complaintNumber" className="text-sm font-medium mb-1 block">
                    {t('complaint.complaintNumber')}
                  </label>
                  <Input
                    id="complaintNumber"
                    placeholder={t('complaint.trackPlaceholder')}
                    value={complaintNumber}
                    onChange={(e) => setComplaintNumber(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={!complaintNumber}
                >
                  {t('complaint.trackButton')}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-primary"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            {t('home.features.title')}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={index + 1}
                className="bg-white border border-border rounded-lg p-8 text-center shadow-sm"
              >
                <div className="flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Start Using Our Services Today</h2>
            <p className="mb-8 md:w-3/4 mx-auto">
              Join thousands of satisfied citizens who have successfully resolved their grievances through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  {t('nav.signup')}
                </Button>
              </Link>
              <Link href="/complaint/register">
                <Button size="lg" variant="outline" className="bg-primary/20 border-primary-foreground/20">
                  {t('home.registerComplaint')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}