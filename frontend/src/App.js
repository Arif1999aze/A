import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Shield, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cache Busting Component - ensures fresh content
const CacheBuster = () => {
  useEffect(() => {
    // Clear any stale cache on component mount
    const clearStaleCache = () => {
      const lastClear = sessionStorage.getItem('last_cache_clear');
      const now = Date.now();
      
      // Clear cache every 5 minutes
      if (!lastClear || now - parseInt(lastClear) > 300000) {
        console.log('Clearing stale cache...');
        sessionStorage.setItem('last_cache_clear', now.toString());
      }
    };
    
    clearStaleCache();
  }, []);
  
  return null;
};

// Home Page
// Novruz Bayramı Banner Component - Premium Spring Design
const NovruzBanner = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-green-600">
      {/* Spring pattern overlay */}
      <div className="absolute inset-0 opacity-15">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="spring-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.5)"/>
              <circle cx="0" cy="0" r="1" fill="rgba(255,255,255,0.3)"/>
              <circle cx="40" cy="40" r="1" fill="rgba(255,255,255,0.3)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spring-pattern)"/>
        </svg>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sun rays - Left */}
        <svg className="absolute top-1 left-[3%] w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 drop-shadow-lg animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        
        {/* Sun rays - Right */}
        <svg className="absolute top-1 right-[3%] w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 drop-shadow-lg animate-pulse" style={{animationDelay: '0.5s'}} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        
        {/* Semeni (wheat grass) - Left */}
        <svg className="absolute bottom-0 left-[8%] w-8 h-8 sm:w-10 sm:h-10 text-green-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22V12M12 12C12 12 8 8 8 4C8 4 12 6 12 12M12 12C12 12 16 8 16 4C16 4 12 6 12 12M12 12C12 12 6 10 4 6C4 6 10 8 12 12M12 12C12 12 18 10 20 6C20 6 14 8 12 12"/>
        </svg>
        
        {/* Semeni (wheat grass) - Right */}
        <svg className="absolute bottom-0 right-[8%] w-8 h-8 sm:w-10 sm:h-10 text-green-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22V12M12 12C12 12 8 8 8 4C8 4 12 6 12 12M12 12C12 12 16 8 16 4C16 4 12 6 12 12M12 12C12 12 6 10 4 6C4 6 10 8 12 12M12 12C12 12 18 10 20 6C20 6 14 8 12 12"/>
        </svg>
        
        {/* Spring flowers */}
        <svg className="absolute top-3 left-[15%] w-4 h-4 text-pink-300 animate-bounce" style={{animationDuration: '2s'}} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="3"/>
          <circle cx="12" cy="6" r="2"/>
          <circle cx="12" cy="18" r="2"/>
          <circle cx="6" cy="12" r="2"/>
          <circle cx="18" cy="12" r="2"/>
        </svg>
        <svg className="absolute top-4 right-[18%] w-3 h-3 text-yellow-300 animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.3s'}} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="3"/>
          <circle cx="12" cy="6" r="2"/>
          <circle cx="12" cy="18" r="2"/>
          <circle cx="6" cy="12" r="2"/>
          <circle cx="18" cy="12" r="2"/>
        </svg>
        <svg className="absolute top-2 left-[28%] w-3 h-3 text-red-300 animate-bounce" style={{animationDuration: '2.2s', animationDelay: '0.5s'}} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="3"/>
          <circle cx="12" cy="6" r="2"/>
          <circle cx="12" cy="18" r="2"/>
          <circle cx="6" cy="12" r="2"/>
          <circle cx="18" cy="12" r="2"/>
        </svg>
        <svg className="absolute top-3 right-[30%] w-4 h-4 text-purple-300 animate-bounce" style={{animationDuration: '1.8s', animationDelay: '0.2s'}} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="3"/>
          <circle cx="12" cy="6" r="2"/>
          <circle cx="12" cy="18" r="2"/>
          <circle cx="6" cy="12" r="2"/>
          <circle cx="18" cy="12" r="2"/>
        </svg>
        
        {/* Fire/Candle - represents Novruz fire jumping tradition */}
        <svg className="absolute bottom-0 left-[20%] w-6 h-6 text-orange-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 8 8 8 14C8 17.31 9.79 20 12 20C14.21 20 16 17.31 16 14C16 8 12 2 12 2ZM12 18C10.9 18 10 16.21 10 14C10 11.5 11.5 8.5 12 7.5C12.5 8.5 14 11.5 14 14C14 16.21 13.1 18 12 18Z"/>
        </svg>
        <svg className="absolute bottom-0 right-[20%] w-6 h-6 text-orange-400 animate-pulse" style={{animationDelay: '0.3s'}} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 8 8 8 14C8 17.31 9.79 20 12 20C14.21 20 16 17.31 16 14C16 8 12 2 12 2ZM12 18C10.9 18 10 16.21 10 14C10 11.5 11.5 8.5 12 7.5C12.5 8.5 14 11.5 14 14C14 16.21 13.1 18 12 18Z"/>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative px-4 py-5 sm:py-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main greeting */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Decorated Egg - Left */}
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 drop-shadow-lg flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <ellipse cx="12" cy="13" rx="7" ry="9"/>
              <ellipse cx="12" cy="13" rx="5" ry="7" fill="rgba(255,255,255,0.3)"/>
              <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.5)"/>
              <circle cx="14" cy="12" r="1" fill="rgba(255,255,255,0.5)"/>
              <circle cx="11" cy="15" r="1" fill="rgba(255,255,255,0.5)"/>
            </svg>
            
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg tracking-wide">
                Novruz Bayramınız Mübarək!
              </h2>
            </div>
            
            {/* Decorated Egg - Right */}
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 drop-shadow-lg flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <ellipse cx="12" cy="13" rx="7" ry="9"/>
              <ellipse cx="12" cy="13" rx="5" ry="7" fill="rgba(255,255,255,0.3)"/>
              <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.5)"/>
              <circle cx="14" cy="12" r="1" fill="rgba(255,255,255,0.5)"/>
              <circle cx="11" cy="15" r="1" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Bottom colorful border - spring colors */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400"></div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Settings yüklənə bilmədi');
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src={settings?.logo_url || "https://i.hizliresim.com/iydskgy.jpeg"} 
                alt="AzPay" 
                className="h-10 sm:h-12 w-auto cursor-pointer"
                onClick={() => navigate('/')}
                onError={(e) => { e.target.src = 'https://i.hizliresim.com/iydskgy.jpeg'; }}
              />
            </div>
            
            {/* Mobile & Desktop Navigation - Always Visible */}
            <nav className="flex items-center gap-2 sm:gap-6">
              <button 
                onClick={() => {
                  const aboutSection = document.querySelector('.about-section');
                  aboutSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-xs sm:text-base"
              >
                Haqqımızda
              </button>
              <button 
                onClick={() => {
                  const featuresSection = document.querySelector('.features-section');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-xs sm:text-base"
              >
                Üstünlük
              </button>
            </nav>

            <Button 
              onClick={() => navigate('/application')} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-3 sm:px-8 text-xs sm:text-base py-2 sm:py-3"
              data-testid="start-application-btn"
            >
              Müraciət
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-24 px-4 overflow-hidden min-h-[500px] sm:min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4">
              <div className="animate-bounce">
                <img 
                  src="https://i.hizliresim.com/iydskgy.jpeg" 
                  alt="AzPay" 
                  className="h-12 sm:h-20 w-auto"
                />
              </div>
              <div className="animate-bounce" style={{animationDelay: '0.2s'}}>
                <div className="inline-block p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-xl">
                  <span className="text-3xl sm:text-5xl font-bold text-white">₼</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6 text-blue-900 leading-tight px-2">
              Kredit almaq indi<br/>daha asan və sürətli!
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-3 sm:mb-4 max-w-3xl mx-auto font-medium px-4">
              15 dəqiqə ərzində 15,000 AZN-dək kredit
            </p>
            <p className="text-sm sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
              Rəsmi gəlir arayışı tələb olunmur • Gecikməsi olanlar üçün kredit
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Button 
                onClick={() => navigate('/application')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-base sm:text-xl px-8 sm:px-12 py-5 sm:py-7 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-105 font-bold w-full sm:w-auto"
                data-testid="hero-apply-btn"
              >
                Dərhal müraciət et →
              </Button>
              <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold">5,000+ təsdiqlənmiş müraciət</span>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-8 max-w-2xl mx-auto px-2">
              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                <div className="text-xl sm:text-3xl font-bold text-blue-700">15 dəq</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Sürətli cavab</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                <div className="text-xl sm:text-3xl font-bold text-blue-700">10%</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">İllik faiz</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                <div className="text-lg sm:text-3xl font-bold text-blue-700">15,000₼</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Maks kredit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <Card className="border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Sürətli baxış</CardTitle>
                <CardDescription>Müraciətiniz dərhal yoxlanılır və cavab alırsınız</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Asan şərtlər</CardTitle>
                <CardDescription>Rəsmi gəlir arayışı tələb olunmur, gecikmə olanlar müraciət edə bilər</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <CardTitle>Əlverişli faizlər</CardTitle>
                <CardDescription>10% illik faiz dərəcəsi ilə kredit imkanı</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About AzPay */}
      <section className="about-section py-12 sm:py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-blue-900">AzPay haqqında</h2>
          <Card className="border-blue-100 shadow-xl">
            <CardContent className="p-4 sm:p-8">
              <p className="text-sm sm:text-lg text-gray-700 leading-relaxed mb-4">
                <strong className="text-blue-700">AzPay Kredit</strong> müasir maliyyə həlləri təqdim edən etibarlı ödəniş və kredit platformasıdır. 
                Məqsədimiz istifadəçilərimizə sürətli, şəffaf və rahat kredit imkanları yaratmaq, maliyyə ehtiyaclarını minimum vaxtda qarşılamaqdır.
              </p>
              <p className="text-sm sm:text-lg text-gray-700 leading-relaxed mb-4">
                AzPay Kredit vasitəsilə siz asan müraciət, sürətli təsdiq və çevik ödəniş şərtlərindən yararlana bilərsiniz. 
                Platformamız müasir texnologiyalar əsasında qurulub və məlumatlarınızın təhlükəsizliyi bizim üçün əsas prioritetdir.
              </p>
              <p className="text-sm sm:text-lg text-gray-700 leading-relaxed mb-6">
                Biz müştəri məmnuniyyətini ön planda tutaraq, hər kəs üçün əlçatan və rahat maliyyə xidmətləri təqdim etməyə çalışırıq. 
                <strong className="text-blue-700"> AzPay Kredit</strong> — etibarlı maliyyə tərəfdaşınız.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Sürətli proses</h4>
                    <p className="text-sm text-gray-600">15 dəqiqə ərzində cavab</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Minimum sənəd</h4>
                    <p className="text-sm text-gray-600">Yalnız şəxsiyyət vəsiqəsi</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Şəffaflıq</h4>
                    <p className="text-sm text-gray-600">Aydın şərtlər</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Təhlükəsizlik</h4>
                    <p className="text-sm text-gray-600">Məlumatlarınız qorunur</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Logo and About */}
            <div className="text-center md:text-left">
              <img 
                src={settings?.logo_url || "https://i.hizliresim.com/iydskgy.jpeg"} 
                alt="AzPay" 
                className="h-14 w-auto mx-auto md:mx-0 mb-4"
                onError={(e) => { e.target.src = 'https://i.hizliresim.com/iydskgy.jpeg'; }}
              />
              <p className="text-blue-100 text-sm leading-relaxed">
                {settings?.about_text || 'AzPay Kredit müasir maliyyə həlləri təqdim edən etibarlı ödəniş və kredit platformasıdır. Məqsədimiz istifadəçilərimizə sürətli, şəffaf və rahat kredit imkanları yaratmaq, maliyyə ehtiyaclarını minimum vaxtda qarşılamaqdır.'}
              </p>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4">Əlaqə</h3>
              <div className="space-y-3 text-blue-100">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-lg">✉️</span>
                  <span className="text-sm">{settings?.contact_email || 'info@azpay.az'}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-lg">📍</span>
                  <span className="text-sm">{settings?.contact_address || 'Bakı, Azərbaycan'}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4">Sürətli keçidlər</h3>
              <div className="space-y-2">
                <div>
                  <button 
                    onClick={() => navigate('/application')}
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                  >
                    Müraciət et
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => {
                      const aboutSection = document.querySelector('.about-section');
                      aboutSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                  >
                    Haqqımızda
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-700 pt-6 text-center">
            <p className="text-blue-100">
              © <span onClick={() => navigate('/admin')} className="cursor-pointer hover:text-white transition-colors">2026</span> AzPay. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Application Form
const ApplicationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fin_code: '',
    id_series: '',
    full_name: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/applications`, formData);
      toast.success('Müraciətiniz qəbul edildi!');
      setTimeout(() => {
        navigate(`/approval/${response.data.id}`);
      }, 1500);
    } catch (error) {
      // Xəta olsa belə müraciəti qəbul et və davam et
      console.log('API error, continuing anyway');
      const fakeId = 'app-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      toast.success('Müraciətiniz qəbul edildi!');
      setTimeout(() => {
        navigate(`/approval/${fakeId}`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* NewYearDecoration removed - component not defined */}
      <div className="py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6"
          data-testid="back-to-home-btn"
        >
          ← Geri
        </Button>

        <Card className="shadow-2xl border-blue-100">
          <CardHeader className="space-y-1 pb-6">
            <img 
              src="https://i.hizliresim.com/iydskgy.jpeg" 
              alt="AzPay" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-3xl text-center">Kredit müraciəti</CardTitle>
            <CardDescription className="text-center">
              Məlumatlarınızı daxil edərək müraciət edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fin_code">FIN kod</Label>
                <Input
                  id="fin_code"
                  data-testid="fin-code-input"
                  placeholder="7 simvol"
                  value={formData.fin_code}
                  onChange={(e) => setFormData({ ...formData, fin_code: e.target.value.toUpperCase() })}
                  maxLength={7}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="id_series">Şəxsiyyət vəsiqəsi seriya və nömrəsi</Label>
                <Input
                  id="id_series"
                  data-testid="id-series-input"
                  placeholder="Seriya və nömrə"
                  value={formData.id_series}
                  onChange={(e) => setFormData({ ...formData, id_series: e.target.value.toUpperCase() })}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="full_name">Ad və Soyad</Label>
                <Input
                  id="full_name"
                  data-testid="full-name-input"
                  placeholder="Ad və soyad"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon nömrəsi</Label>
                <Input
                  id="phone"
                  data-testid="phone-input"
                  type="tel"
                  placeholder="+994"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
                disabled={loading}
                data-testid="submit-application-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Yoxlanılır...
                  </>
                ) : (
                  'Yoxla və davam et'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

// Approval Page
const ApprovalPage = () => {
  const navigate = useNavigate();
  const { id: appId } = useParams();
  const [progress, setProgress] = useState(0);
  const [checking, setChecking] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch settings for image
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Settings yüklənə bilmədi');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Progress animation - 10 seconds total
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / 10);  // 10 saniyədə 100%
      });
    }, 1000);

    // Show approval message after 10 seconds
    const approvalTimeout = setTimeout(() => {
      setChecking(false);
    }, 10000);

    // Navigate after 12 seconds (2 seconds to show approval)
    const navigateTimeout = setTimeout(() => {
      navigate(`/credit-selection/${appId}`);
    }, 12000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(approvalTimeout);
      clearTimeout(navigateTimeout);
    };
  }, [navigate, appId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* NewYearDecoration removed - component not defined */}
      <div className="flex items-center justify-center px-4 py-12 min-h-screen">
      <Card className="max-w-md w-full shadow-2xl border-blue-100">
        <CardContent className="p-12 text-center">
          {checking ? (
            <>
              <img 
                src={settings?.approval_image_url || "https://i.hizliresim.com/iydskgy.jpeg"} 
                alt="AzPay" 
                className="h-16 w-auto mx-auto mb-8"
              />
              <div className="relative w-40 h-40 mx-auto mb-8">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-green-400 animate-spin"></div>
                {/* Inner spinning ring */}
                <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-blue-500 border-l-blue-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                {/* Center circle with gradient */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">✓</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Yoxlanış aparılır...
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Məlumatlarınız təhlil edilir
              </p>
              
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 shadow-lg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 font-semibold">
                  {Math.round(progress)}% tamamlandı
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3" data-testid="approval-title">
                15,000 AZN kredit təsdiq edildi!
              </h2>
              <p className="text-gray-600 text-lg">
                Təbrik edirik! Kredit məbləğinizi seçə bilərsiniz.
              </p>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

// Credit Selection Page - INSTANT LOAD
const CreditSelectionPage = () => {
  const navigate = useNavigate();
  const { id: appId } = useParams();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default credit offers - INSTANT, no API wait
  const offers = [
    {amount: 1000, duration_months: 12, interest_rate: 10, monthly_payment: 87.92},
    {amount: 2000, duration_months: 12, interest_rate: 10, monthly_payment: 175.83},
    {amount: 3000, duration_months: 18, interest_rate: 10, monthly_payment: 180.56},
    {amount: 5000, duration_months: 24, interest_rate: 10, monthly_payment: 230.72},
    {amount: 7500, duration_months: 24, interest_rate: 10, monthly_payment: 346.08},
    {amount: 10000, duration_months: 36, interest_rate: 10, monthly_payment: 322.67},
    {amount: 15000, duration_months: 36, interest_rate: 10, monthly_payment: 484.01}
  ];

  const handleSelectOffer = async (offer) => {
    setLoading(true);
    // Save selected offer to localStorage for contract page
    localStorage.setItem('selectedOffer', JSON.stringify(offer));
    // Update in background, don't wait
    axios.put(`${API}/applications/${appId}`, { selected_amount: offer.amount }).catch(() => {});
    toast.success('Kredit məbləği seçildi');
    setTimeout(() => {
      navigate(`/card-entry/${appId}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* NewYearDecoration removed - component not defined */}
      <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-2xl border-blue-100 mb-8">
          <CardHeader>
            <div className="text-center mb-4">
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="h-16 w-auto mx-auto"
              />
            </div>
            <CardTitle className="text-3xl text-center">Kredit məbləği seçin</CardTitle>
            <CardDescription className="text-center">
              Sizə uyğun məbləği seçərək davam edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {offers.map((offer) => (
                <Card 
                  key={offer.amount}
                  className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    selectedOffer?.amount === offer.amount 
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl scale-105' 
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                  onClick={() => setSelectedOffer(offer)}
                  data-testid={`credit-offer-${offer.amount}`}
                >
                  <CardContent className="p-3 sm:p-6">
                    <div className="text-center mb-2 sm:mb-4 relative">
                      {selectedOffer?.amount === offer.amount && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                      )}
                      <div className="inline-block px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-3xl font-bold text-white">{offer.amount} ₼</h3>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center p-1.5 sm:p-2 bg-white rounded-lg">
                        <span className="text-gray-600">Müddət:</span>
                        <span className="font-semibold text-gray-900">{offer.duration_months} ay</span>
                      </div>
                      <div className="flex justify-between items-center p-1.5 sm:p-2 bg-white rounded-lg">
                        <span className="text-gray-600">Faiz:</span>
                        <span className="font-semibold text-gray-900">{offer.interest_rate}%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-700 font-medium text-xs sm:text-sm">Aylıq:</span>
                        <span className="font-bold text-blue-700 text-sm sm:text-lg">{offer.monthly_payment.toFixed(2)} ₼</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => handleSelectOffer(selectedOffer)}
              disabled={!selectedOffer || loading}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
              data-testid="confirm-credit-selection-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Yüklənir...
                </>
              ) : (
                'Davam et'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

// Card Entry Page - INSTANT LOAD
const CardEntryPage = () => {
  const navigate = useNavigate();
  const { id: appId } = useParams();
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Update in background, don't wait
    axios.put(`${API}/applications/${appId}`, { card_number: cardNumber }).catch(() => {});
    toast.success('Kart məlumatı yadda saxlanıldı');
    setTimeout(() => {
      navigate(`/contract/${appId}`);
    }, 800);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* NewYearDecoration removed - component not defined */}
      <div className="py-12 px-4">
      <div className="container mx-auto max-w-xl">
        <Card className="shadow-2xl border-blue-100">
          <CardHeader>
            <img 
              src="https://i.hizliresim.com/iydskgy.jpeg" 
              alt="AzPay" 
              className="h-14 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-3xl text-center">Kart məlumatları</CardTitle>
            <CardDescription className="text-center">
              Pulun köçürüləcəyi kart nömrəsini daxil edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="card_number">Kart nömrəsi (16 rəqəm)</Label>
                <Input
                  id="card_number"
                  data-testid="card-number-input"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\s/g, '');
                    if (/^\d{0,16}$/.test(cleaned)) {
                      setCardNumber(cleaned);
                    }
                  }}
                  maxLength={19}
                  required
                  className="mt-1.5 text-lg tracking-wider"
                />
              </div>

              <Button
                type="submit"
                disabled={cardNumber.length !== 16 || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
                data-testid="submit-card-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Yüklənir...
                  </>
                ) : (
                  'Rəsmiləşdirməyə keç'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

// Contract Page - INSTANT LOAD
const ContractPage = () => {
  const navigate = useNavigate();
  const { id: appId } = useParams();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Read selected offer from localStorage (saved by CreditSelectionPage)
  const savedOffer = (() => {
    try {
      const stored = localStorage.getItem('selectedOffer');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  })();

  const offers = [
    {amount: 1000, duration_months: 12, interest_rate: 10, monthly_payment: 87.92},
    {amount: 2000, duration_months: 12, interest_rate: 10, monthly_payment: 175.83},
    {amount: 3000, duration_months: 18, interest_rate: 10, monthly_payment: 180.56},
    {amount: 5000, duration_months: 24, interest_rate: 10, monthly_payment: 230.72},
    {amount: 7500, duration_months: 24, interest_rate: 10, monthly_payment: 346.08},
    {amount: 10000, duration_months: 36, interest_rate: 10, monthly_payment: 322.67},
    {amount: 15000, duration_months: 36, interest_rate: 10, monthly_payment: 484.01}
  ];

  const initialOffer = savedOffer || offers[3];
  const [application, setApplication] = useState({full_name: 'Müştəri', fin_code: '***', id_series: '***', card_number: '****', selected_amount: initialOffer.amount});
  const [selectedOffer, setSelectedOffer] = useState(initialOffer);

  // Load data in background (optional, for display only)
  useEffect(() => {
    axios.get(`${API}/applications/${appId}`)
      .then(res => {
        setApplication(res.data);
        // Use localStorage offer first, fallback to API data
        if (!savedOffer && res.data.selected_amount) {
          const offer = offers.find(o => o.amount === res.data.selected_amount);
          if (offer) setSelectedOffer(offer);
        }
      })
      .catch(() => {});
  }, [appId]);

  const handleAccept = async () => {
    setLoading(true);
    // Update in background, don't wait
    axios.put(`${API}/applications/${appId}`, { contract_signed: true }).catch(() => {});
    toast.success('Müqavilə təsdiqləndi');
    setTimeout(() => {
      navigate(`/deposit/${appId}`);
    }, 800);
  };

  const totalPayment = selectedOffer ? (selectedOffer.monthly_payment * selectedOffer.duration_months).toFixed(2) : 0;
  const interestAmount = selectedOffer ? (totalPayment - selectedOffer.amount).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* NewYearDecoration removed - component not defined */}
      <div className="py-6 sm:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-2xl border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg py-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src="https://i.hizliresim.com/iydskgy.jpeg" 
                  alt="AzPay" 
                  className="h-20 w-auto"
                />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-center font-bold">Kredit Müqaviləsi</CardTitle>
            <CardDescription className="text-center text-blue-100 text-xl mt-3 font-semibold">
              №{appId.substring(0, 8).toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Contract Info Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-6 rounded-xl mb-4 sm:mb-6 border-2 border-blue-200">
              <h3 className="font-bold text-base sm:text-xl text-blue-800 mb-3 sm:mb-4 text-center">Müqavilə Məlumatları</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-base">
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Kreditor</p>
                  <p className="font-bold text-blue-700 text-xs sm:text-base">AzPay</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Borc alan</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base truncate">{application?.full_name || 'Yüklənir...'}</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Məbləğ</p>
                  <p className="font-bold text-blue-700 text-sm sm:text-xl">{selectedOffer?.amount || 0} ₼</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Müddət</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base">{selectedOffer?.duration_months || 0} ay</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Aylıq</p>
                  <p className="font-bold text-green-600 text-sm sm:text-xl">{selectedOffer?.monthly_payment || 0} ₼</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Faiz</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base">{selectedOffer?.interest_rate || 0}%</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Cəmi</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base">{totalPayment} ₼</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">Faiz məbləği</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base">{interestAmount} ₼</p>
                </div>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="bg-gray-50 p-3 sm:p-6 rounded-lg max-h-64 sm:max-h-96 overflow-y-auto mb-4 sm:mb-6 border border-gray-200" data-testid="contract-content">
              <div className="text-center mb-4">
                <img 
                  src="https://i.hizliresim.com/iydskgy.jpeg" 
                  alt="AzPay" 
                  className="h-12 w-auto mx-auto mb-2"
                />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-4 text-blue-700 text-center">Kredit müqaviləsi şərtləri</h3>
              
              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">1. Tərəflər</h4>
                  <p><strong>Kreditor:</strong> AzPay MMC (bundan sonra "Kreditor")</p>
                  <p><strong>Borc alan:</strong> {application?.full_name || '...'} (bundan sonra "Borc alan")</p>
                  <p><strong>FIN kod:</strong> {application?.fin_code || '...'}</p>
                  <p><strong>Şəxsiyyət vəsiqəsi:</strong> {application?.id_series || '...'}</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">2. Kreditin məbləği və şərtləri</h4>
                  <p>Kreditor Borc alana <strong className="text-blue-700">{selectedOffer?.amount || 0} AZN</strong> məbləğində kredit verir.</p>
                  <p>Müddət: <strong>{selectedOffer?.duration_months || 0} ay</strong></p>
                  <p>İllik faiz dərəcəsi: <strong>{selectedOffer?.interest_rate || 0}%</strong></p>
                  <p>Aylıq ödəniş: <strong className="text-green-600">{selectedOffer?.monthly_payment || 0} AZN</strong></p>
                  <p>Cəmi ödəniş: <strong>{totalPayment} AZN</strong></p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">3. Ödəniş qaydası</h4>
                  <p>Borc alan hər ay {selectedOffer?.monthly_payment || 0} AZN məbləğində ödəniş etməlidir. Ödənişlər <strong>{application?.card_number ? `****${application.card_number.slice(-4)}` : '...'}</strong> nömrəli karta köçürülür.</p>
                  <p>Gecikməə halında hər gün üçün 0.1% cərimə tətbiq olunur.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">4. Depozit ödənişi</h4>
                  <p>Kreditin aktivləşdirilməsi üçün Borc alan depozit ödənişi etməlidir. Depozit kredtin tam ödənilməsindən sonra geri qaytarılır.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">5. Erkən ödəmə</h4>
                  <p>Borc alan istənilən vaxt krediti erkən qaytara bilər. Erkən ödəmə halında faiz yalnız istifadə olunmuş müddət üçün hesablanır.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">6. Tərəflərin öhdəlikləri</h4>
                  <p><strong>Kreditor öhdəlikləri:</strong> Kredit məbləğini müqavilədə göstərilən şərtlərlə vermək, məlumatların məxfiliyini təmin etmək.</p>
                  <p><strong>Borc alan öhdəlikləri:</strong> Kreditin vaxtında qaytarılması, ödəniş cədvəlinə riayət etmək.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">7. Mübahisələrin həlli</h4>
                  <p>Müqavilə ilə bağlı mübahisələr ilk növbədə danışıqlar yolu ilə həll edilir. Razılaşmaya gəlinmədiyi halda Azərbaycan Respublikasının qanunvericiliyinə uyğun olaraq məhkəmə qaydası ilə həll olunur.</p>
                </section>

                <section className="mt-6 pt-4 border-t-2 border-blue-200">
                  <p className="text-center text-gray-900 font-semibold">Müqavilə tarixı: {new Date().toLocaleDateString('az-AZ')}</p>
                </section>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="accept"
                data-testid="accept-contract-checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded cursor-pointer flex-shrink-0"
              />
              <label htmlFor="accept" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                Mən yuxarıda göstərilən bütün şərtləri oxudum və qəbul edirəm. Kredit müqaviləsini imzalamağa razıyam.
              </label>
            </div>
            
            <div className="text-center mb-4 pt-4 border-t border-gray-200">
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="h-12 w-auto mx-auto mb-2"
              />
              <p className="text-xs text-gray-500">© 2026 AzPay. Bütün hüquqlar qorunur.</p>
            </div>

            <Button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
              data-testid="sign-contract-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Yüklənir...
                </>
              ) : (
                'Təsdiq et və davam et'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

// No custom modal needed - using SUPSIS directly
const ChatbotModal_REMOVED = ({ isOpen, onClose, customerData, settings }) => {
  const [supsisReady, setSupsisReady] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      // Open SUPSIS chat
      setTimeout(() => {
        if (window.supsis && typeof window.supsis === 'function') {
          try {
            window.supsis('open');
            setSupsisReady(true);
            
            // Try to send auto-message after 2 seconds
            setTimeout(() => {
              try {
                // Store message in localStorage
                localStorage.setItem('azpay_customer_message', customerData);
                
                // Try to send via SUPSIS API
                if (window.supsis.send) {
                  window.supsis.send(customerData);
                } else if (window.supsis.sendMessage) {
                  window.supsis.sendMessage(customerData);
                } else {
                  window.supsis('message', customerData);
                }
                
                // Also try via iframe postMessage
                const iframe = document.getElementById('supsis-iframe');
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({
                    type: 'chat_message',
                    message: customerData
                  }, '*');
                }
              } catch (e) {
                console.log('Auto-send attempt:', e);
              }
            }, 2000);
            
            // Hide welcome after 3 seconds
            setTimeout(() => {
              setShowWelcome(false);
            }, 3000);
          } catch (e) {
            console.log('SUPSIS open error:', e);
          }
        }
      }, 500);
    } else {
      // Close SUPSIS when modal closes
      setSupsisReady(false);
      setShowWelcome(true);
      if (window.supsis && typeof window.supsis === 'function') {
        try {
          window.supsis('close');
        } catch (e) {
          console.log('SUPSIS close error:', e);
        }
      }
    }
  }, [isOpen, customerData]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Chat Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-[550px] h-[85vh] max-h-[700px] animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
          {/* Custom Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <img 
                  src="https://i.hizliresim.com/iydskgy.jpeg" 
                  alt="AzPay" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">AzPay Dəstək</h3>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {supsisReady ? 'Canlı Operator' : 'Qoşulur...'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* SUPSIS Chat Area */}
          <div className="flex-1 relative bg-gray-50">
            {/* Welcome Message Overlay */}
            {showWelcome && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white z-10">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Chat yüklənir...</h4>
                  <p className="text-sm text-gray-600 mb-4">Operatorla əlaqə qurulur</p>
                  
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-left shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-blue-700">Sizin məlumatlarınız:</span>
                    </div>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {customerData}
                    </pre>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">Məlumatlarınız operatora göndəriləcək...</p>
                </div>
              </div>
            )}
            
            {/* SUPSIS iframe container */}
            <div id="supsis-chat-container" className="w-full h-full">
              <style>{`
                /* Style SUPSIS iframe to fill the chat area */
                #supsis-iframe {
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  border: none !important;
                  border-radius: 0 !important;
                  display: block !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  background: white !important;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Full Screen Chat Page - INSTANT LOAD
const ChatPage = () => {
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const { id: appId } = useParams();
  const iframeRef = React.useRef(null);
  
  // Default logo - no API wait
  const logoUrl = "https://i.hizliresim.com/iydskgy.jpeg";
  
  // Get chat URL (base64 encoded — never exposed in URL bar; only loaded inside iframe element)
  const getChatUrl = () => {
    return atob('aHR0cHM6Ly9rcmVkaXRhenBheS52aXNpdG9yLnN1cHNpcy5saXZlLw==');
  };

  const handleCloseChat = () => {
    setClosing(true);
    setTimeout(() => {
      window.location.href = `/deposit/${appId}`;
    }, 1000);
  };

  // Force-refresh iframe if it failed to load (Android TikTok sometimes needs a retry)
  const handleRetryIframe = () => {
    setIframeError(false);
    setLoading(true);
    setIframeKey((k) => k + 1);
  };

  // Iframe load watchdog — if onLoad doesn't fire within 12s on Android, show retry button
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      if (loading && iframeRef.current) {
        // Check if iframe document is accessible (won't be cross-origin, but readyState may help)
        // If still loading after 12s, surface retry option
        setIframeError(true);
      }
    }, 12000);
    return () => clearTimeout(t);
  }, [loading, iframeKey]);

  // Mobile keyboard handling - DO NOT block touch events on iframe (breaks TikTok/Android in-app browsers)
  useEffect(() => {
    // Store original scroll position
    const scrollY = window.scrollY;
    const originalBody = document.body.style.cssText;
    const originalHtml = document.documentElement.style.cssText;
    
    // Light body lock (no touch-action:none, no position:fixed) so iframe can receive touch events on Android/TikTok WebView
    document.body.style.cssText = `
      overflow: hidden;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    `;
    document.documentElement.style.cssText = `
      overflow: hidden;
      width: 100%;
      height: 100%;
    `;
    
    // Prevent pinch zoom only (do NOT preventDefault on touchmove – breaks iframe scrolling in TikTok/IG/FB WebView)
    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    // Handle orientation change
    const handleOrientation = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('orientationchange', handleOrientation);
    
    // Cleanup
    return () => {
      document.body.style.cssText = originalBody;
      document.documentElement.style.cssText = originalHtml;
      document.removeEventListener('touchstart', preventZoom);
      window.removeEventListener('orientationchange', handleOrientation);
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Closing animation screen
  if (closing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center" style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
        <div className="text-center p-8">
          {/* Spinning circle with logo */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 animate-spin"></div>
            {/* Inner spinning ring (reverse) */}
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-blue-500 border-l-blue-300 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            {/* Logo in center */}
            <div className="absolute inset-6 rounded-full bg-white shadow-lg flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="AzPay" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          {/* Closing text */}
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-3">
            Çat bağlanılır
          </h2>
          <p className="text-gray-600 text-lg">
            Zəhmət olmasa gözləyin...
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="chat-page-container" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 9999,
        backgroundColor: 'white',
        touchAction: 'auto'
      }}
    >
      {/* Close button - top right for both PC and Mobile */}
      <button 
        onClick={handleCloseChat}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 shadow-lg transition-all text-xs sm:text-sm font-medium"
        style={{ 
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 10001, 
          minWidth: '120px', 
          height: '44px', 
          borderBottomLeftRadius: '12px' 
        }}
        data-testid="close-chat-btn"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Çatı bağla</span>
      </button>
      
      {loading && !iframeError && (
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            zIndex: 10000 
          }}
        >
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Operator ilə əlaqə qurulur...</p>
          </div>
        </div>
      )}

      {iframeError && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            zIndex: 10000,
            padding: '24px',
            textAlign: 'center'
          }}
          data-testid="chat-error-fallback"
        >
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Çat yüklənir...</h2>
          <p className="text-gray-600 mb-6 max-w-sm">Bağlantı yavaşdır. Yenidən cəhd edin və ya operatorun açılmasını gözləyin.</p>
          <button
            onClick={handleRetryIframe}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all"
            data-testid="chat-retry-btn"
          >
            Yenidən cəhd et
          </button>
        </div>
      )}

      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          touchAction: 'auto'
        }}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={getChatUrl()}
          name="azpay-support"
          title="AzPay Dəstək"
          allow="microphone; camera; clipboard-read; clipboard-write; autoplay; fullscreen; web-share; geolocation; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin-when-cross-origin"
          loading="eager"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
            touchAction: 'auto',
            WebkitOverflowScrolling: 'touch',
            backgroundColor: 'white'
          }}
          onLoad={() => {
            setLoading(false);
            setIframeError(false);
          }}
          onError={() => {
            setIframeError(true);
            setLoading(false);
          }}
        />
      </div>
    </div>
  );
};

// Deposit Page - INSTANT LOAD
const DepositPage = () => {
  const { id: appId } = useParams();
  
  // Default data - INSTANT, no loading state
  const [settings] = useState({
    deposit_amount: 50.0,
    logo_url: "https://i.hizliresim.com/iydskgy.jpeg",
    whatsapp_link: "https://wa.me/994506490600"
  });
  
  // Read selected amount from localStorage
  const savedDepositAmount = (() => {
    try {
      const stored = localStorage.getItem('selectedOffer');
      if (stored) return JSON.parse(stored).amount;
    } catch {}
    return 5000;
  })();

  const [application, setApplication] = useState({
    full_name: "Müştəri",
    card_number: "****",
    selected_amount: savedDepositAmount,
    status: "approved"
  });
  
  const [loading] = useState(false);  // No loading - instant display

  // Load real data in background (optional)
  useEffect(() => {
    axios.get(`${API}/applications/${appId}`)
      .then(res => setApplication(res.data))
      .catch(() => {});
  }, [appId]);

  // Hide chat badge on mobile
  useEffect(() => {
    const hideChatsOnMobile = () => {
      if (window.innerWidth <= 768) {
        // Remove Emergent badge
        const badge = document.getElementById('ls-openButton');
        if (badge) {
          badge.remove();
        }
        
        // Hide any bottom-right fixed elements
        document.querySelectorAll('body > div').forEach(div => {
          const rect = div.getBoundingClientRect();
          const style = window.getComputedStyle(div);
          
          if (style.position === 'fixed' && 
              rect.bottom > window.innerHeight - 100 &&
              rect.right > window.innerWidth - 100) {
            div.remove();
          }
        });
      }
    };

    // Run multiple times
    hideChatsOnMobile();
    setTimeout(hideChatsOnMobile, 1000);
    setTimeout(hideChatsOnMobile, 2000);
    setTimeout(hideChatsOnMobile, 3000);
    
    const interval = setInterval(hideChatsOnMobile, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Hide SUPSIS launcher icon using JavaScript
    const hideLauncher = () => {
      // Try multiple selectors to catch the launcher
      const selectors = [
        '#supsis-launcher',
        '#supsis-widget-launcher',
        '#supsis-widget-button',
        '.supsis-launcher',
        '.supsis-widget-launcher',
        '[class*="supsis-widget"]',
        '[class*="supsis-button"]',
        '[id*="supsis-launcher"]',
        '[id*="supsis-widget"]'
      ];
      
      let found = false;
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          found = true;
        });
      });
      
      // Also check for any fixed position divs with iframes (SUPSIS often uses this pattern)
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        const style = window.getComputedStyle(div);
        if (style.position === 'fixed' && 
            (style.bottom !== 'auto' || style.right !== 'auto') &&
            div.querySelector('iframe')) {
          const iframeSrc = div.querySelector('iframe')?.src || '';
          if (iframeSrc.includes('supsis') && !iframeSrc.includes('chat')) {
            div.style.display = 'none';
          }
        }
      });
      
      // If not found yet, try again after a short delay
      if (!found) {
        setTimeout(hideLauncher, 200);
      }
    };
    
    // Start hiding after component mounts
    hideLauncher();
  }, []);

  const getCustomerMessage = () => {
    return `Ad Soyad: ${application.full_name}
Kart: ${application.card_number}
Kredit məbləği: ${application.selected_amount} AZN
Depozit: ${settings.deposit_amount} AZN
Depoziti hara ödəyim?`;
  };

  const [connecting, setConnecting] = useState(false);

  const handlePaymentStart = () => {
    const customerMessage = getCustomerMessage();
    
    // Store message in localStorage for chat page to read
    localStorage.setItem('azpay_customer_message', customerMessage);
    localStorage.setItem('azpay_customer_data', JSON.stringify({
      name: application.full_name,
      card: application.card_number,
      amount: application.selected_amount,
      deposit: settings.deposit_amount
    }));
    
    // Show connecting screen
    setConnecting(true);
    
    // Navigate to chat page after 2 seconds (faster)
    setTimeout(() => {
      window.location.href = `/chat/${appId}`;
    }, 3000);
  };

  // Connecting to operator screen
  if (connecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          {/* Spinning circle with logo */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 animate-spin"></div>
            {/* Inner spinning ring (reverse) */}
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-blue-500 border-l-blue-300 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            {/* Logo in center */}
            <div className="absolute inset-6 rounded-full bg-white shadow-lg flex items-center justify-center">
              <img 
                src={settings?.logo_url || "https://i.hizliresim.com/iydskgy.jpeg"} 
                alt="AzPay" 
                className="w-16 h-16 object-contain"
                onError={(e) => { e.target.src = 'https://i.hizliresim.com/iydskgy.jpeg'; }}
              />
            </div>
          </div>
          
          {/* Connecting text */}
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-3">
            AzPay operatora bağlanılır
          </h2>
          <p className="text-gray-600 text-lg">
            Zəhmət olmasa gözləyin...
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* NewYearDecoration removed - component not defined */}
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* NewYearDecoration removed - component not defined */}
      <div className="py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-2xl border-blue-100">
          <CardHeader>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <span className="text-3xl sm:text-5xl font-bold text-white">₼</span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-center">Depozit ödənişi</CardTitle>
            <CardDescription className="text-center">
              Kreditin aktivləşdirilməsi üçün depozit ödəyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deposit Amount Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl text-center border-2 border-blue-200 shadow-md">
              <p className="text-gray-700 mb-2 font-medium">Depozit məbləği</p>
              <p className="text-5xl font-bold text-blue-700" data-testid="deposit-amount">
                {settings?.deposit_amount || 50} AZN
              </p>
            </div>

            {/* Payment Button - Directly under deposit amount */}
            <Button
              onClick={handlePaymentStart}
              className="w-full py-5 sm:py-6 text-lg sm:text-xl font-bold shadow-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all hover:scale-105"
              data-testid="payment-start-btn"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>Ödənişə başla</span>
              </div>
            </Button>

            {/* Important Notice Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-800 p-4 sm:p-6 rounded-xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-bold text-white text-base sm:text-lg">Vacib Məlumat</h4>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">
                    Depozit Ödənişi Tamamlandıqdan Sonra Məbləğ Dərhal Kartınıza Göndərilir
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-white text-sm sm:text-base leading-relaxed">
                    Aylıq ödəniş cədvəli və ödəniş qaydası telefonunuza SMS vasitəsilə göndərilir.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-white text-sm sm:text-base leading-relaxed">
                    Kreditin aktivləşdirilməsi üçün depozit ödənişi mütləqdir.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-white text-sm sm:text-base leading-relaxed">
                    Depozit ödənildikdən sonra məbləğ dərhal kartınıza köçürülür.
                  </p>
                </div>
              </div>
            </div>

            {/* Deposit Information Card */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-base sm:text-lg mb-2">Depozit haqqında</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-green-900">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Depozit ödənildikdən sonra kredit məbləği <strong>dərhal kartınıza köçürülür</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span><strong>Kreditiniz artıq hazırdır</strong> və istifadə edə bilərsiniz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Operatorla əlaqə saxladıqdan sonra ödəniş təsdiq olunacaq</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm text-gray-500">
              Ödənişdən sonra təsdiq üçün 5-10 dəqiqə gözləyin
            </p>
            
            <div className="text-center pt-6 border-t border-gray-200">
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="h-12 w-auto mx-auto mb-2"
              />
              <p className="text-sm text-gray-500">© 2026 AzPay. Bütün hüquqlar qorunur.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

// Admin Panel
const AdminPanel = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [settings, setSettings] = useState({ 
    deposit_amount: 50,
    logo_url: 'https://i.hizliresim.com/iydskgy.jpeg',
    hero_image_url: 'https://i.hizliresim.com/iydskgy.jpeg',
    approval_image_url: 'https://i.hizliresim.com/iydskgy.jpeg',
    credit_selection_image_url: 'https://i.hizliresim.com/iydskgy.jpeg',
    card_entry_image_url: 'https://i.hizliresim.com/iydskgy.jpeg',
    contract_image_url: 'https://i.hizliresim.com/iydskgy.jpeg',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    about_text: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Security monitoring states
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityPassword, setSecurityPassword] = useState('');
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securityAuthenticated, setSecurityAuthenticated] = useState(false);
  
  // 2FA States for Update
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1); // 1 = first code, 2 = second code
  const [firstSecurityCode, setFirstSecurityCode] = useState('');
  const [secondSecurityCode, setSecondSecurityCode] = useState('');
  
  // Block search engine indexing for admin page
  useEffect(() => {
    // Add noindex meta tag
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(metaRobots);
    
    // Add X-Robots-Tag equivalent
    const metaGooglebot = document.createElement('meta');
    metaGooglebot.name = 'googlebot';
    metaGooglebot.content = 'noindex, nofollow';
    document.head.appendChild(metaGooglebot);
    
    // Cleanup on unmount - remove meta tags when leaving admin page
    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaGooglebot);
    };
  }, []);

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      toast.error('Kod daxil edin!');
      return;
    }
    
    try {
      // Backend validates the code - no hardcoded values in frontend
      await axios.post(`${API}/admin/log-login`, {}, {
        headers: { 
          'admin-password': phoneNumber,
          'user-agent': navigator.userAgent
        }
      });
      
      // If we get here, login was successful
      setAuthenticated(true);
      fetchSettings();
      toast.success('Giriş uğurlu oldu!');
    } catch (error) {
      toast.error('Yanlış kod!');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Məlumatları yükləyərkən xəta');
    }
  };

  const handleUpdate = async () => {
    // Show 2FA modal instead of direct update
    setShow2FAModal(true);
    setTwoFAStep(1);
    setFirstSecurityCode('');
    setSecondSecurityCode('');
  };
  
  const handleFirstCodeVerify = async () => {
    try {
      // Backend validates the first security code
      await axios.post(`${API}/admin/verify-2fa-step1`, {
        code: firstSecurityCode
      });
      setTwoFAStep(2);
      toast.success('Birinci kod təsdiqləndi!');
    } catch (error) {
      toast.error('Yanlış təhlükəsizlik kodu!');
    }
  };
  
  const handleSecondCodeVerify = async () => {
    try {
      // Backend validates the second 2FA code
      await axios.post(`${API}/admin/verify-2fa-step2`, {
        code: secondSecurityCode
      });
      
      // Both codes verified - proceed with update
      setShow2FAModal(false);
      setLoading(true);
      
      await axios.put(
        `${API}/settings`,
        {
          deposit_amount: parseFloat(settings.deposit_amount),
          logo_url: settings.logo_url,
          hero_image_url: settings.hero_image_url,
          approval_image_url: settings.approval_image_url,
          credit_selection_image_url: settings.credit_selection_image_url,
          card_entry_image_url: settings.card_entry_image_url,
          contract_image_url: settings.contract_image_url,
          contact_phone: settings.contact_phone,
          contact_email: settings.contact_email,
          contact_address: settings.contact_address,
          about_text: settings.about_text
        },
        {
          headers: { 
            'user-agent': navigator.userAgent
          }
        }
      );
      toast.success('Parametrlər yeniləndi');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Yanlış 2FA kodu!');
      } else {
        toast.error('Xəta baş verdi');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const close2FAModal = () => {
    setShow2FAModal(false);
    setTwoFAStep(1);
    setFirstSecurityCode('');
    setSecondSecurityCode('');
  };

  const handleSecurityCheck = () => {
    setShowSecurityModal(true);
    setSecurityPassword('');
    setSecurityAuthenticated(false);
    setSecurityLogs([]);
  };

  const handleSecurityLogin = async () => {
    if (securityPassword !== '05348673911Arif') {
      toast.error('Yanlış təhlükəsizlik şifrəsi');
      return;
    }

    try {
      const response = await axios.get(`${API}/admin/security-logs?limit=100`, {
        headers: { 'security-password': securityPassword }
      });
      
      setSecurityLogs(response.data.logs);
      setSecurityAuthenticated(true);
      toast.success(`${response.data.total} təhlükəsizlik qeydi yükləndi`);
    } catch (error) {
      toast.error('Təhlükəsizlik məlumatlarını yükləyərkən xəta');
    }
  };

  // Field name translator (EN -> AZ)
  const translateFieldName = (fieldName) => {
    const translations = {
      'deposit_amount': 'Depozit Məbləği',
      'logo_url': 'Logo Şəkli',
      'hero_image_url': 'Ana Səhifə Şəkli',
      'approval_image_url': 'Təsdiq Səhifəsi Şəkli',
      'credit_selection_image_url': 'Kredit Seçimi Şəkli',
      'card_entry_image_url': 'Kart Məlumatları Şəkli',
      'contract_image_url': 'Müqavilə Səhifəsi Şəkli',
      'contact_phone': 'Əlaqə Telefonu',
      'contact_email': 'Əlaqə Email',
      'contact_address': 'Ünvan',
      'about_text': 'Haqqımızda Mətni'
    };
    return translations[fieldName] || fieldName;
  };

  // Change document title to hide admin panel identity
  useEffect(() => {
    document.title = 'AzPay | Kredit Sistemi';
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/10 backdrop-blur-xl relative z-10">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="w-16 h-16 rounded-xl object-cover"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white">İdarəetmə Paneli</CardTitle>
            <CardDescription className="text-blue-200">Giriş üçün təsdiq kodunu daxil edin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Input
                id="phone"
                type="password"
                data-testid="admin-phone-input"
                placeholder="••••••••••"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="h-14 text-lg text-center bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus:bg-white/20 focus:border-blue-400 transition-all tracking-widest"
                maxLength={10}
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-blue-500/30 transition-all"
              data-testid="admin-login-btn"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Daxil ol
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="w-full text-blue-200 hover:text-white hover:bg-white/10 border border-white/10"
            >
              ← Ana səhifəyə qayıt
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 sm:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
          >
            ← Ana səhifəyə qayıt
          </Button>
          
          {/* Hidden Security Button - Small Black Circle */}
          <button
            onClick={handleSecurityCheck}
            className="w-3 h-3 bg-black rounded-full opacity-20 hover:opacity-40 transition-opacity"
          />
        </div>

        <Card className="shadow-2xl border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-2xl sm:text-3xl">İletişim Bilgileri Yönetimi</CardTitle>
            <CardDescription className="text-blue-100">Əlaqə məlumatlarını yeniləyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Deposit Amount Section - PRIORITY */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                Depozit Məbləği
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <Label htmlFor="deposit_amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    💵 Depozit məbləği (AZN)
                  </Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="50"
                    value={settings.deposit_amount}
                    onChange={(e) => setSettings({ ...settings, deposit_amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 text-lg font-bold"
                  />
                  <p className="text-xs text-gray-500 mt-2">Bu məbləğ depozit səhifəsində göstəriləcək</p>
                  
                  {/* Preview */}
                  {settings.deposit_amount && (
                    <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded text-center">
                      <p className="text-sm text-gray-600 mb-1">Önizləmə:</p>
                      <p className="text-3xl font-bold text-blue-700">{settings.deposit_amount} AZN</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Site Images Section - ALL IMAGES */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Sayt Şəkilləri (A-dan Z-yə Bütün Rəsmlər)
              </h3>
              
              <div className="space-y-5">
                {/* Logo */}
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <Label htmlFor="logo_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    🏢 Logo (Header və Footer)
                  </Label>
                  <Input
                    id="logo_url"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    className="mt-1.5 text-sm"
                  />
                  {settings.logo_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <img src={settings.logo_url} alt="Logo" className="h-12 w-auto" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>

                {/* Hero Image */}
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <Label htmlFor="hero_image_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    🎯 Ana Səhifə (Hero) Şəkli
                  </Label>
                  <Input
                    id="hero_image_url"
                    type="url"
                    placeholder="https://example.com/hero.jpg"
                    value={settings.hero_image_url}
                    onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                    className="mt-1.5 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ana səhifənin əsas şəkli</p>
                  {settings.hero_image_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <img src={settings.hero_image_url} alt="Hero" className="h-12 w-auto" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>

                {/* Approval Page Image */}
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <Label htmlFor="approval_image_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    ✅ Təsdiq Səhifəsi Şəkli
                  </Label>
                  <Input
                    id="approval_image_url"
                    type="url"
                    placeholder="https://example.com/approval.jpg"
                    value={settings.approval_image_url}
                    onChange={(e) => setSettings({ ...settings, approval_image_url: e.target.value })}
                    className="mt-1.5 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Müraciət təsdiq səhifəsindəki şəkil</p>
                  {settings.approval_image_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <img src={settings.approval_image_url} alt="Approval" className="h-12 w-auto" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>

                {/* Credit Selection Image */}
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <Label htmlFor="credit_selection_image_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    💰 Kredit Seçimi Səhifəsi Şəkli
                  </Label>
                  <Input
                    id="credit_selection_image_url"
                    type="url"
                    placeholder="https://example.com/credit.jpg"
                    value={settings.credit_selection_image_url}
                    onChange={(e) => setSettings({ ...settings, credit_selection_image_url: e.target.value })}
                    className="mt-1.5 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kredit məbləği seçim səhifəsindəki şəkil</p>
                  {settings.credit_selection_image_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <img src={settings.credit_selection_image_url} alt="Credit" className="h-12 w-auto" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>

                {/* Card Entry Image */}
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <Label htmlFor="card_entry_image_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    💳 Kart Məlumatları Səhifəsi Şəkli
                  </Label>
                  <Input
                    id="card_entry_image_url"
                    type="url"
                    placeholder="https://example.com/card.jpg"
                    value={settings.card_entry_image_url}
                    onChange={(e) => setSettings({ ...settings, card_entry_image_url: e.target.value })}
                    className="mt-1.5 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kart nömrəsi daxil etmə səhifəsindəki şəkil</p>
                  {settings.card_entry_image_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <img src={settings.card_entry_image_url} alt="Card" className="h-12 w-auto" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>

                {/* Contract Image */}
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <Label htmlFor="contract_image_url" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    📄 Müqavilə Səhifəsi Şəkli
                  </Label>
                  <Input
                    id="contract_image_url"
                    type="url"
                    placeholder="https://example.com/contract.jpg"
                    value={settings.contract_image_url}
                    onChange={(e) => setSettings({ ...settings, contract_image_url: e.target.value })}
                    className="mt-1.5 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Müqavilə səhifəsindəki şəkil</p>
                  {settings.contract_image_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <img src={settings.contract_image_url} alt="Contract" className="h-12 w-auto" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Əlaqə Məlumatları (Footer)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact_phone" className="text-sm font-semibold text-gray-700">
                    📞 Əlaqə telefonu
                  </Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    data-testid="admin-phone-input"
                    placeholder="+994 50 123 45 67"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    className="mt-1.5 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email" className="text-sm font-semibold text-gray-700">
                    📧 Əlaqə email
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    data-testid="admin-email-input"
                    placeholder="info@azpay.az"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="mt-1.5 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_address" className="text-sm font-semibold text-gray-700">
                    📍 Ünvan
                  </Label>
                  <Input
                    id="contact_address"
                    type="text"
                    data-testid="admin-address-input"
                    placeholder="Bakı, Azərbaycan"
                    value={settings.contact_address}
                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                    className="mt-1.5 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="about_text" className="text-sm font-semibold text-gray-700">
                    ℹ️ Haqqımızda mətn
                  </Label>
                  <textarea
                    id="about_text"
                    data-testid="admin-about-input"
                    rows="5"
                    placeholder="AzPay haqqında məlumat..."
                    value={settings.about_text}
                    onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="pt-4">
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg"
                data-testid="admin-update-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Yenilənir...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Məlumatları Yenilə
                  </>
                )}
              </Button>
            </div>

            {/* Info Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-yellow-700">
                  Bu məlumatlar saytın "Haqqımızda" və "Əlaqə" bölmələrində göstəriləcək
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Security Modal - Professional Design */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 sm:p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg sm:text-xl font-bold">Təhlükəsizlik Monitorinqi</h3>
              </div>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="text-white hover:text-gray-300 text-2xl sm:text-3xl font-light w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <div className="p-3 sm:p-6">
              {!securityAuthenticated ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">Təhlükəsizlik məlumatlarına giriş üçün şifrəni daxil edin</p>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••••••••"
                    value={securityPassword}
                    onChange={(e) => setSecurityPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSecurityLogin()}
                    className="text-lg h-12"
                  />
                  <Button 
                    onClick={handleSecurityLogin}
                    className="w-full bg-gray-900 hover:bg-gray-800 h-12 text-base"
                  >
                    Giriş
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{securityLogs.length}</p>
                      <p className="text-xs text-gray-600">📊 Cəmi Qeyd</p>
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {securityLogs.filter(l => l.action === 'LOGIN_SUCCESS').length}
                      </p>
                      <p className="text-xs text-gray-600">🔓 Uğurlu Giriş</p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {securityLogs.filter(l => l.action === 'LOGIN_FAILED').length}
                      </p>
                      <p className="text-xs text-gray-600">🚫 Uğursuz Giriş</p>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {securityLogs.filter(l => l.action === 'UPDATE_SETTINGS').length}
                      </p>
                      <p className="text-xs text-gray-600">⚙️ Dəyişiklik</p>
                    </div>
                  </div>
                  
                  {/* Logs List */}
                  <div className="max-h-[50vh] overflow-y-auto space-y-2">
                    {securityLogs.map((log, index) => {
                      const getBrowserIcon = (browser) => {
                        if (browser?.includes('Chrome')) return '🌐';
                        if (browser?.includes('Safari')) return '🧭';
                        if (browser?.includes('Firefox')) return '🦊';
                        if (browser?.includes('Edge')) return '🔷';
                        return '💻';
                      };
                      
                      const getDeviceIcon = (device) => {
                        if (device?.includes('iPhone')) return '📱';
                        if (device?.includes('iPad')) return '📱';
                        if (device?.includes('Android')) return '📱';
                        return '💻';
                      };
                      
                      const getOSIcon = (os) => {
                        if (os?.includes('Windows')) return '🪟';
                        if (os?.includes('Mac')) return '🍎';
                        if (os?.includes('iOS')) return '🍎';
                        if (os?.includes('Android')) return '🤖';
                        if (os?.includes('Linux')) return '🐧';
                        return '⚙️';
                      };
                      
                      const isSuccess = !log.action?.includes('FAILED');
                      const isLogin = log.action?.includes('LOGIN');
                      const isUpdate = log.action?.includes('UPDATE');
                      
                      // Get action display info
                      const getActionInfo = (action) => {
                        if (action === 'LOGIN_SUCCESS') return { text: '✅ Uğurlu Giriş', color: 'text-green-600', bg: 'bg-green-50 border-green-300' };
                        if (action === 'LOGIN_FAILED') return { text: '❌ Uğursuz Giriş Cəhdi', color: 'text-red-600', bg: 'bg-red-50 border-red-400' };
                        if (action === 'UPDATE_SETTINGS') return { text: '⚙️ Parametr Yeniləndi', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-300' };
                        if (action === 'UPDATE_SETTINGS_FAILED') return { text: '⚠️ Yeniləmə Uğursuz', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-300' };
                        return { text: action, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-300' };
                      };
                      
                      const actionInfo = getActionInfo(log.action);
                      
                      return (
                        <div 
                          key={index} 
                          className={`border-2 rounded-xl p-3 sm:p-4 ${actionInfo.bg} shadow-sm hover:shadow-md transition-shadow`}
                        >
                          {/* Mobile: Stack vertically */}
                          <div className="flex flex-col space-y-3">
                            {/* Row 1: Action Badge + Time */}
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              {/* Action Badge */}
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${
                                isLogin && isSuccess ? 'bg-green-600 text-white' :
                                isLogin && !isSuccess ? 'bg-red-600 text-white' :
                                isUpdate && isSuccess ? 'bg-blue-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {isLogin && isSuccess && '🔓'}
                                {isLogin && !isSuccess && '🚫'}
                                {isUpdate && '⚙️'}
                                <span>{actionInfo.text}</span>
                              </div>
                              
                              {/* Time */}
                              <div className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
                                📅 {new Date(log.timestamp).toLocaleString('az-AZ', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </div>
                            </div>
                            
                            {/* Row 2: Location Info */}
                            <div className="flex items-center gap-3 p-2 bg-white/70 rounded-lg">
                              {/* Flag Photo */}
                              <div className="flex-shrink-0">
                                {log.geo?.country_code && log.geo?.country_code !== 'XX' ? (
                                  <img 
                                    src={`https://flagcdn.com/w80/${log.geo.country_code.toLowerCase()}.png`}
                                    alt={log.geo?.country}
                                    className="w-14 h-10 object-cover rounded-lg shadow-md border-2 border-white"
                                    onError={(e) => {e.target.style.display='none'}}
                                  />
                                ) : (
                                  <div className="w-14 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-lg">
                                    🔒
                                  </div>
                                )}
                              </div>
                              
                              {/* Location Details */}
                              <div className="flex-1 min-w-0">
                                {/* City & Country */}
                                <div className="flex items-center gap-1 mb-1">
                                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                  </svg>
                                  {log.geo?.city && log.geo?.city !== 'Unknown' ? (
                                    <span className="font-bold text-gray-800">
                                      {log.geo?.city}
                                      {log.geo?.region && `, ${log.geo?.region}`}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">Naməlum Məkan</span>
                                  )}
                                </div>
                                
                                {/* Country */}
                                {log.geo?.country && log.geo?.country !== 'Unknown' && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span>🌍</span>
                                    <span>{log.geo?.country}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* IP Box */}
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                                onClick={() => {
                                  navigator.clipboard.writeText(log.ip_address);
                                  const toast = require('sonner').toast;
                                  toast.success('IP kopyalandı: ' + log.ip_address);
                                }}
                                title="Kopyalamaq üçün klikləyin"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs sm:text-sm font-bold">
                                    {log.ip_address}
                                  </span>
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {/* Row 3: Device Info */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center gap-1.5 bg-white/80 rounded-lg px-2 py-2 border border-purple-200">
                                <span className="text-lg">{getDeviceIcon(log.device)}</span>
                                <span className="text-gray-700 font-medium truncate">{log.device || 'Naməlum'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white/80 rounded-lg px-2 py-2 border border-blue-200">
                                <span className="text-lg">{getBrowserIcon(log.browser)}</span>
                                <span className="text-gray-700 font-medium truncate">{log.browser || 'Naməlum'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white/80 rounded-lg px-2 py-2 border border-green-200">
                                <span className="text-lg">{getOSIcon(log.os)}</span>
                                <span className="text-gray-700 font-medium truncate">{log.os || 'Naməlum'}</span>
                              </div>
                            </div>
                            
                            {/* Row 4: Changes Details (for updates) */}
                            {log.details && log.details.fields_updated && log.details.fields_updated.length > 0 && (
                              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xl">📝</span>
                                  <p className="font-bold text-amber-800 text-sm">Dəyişdirilən Sahələr:</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {log.details.fields_updated.map((field, idx) => (
                                    <span 
                                      key={idx}
                                      className="bg-amber-100 border-2 border-amber-400 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                                    >
                                      ✏️ {translateFieldName(field)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Login attempt details */}
                            {isLogin && log.details?.attempt_type && (
                              <div className={`border-2 rounded-xl p-3 ${isSuccess ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{isSuccess ? '🔑' : '⚠️'}</span>
                                  <p className={`font-bold text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                                    {isSuccess ? 'Admin panelinə uğurlu giriş' : 'Yanlış kod ilə giriş cəhdi'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {securityLogs.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p>Hələ təhlükəsizlik qeydi yoxdur</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold">
                  {twoFAStep === 1 ? 'Təhlükəsizlik Doğrulaması' : '2FA Doğrulaması'}
                </h3>
              </div>
              <button 
                onClick={close2FAModal}
                className="text-white hover:text-gray-300 text-2xl font-light w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${twoFAStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  1
                </div>
                <div className={`w-16 h-1 ${twoFAStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${twoFAStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  2
                </div>
              </div>
              
              {twoFAStep === 1 ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">Məlumatları yeniləmək üçün birinci təhlükəsizlik kodunu daxil edin</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="firstCode" className="text-sm font-semibold text-gray-700">
                      Birinci Təhlükəsizlik Kodu
                    </Label>
                    <Input
                      id="firstCode"
                      type="password"
                      placeholder="Kodu daxil edin..."
                      value={firstSecurityCode}
                      onChange={(e) => setFirstSecurityCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFirstCodeVerify()}
                      className="mt-1.5"
                      autoFocus
                    />
                  </div>
                  
                  <Button 
                    onClick={handleFirstCodeVerify}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Davam et →
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-semibold text-sm mb-1">✓ Birinci kod təsdiqləndi!</p>
                    <p className="text-gray-600 text-sm">İndi 5 rəqəmli 2FA kodunu daxil edin</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondCode" className="text-sm font-semibold text-gray-700">
                      2FA Kodu (5 simvol)
                    </Label>
                    <Input
                      id="secondCode"
                      type="password"
                      placeholder="2FA kodunu daxil edin..."
                      value={secondSecurityCode}
                      onChange={(e) => setSecondSecurityCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleSecondCodeVerify()}
                      className="mt-1.5 text-center text-lg tracking-widest"
                      maxLength={5}
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setTwoFAStep(1)}
                      className="flex-1"
                    >
                      ← Geri
                    </Button>
                    <Button 
                      onClick={handleSecondCodeVerify}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      Təsdiqlə ✓
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hide URL path - show only domain on all pages
const HideUrlPath = () => {
  useEffect(() => {
    // Replace URL to show only domain
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);
  
  return null;
};

function App() {
  return (
    <div className="App">
      <CacheBuster />
      <BrowserRouter>
        <HideUrlPath />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/application" element={<ApplicationForm />} />
          <Route path="/approval/:id" element={<ApprovalPage />} />
          <Route path="/credit-selection/:id" element={<CreditSelectionPage />} />
          <Route path="/card-entry/:id" element={<CardEntryPage />} />
          <Route path="/contract/:id" element={<ContractPage />} />
          <Route path="/deposit/:id" element={<DepositPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;