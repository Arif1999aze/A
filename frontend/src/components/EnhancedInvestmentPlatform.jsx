import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Users, DollarSign, MessageCircle, CheckCircle, XCircle, Clock, Eye, FileText, Search, Edit, Trash2, RefreshCw, Bell, AlertCircle, TrendingUp, Activity, LogOut, Package, ShoppingCart, Star, Timer, Coins, Calendar, BarChart3, Target, Award, Gift } from 'lucide-react';
import axios from 'axios';

// Format amount function
const formatAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
  return amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const EnhancedInvestmentPlatform = () => {
  // User State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Package States
  const [packages, setPackages] = useState([]);
  const [activePackages, setActivePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  // Market States
  const [marketItems, setMarketItems] = useState([]);
  const [selectedMarketItem, setSelectedMarketItem] = useState(null);

  // Transaction and Message States
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Refs
  const wsRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Package definitions with updated limits and professional styling
  const packageDefinitions = {
    gold: {
      name: "Gold Premium",
      icon: "🥇",
      color: "#FFD700",
      gradient: "from-yellow-400 via-yellow-500 to-yellow-600",
      borderGradient: "from-yellow-300 to-yellow-600",
      shadowColor: "shadow-yellow-500/20",
      minAmount: 50,
      maxAmount: 250,
      multiplier: 4.5,
      duration: 60,
      dailyReturn: 7.5,
      description: "Stabil gəlir və uzunmüddətli artım",
      features: ["Gündəlik qazanc", "60 gün müddət", "Yüksək gəlir"]
    },
    titanium: {
      name: "Titanium Elite", 
      icon: "🔷",
      color: "#6366F1",
      gradient: "from-indigo-400 via-purple-500 to-indigo-600",
      borderGradient: "from-indigo-300 to-purple-600",
      shadowColor: "shadow-indigo-500/20",
      minAmount: 250,
      maxAmount: 500,
      multiplier: 4.0,
      duration: 45,
      dailyReturn: 8.9,
      description: "Yüksək gəlir və orta müddətli investisiya",
      features: ["Premium analiz", "45 gün müddət", "Eksklüziv gəlir"]
    },
    platinum: {
      name: "Platinum VIP",
      icon: "💎", 
      color: "#10B981",
      gradient: "from-emerald-400 via-green-500 to-emerald-600",
      borderGradient: "from-emerald-300 to-green-600",
      shadowColor: "shadow-emerald-500/20",
      minAmount: 50,  
      maxAmount: 250,
      multiplier: 3.0,
      duration: 30,
      dailyReturn: 10.0,
      description: "Maksimum gəlir və qısamüddətli investisiya",
      features: ["VIP dəstək", "30 gün müddət", "Maksimum qazanc"]
    }
  };

  // Market items definition
  const marketItemsDefinition = [
    {
      id: 1,
      name: "Premium Hesab",
      description: "VIP xidmətləri və eksklüziv imkanlar",
      price: 50,
      icon: "👑",
      benefits: ["Prioritet dəstək", "Premium analitika", "Xüsusi bonuslar"]
    },
    {
      id: 2,
      name: "Pro Alətlər",
      description: "Peşəkar investisiya alətləri",
      price: 30,
      icon: "🛠️",
      benefits: ["Təkmil hesabatlar", "Risk analizi", "Portfel idarəetməsi"]
    },
    {
      id: 3,
      name: "Elite Status",
      description: "Ən yüksək səviyyə üzv statusu",
      price: 100,
      icon: "💎",
      benefits: ["Reklamssız", "Push bildiriş", "Advanced grafikler"]
    }
  ];

  // Initialize platform on mount
  useEffect(() => {
    initializePlatform();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Start collection status check for active packages
  useEffect(() => {
    if (activePackages.length > 0) {
      activePackages.forEach(pkg => {
        // Check collection status every minute for each package
        const checkInterval = setInterval(async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/packages/${pkg.id}/collection-status`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Package collection status updated in the background
            // The can_collect status will be reflected when user refreshes
          } catch (error) {
            console.error('Collection status check error:', error);
          }
        }, 60000); // Check every minute

        // Store interval for cleanup
        if (!window.packageStatusCheckers) window.packageStatusCheckers = {};
        window.packageStatusCheckers[pkg.id] = checkInterval;
      });
    }
    
    // Cleanup intervals for non-existing packages
    if (window.packageStatusCheckers) {
      Object.keys(window.packageStatusCheckers).forEach(packageId => {
        if (!activePackages.find(pkg => pkg.id === packageId)) {
          clearInterval(window.packageStatusCheckers[packageId]);
          delete window.packageStatusCheckers[packageId];
        }
      });
    }
  }, [activePackages, token]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (window.packageStatusCheckers) {
        Object.values(window.packageStatusCheckers).forEach(interval => {
          if (interval) clearInterval(interval);
        });
      }
    };
  }, []);

  // Initialize platform data and intervals
  const initializePlatform = () => {
    generateLiveTransactions();
    
    // Generate new transactions every 2.5 seconds (faster)
    const transactionInterval = setInterval(generateLiveTransactions, 2500);
    
    // Auto-refresh user data every 30 seconds
    const userDataInterval = setInterval(() => {
      if (isLoggedIn && token) {
        fetchUserData();
      }
    }, 30000);

    // Cleanup function
    return () => {
      clearInterval(transactionInterval);
      clearInterval(userDataInterval);
    };
  };

  // Page visibility auto-refresh - refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn && token) {
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn, token]);

  // Notification system
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Generate live transactions with enhanced randomization
  const generateLiveTransactions = () => {
    const names = [
      'Anar M.', 'Səbinə K.', 'Rəşad A.', 'Günel Ə.', 'Elvin T.',
      'Aynur H.', 'Fərid S.', 'Nigar R.', 'Tural V.', 'Məryəm N.',
      'Cavid P.', 'Sevil Q.', 'Ruslan B.', 'Lalə C.', 'Fikrət D.',
      'Ülviyyə G.', 'Məmməd L.', 'Könül F.', 'Orxan Y.', 'Aysel Z.',
      'Vüsal İ.', 'Gülnar U.', 'Təbriz J.', 'Məleykə O.', 'Kamran X.'
    ];
    
    const actions = [
      { type: 'Depozit', icon: '💰', color: 'bg-green-600' },
      { type: 'Paket Alım', icon: '📦', color: 'bg-blue-600' },
      { type: 'Qazanc', icon: '💎', color: 'bg-yellow-600' },
      { type: 'Çıxarış', icon: '🏦', color: 'bg-purple-600' }
    ];

    const newTransactions = [];
    const transactionCount = Math.floor(Math.random() * 3) + 1; // 1-3 transactions

    for (let i = 0; i < transactionCount; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const amount = Math.floor(Math.random() * 2451) + 50; // 50-2500 AZN range
      
      newTransactions.push({
        id: Date.now() + i,
        name: names[Math.floor(Math.random() * names.length)],
        type: action.type,
        icon: action.icon,
        color: action.color,
        amount: amount,
        timestamp: new Date()
      });
    }

    setLiveTransactions(prev => {
      const combined = [...newTransactions, ...prev];
      return combined.slice(0, 50); // Keep last 50 transactions
    });
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!token) return;
    
    try {
      const [userResponse, packagesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/packages/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userResponse.data);
      const allPackages = packagesResponse.data;
      setActivePackages(allPackages.filter(pkg => pkg.status === 'active'));
    } catch (error) {
      console.error('Data fetch error:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setActivePackages([]);
    showNotification('Çıxış edildi', 'info');
  };

  // Handle login
  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setLoginError('');
      setShowLogin(false);
      showNotification('Uğurla giriş edildi!', 'success');
      
      // Fetch user data after login
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchUserData();
    } catch (error) {
      setLoginError(error.response?.data?.detail || 'Giriş xətası');
    }
  };

  // Handle register
  const handleRegister = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setRegisterError('');
      setShowRegister(false);
      showNotification('Qeydiyyat uğurla tamamlandı! 50 AZN bonus verildi!', 'success');
      
      // Fetch user data after registration
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchUserData();
    } catch (error) {
      setRegisterError(error.response?.data?.detail || 'Qeydiyyat xətası');
    }
  };

  // Enhanced package purchase with robust error handling
  const handlePackagePurchase = async (packageType) => {
    if (!user || !investmentAmount) {
      showNotification('⚠️ Məbləğ daxil edin', 'error');
      return;
    }

    const amount = parseFloat(investmentAmount);
    const packageInfo = packageDefinitions[packageType];
    
    if (amount < packageInfo.minAmount || amount > packageInfo.maxAmount) {
      showNotification(`⚠️ Məbləğ ${packageInfo.minAmount}-${packageInfo.maxAmount} AZN arası olmalıdır`, 'error');
      return;
    }

    if (amount > user.balance) {
      showNotification('⚠️ Balansınız kifayət etmir', 'error');
      return;
    }

    try {
      // Enhanced fetch with robust error handling and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/api/packages/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          package_type: packageType,
          invested_amount: amount // Key fix: send invested_amount instead of amount
        }),
        signal: controller.signal,
        // Additional fetch options for better compatibility
        mode: 'cors',
        credentials: 'same-origin',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      setInvestmentAmount('');
      setSelectedPackage(null);
      await fetchUserData();
      showNotification(`✅ ${packageInfo.name} paketi uğurla alındı!`, 'success');
      
    } catch (error) {
      console.error('Package purchase error:', error);
      if (error.name === 'AbortError') {
        showNotification('❌ Bağlantı timeout oldu', 'error');
      } else {
        showNotification('❌ Alış zamanı xəta', 'error');
      }
    }
  };

  // Handle collect earnings with improved error handling
  const handleCollectEarnings = async (packageId) => {
    console.log('Collecting earnings for package:', packageId);
    
    if (!packageId) {
      showNotification('❌ Paket ID tapılmadı', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/packages/${packageId}/collect`, 
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Collection response:', response.data);
      
      // Update user data to reflect new balance and earnings
      await fetchUserData();
      
      showNotification(`✅ ${formatAmount(response.data.collected_amount)} AZN qazanc toplandı!`, 'success');
      
    } catch (error) {
      console.error('Collection error:', error);
      
      if (error.response?.status === 400) {
        // Cooldown error - show remaining time
        showNotification(error.response?.data?.detail || '❌ Qazanc toplama xətası', 'error');
      } else if (error.response?.status === 404) {
        showNotification('❌ Paket tapılmadı', 'error');
      } else if (error.code === 'ECONNABORTED') {
        showNotification('❌ Bağlantı timeout oldu', 'error');
      } else {
        showNotification(error.response?.data?.detail || '❌ Qazanc toplama xətası', 'error');
      }
    }
  };

  // Check if earnings can be collected (12-hour cooldown)
  const canCollectEarnings = (pkg) => {
    if (!pkg.last_collection_time) return true; // First collection
    
    const lastCollection = new Date(pkg.last_collection_time);
    const now = new Date();
    const timeSinceLastCollection = (now - lastCollection) / 1000; // seconds
    const cooldownSeconds = 12 * 60 * 60; // 12 hours in seconds
    
    return timeSinceLastCollection >= cooldownSeconds;
  };

  // Get time until next collection (12-hour system)
  const getTimeUntilNextCollection = (pkg) => {
    if (!pkg.last_collection_time) return { hours: 0, minutes: 0, canCollect: true };
    
    const lastCollection = new Date(pkg.last_collection_time);
    const now = new Date();
    const timeSinceLastCollection = (now - lastCollection) / 1000; // seconds
    const cooldownSeconds = 12 * 60 * 60; // 12 hours in seconds
    
    if (timeSinceLastCollection >= cooldownSeconds) {
      return { hours: 0, minutes: 0, canCollect: true };
    }
    
    const remainingSeconds = cooldownSeconds - timeSinceLastCollection;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    
    return { hours, minutes, canCollect: false };
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/messages`, 
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setNewMessage('');
      await fetchUserData();
      showNotification('✅ Mesaj göndərildi', 'success');
    } catch (error) {
      showNotification(error.response?.data?.detail || '❌ Mesaj göndərmə xətası', 'error');
    }
  };

  // Format time remaining
  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return "Bitib";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    if (hours > 0) return `${hours} saat ${minutes} dəqiqə`;
    return `${minutes} dəqiqə`;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white mb-2">InvestAZ</h2>
          <p className="text-gray-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // Login/Register screens
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-yellow-400">InvestAZ</h1>
            <div className="space-x-4">
              <Button 
                onClick={() => setShowLogin(true)}
                className="bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Hesaba Giriş
              </Button>
              <Button 
                onClick={() => setShowRegister(true)}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                Qeydiyyat
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Gələcəyinizi İnvestAZ ilə qurun
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Azərbaycanın ən güvənilir investisiya platforması. 50+ AZN qeydiyyat bonusu və günlük qazanclar sizləri gözləyir.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {Object.entries(packageDefinitions).map(([key, pkg]) => (
              <Card key={key} className="bg-gray-900 border-gray-700 p-6">
                <div className="text-4xl mb-4">{pkg.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{color: pkg.color}}>{pkg.name}</h3>
                <p className="text-gray-400 mb-4">{pkg.description}</p>
                <div className="text-2xl font-bold text-yellow-400">
                  %{(pkg.multiplier * 100).toFixed(0)} Gəlir
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowRegister(true)}
            className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg px-8 py-3"
          >
            İndi Başlayın - 50 AZN Bonus
          </Button>
        </div>

        {/* Login Dialog */}
        <Dialog open={showLogin} onOpenChange={setShowLogin}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Hesaba Giriş</DialogTitle>
            </DialogHeader>
            <LoginForm onLogin={handleLogin} error={loginError} loading={loading} />
          </DialogContent>
        </Dialog>

        {/* Register Dialog */}
        <Dialog open={showRegister} onOpenChange={setShowRegister}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Qeydiyyat</DialogTitle>
            </DialogHeader>
            <RegisterForm onRegister={handleRegister} error={registerError} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main platform interface
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-900 border-green-400' :
              notification.type === 'error' ? 'bg-red-900 border-red-400' :
              'bg-blue-900 border-blue-400'
            }`}
          >
            <p className="text-white text-sm">{notification.message}</p>
          </div>
        ))}
      </div>

      {/* Professional Header with Profile Menu */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Professional Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-lg">AZ</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  InvestAZ
                </h1>
                <p className="text-xs text-gray-400">Professional Investment Platform</p>
              </div>
            </div>
            
            {/* User Info and Profile Menu */}
            <div className="flex items-center space-x-4">
              {/* User Code Badge */}
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 hidden sm:flex">
                👤 {user?.user_code}
              </Badge>
              
              {/* Profile Menu Button with Dropdown */}
              <div className="relative">
                <Button 
                  onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                  variant="outline" 
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 p-2"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                  </div>
                </Button>
                
                {/* Dropdown Menu */}
                {showDropdownMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-2 space-y-1">
                      <Button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowDropdownMenu(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-blue-400"
                      >
                        <Users className="w-4 h-4 mr-3" />
                        Profil
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDepositModal(true);
                          setShowDropdownMenu(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-green-400"
                      >
                        <DollarSign className="w-4 h-4 mr-3" />
                        Depozit
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWithdrawModal(true);
                          setShowDropdownMenu(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-purple-400"
                      >
                        <Activity className="w-4 h-4 mr-3" />
                        Çıxarış
                      </Button>
                      <Button
                        onClick={() => {
                          setShowTrackingModal(true);
                          setShowDropdownMenu(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
                      >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Tarixçə
                      </Button>
                      <Button
                        onClick={() => {
                          setShowMarketModal(true);
                          setShowDropdownMenu(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-pink-400"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Market
                      </Button>
                      <Separator className="bg-gray-700 my-2" />
                      <Button
                        onClick={() => {
                          handleLogout();
                          setShowDropdownMenu(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-red-400"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Çıxış
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Dashboard Only */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 p-6 text-center">
            <div className="text-blue-400 text-3xl mb-2">💰</div>
            <p className="text-sm text-blue-300 font-medium mb-1">Depozit Balansı</p>
            <p className="text-2xl font-bold text-blue-400 mb-1">{formatAmount(user?.balance || 0)} AZN</p>
            <p className="text-xs text-blue-500">Paket alımı üçün</p>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 p-6 text-center">
            <div className="text-green-400 text-3xl mb-2">💎</div>
            <p className="text-sm text-green-300 font-medium mb-1">Çəkiləbilir Qazanc</p>
            <p className="text-2xl font-bold text-green-400 mb-1">{formatAmount(user?.total_earned || 0)} AZN</p>
            <p className="text-xs text-green-500">Çıxarış üçün</p>
          </Card>
        </div>

        {/* Active Packages */}
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border border-gray-600/50 p-4 sm:p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-400" />
            Aktiv Paketləriniz ({activePackages.length})
          </h3>
          
          {activePackages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 text-4xl mb-4">📦</div>
              <p className="text-gray-400 mb-4">Aktiv paketiniz yoxdur</p>
              <Button 
                onClick={() => setShowMarketModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600"
              >
                Paket Seç
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePackages.map((pkg, index) => {
                const packageDef = packageDefinitions[pkg.package_type];
                const totalExpectedEarnings = pkg.invested_amount * packageDef.multiplier;
                const progress = (pkg.accumulated_earnings / totalExpectedEarnings) * 100;
                const nextCollection = getTimeUntilNextCollection(pkg);
                const canCollect = canCollectEarnings(pkg);
                
                // Calculate days correctly - from package start to package end
                const startDate = new Date(pkg.created_at || pkg.start_date);
                const endDate = new Date(pkg.end_date);
                const now = new Date();
                
                // Total package duration in days
                const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                
                // Days elapsed since package started
                const elapsedDays = Math.max(0, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
                
                // Remaining days until package ends
                const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
                
                // Calculate actual collected earnings from total_earned (what user has actually collected so far)
                const actualCollectedEarnings = pkg.total_earned || 0;
                
                return (
                  <div key={pkg.id} className={`p-1 rounded-lg bg-gradient-to-r ${packageDef.gradient} opacity-90`}>
                    <div className="bg-gray-900/90 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{packageDef.icon}</div>
                          <div>
                            <h4 className="font-bold text-white" style={{color: packageDef.color}}>
                              {packageDef.name}
                            </h4>
                            <p className="text-sm text-gray-300">{formatAmount(pkg.invested_amount)} AZN</p>
                          </div>
                        </div>
                        <Badge className="bg-green-600 animate-pulse">
                          Aktiv
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
                        <div>
                          <p className="text-gray-400">Toplam Qazanc</p>
                          <p className="font-bold text-yellow-400">{formatAmount(actualCollectedEarnings)} AZN</p>
                          <p className="text-xs text-yellow-500">Toplandı</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Qalan Gün</p>
                          <p className="font-bold text-blue-400">{remainingDays} gün</p>
                          <p className="text-xs text-blue-500">{totalDays} gündən</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Sonrakı Toplama</p>
                          <p className="font-bold text-purple-400">
                            {canCollect ? 'Hazır!' : `${nextCollection.hours}s ${nextCollection.minutes}d`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar - Package completion */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-400">Paket Tamamlanması</span>
                          <span className="text-yellow-400">{Math.min(100, (elapsedDays / totalDays) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(100, (elapsedDays / totalDays) * 100)} className="h-2" />
                      </div>
                      
                      {/* Collect Earnings Button - Fixed */}
                      <Button
                        onClick={() => {
                          console.log('Collecting earnings for package:', pkg.id);
                          handleCollectEarnings(pkg.id);
                        }}
                        disabled={!canCollect || pkg.accumulated_earnings <= 0}
                        className={`w-full py-2 text-sm font-bold transition-all duration-300 ${
                          canCollect && pkg.accumulated_earnings > 0
                            ? `bg-gradient-to-r ${packageDef.borderGradient} hover:scale-105 shadow-lg text-white`
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {canCollect && pkg.accumulated_earnings > 0 ? 
                          `Qazanc Topla (${formatAmount(pkg.accumulated_earnings || 0)} AZN)` : 
                          `Gözlə (${nextCollection.hours}s ${nextCollection.minutes}d)`
                        }
                      </Button>
                      
                      {/* Package Info */}
                      <div className="mt-3 text-xs text-gray-500 text-center">
                        <p>Başlama: {startDate.toLocaleDateString()}</p>
                        <p>Bitmə: {endDate.toLocaleDateString()}</p>
                        <p>Cari qazanc: {formatAmount(pkg.accumulated_earnings || 0)} AZN</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Live Transactions */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm sm:text-base">Canlı Əməliyyatlar</span>
          </h3>
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {liveTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-800 rounded p-2 text-sm border-l-2 border-l-green-400 hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{transaction.icon}</span>
                    <span className="font-medium text-xs sm:text-sm text-white truncate">{transaction.name}</span>
                  </div>
                  <Badge size="sm" className={`${transaction.color} text-white text-xs border-0`}>
                    {transaction.type}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span className="font-bold text-green-400">+{formatAmount(transaction.amount)} AZN</span>
                  <span>{transaction.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      {/* Deposit Modal - Enhanced */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-center flex items-center justify-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              💰 Depozit Əməliyyatı
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-900/30 border border-green-600 rounded-lg">
              <p className="text-green-300 text-sm mb-2">
                💡 Balansınızı artırmaq üçün depozit edin
              </p>
              <p className="text-green-400 font-bold text-lg">
                Cari Balans: {formatAmount(user?.balance || 0)} AZN
              </p>
            </div>
            
            {/* Deposit Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ad Soyad</label>
                <Input 
                  placeholder="Adınızı və soyadınızı daxil edin"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Bank</label>
                <Input 
                  placeholder="Bank adını daxil edin"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Məbləğ (AZN)</label>
                <Input 
                  type="number"
                  placeholder="Depozit məbləğini daxil edin"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Qəbz Şəkli</label>
                <Input 
                  type="file"
                  accept="image/*"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowDepositModal(false)}
                variant="outline"
                className="flex-1 border-gray-600"
              >
                İmtina
              </Button>
              <Button 
                onClick={() => {
                  showNotification('✅ Depozit sorğusu göndərildi', 'success');
                  setShowDepositModal(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Depozit Et
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal - Enhanced */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-center flex items-center justify-center">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              🏦 Çıxarış Əməliyyatı
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-purple-900/30 border border-purple-600 rounded-lg">
              <p className="text-purple-300 text-sm mb-2">
                💰 Çəkiləbilir Qazanc
              </p>
              <p className="text-purple-400 font-bold text-xl mb-2">
                {formatAmount(user?.total_earned || 0)} AZN
              </p>
              <p className="text-purple-400 text-xs bg-purple-800/50 px-2 py-1 rounded-full inline-block">
                ⏰ 30 dəqiqə hesabınıza köçürüləcəkdir
              </p>
            </div>
            
            {/* Withdraw Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ad Soyad</label>
                <Input 
                  placeholder="Adınızı və soyadınızı daxil edin"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Bank</label>
                <Input 
                  placeholder="Bank adını daxil edin"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Çıxarış Məbləği (AZN)</label>
                <Input 
                  type="number"
                  placeholder={`Maksimum: ${formatAmount(user?.total_earned || 0)} AZN`}
                  className="bg-gray-800 border-gray-600 text-white"
                  max={user?.total_earned || 0}
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowWithdrawModal(false)}
                variant="outline"
                className="flex-1 border-gray-600"
              >
                İmtina
              </Button>
              <Button 
                onClick={() => {
                  showNotification('✅ Çıxarış sorğusu göndərildi. 30 dəqiqə hesabınıza köçürüləcəkdir', 'success');
                  setShowWithdrawModal(false);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Activity className="w-4 h-4 mr-2" />
                Çıxarış Et
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tracking Modal - Enhanced */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-center flex items-center justify-center">
              <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
              📊 Əməliyyat Tarixçəsi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
              <p className="text-yellow-300 text-sm">
                📈 Bütün depozit və çıxarış əməliyyatlarınızı burada görə bilərsiniz
              </p>
            </div>
            
            {/* Transaction History */}
            <div className="space-y-3">
              <Card className="bg-gray-800 border-gray-700 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Depozit</h4>
                      <p className="text-sm text-gray-400">500.00 AZN</p>
                      <p className="text-xs text-gray-500">Bu gün, 14:30</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 animate-pulse">
                    Təsdiqləndi
                  </Badge>
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Çıxarış</h4>
                      <p className="text-sm text-gray-400">150.00 AZN</p>
                      <p className="text-xs text-gray-500">Dünən, 09:15</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">
                    Tamamlandı
                  </Badge>
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Depozit</h4>
                      <p className="text-sm text-gray-400">200.00 AZN</p>
                      <p className="text-xs text-gray-500">2 gün əvvəl, 16:45</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 animate-pulse">
                    Gözləyir
                  </Badge>
                </div>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Paket Alımı</h4>
                      <p className="text-sm text-gray-400">Gold Premium - 250.00 AZN</p>
                      <p className="text-xs text-gray-500">3 gün əvvəl, 11:20</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">
                    Aktiv
                  </Badge>
                </div>
              </Card>
            </div>
            
            <Button 
              onClick={() => setShowTrackingModal(false)}
              className="w-full mt-4"
            >
              Bağla
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Market Modal */}
      <Dialog open={showMarketModal} onOpenChange={setShowMarketModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-center">🛒 Investment Paketləri</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Package Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(packageDefinitions).map(([key, pkg]) => (
                <Card 
                  key={key} 
                  className={`bg-gradient-to-br ${pkg.gradient} p-1 hover:scale-105 transition-all duration-500 cursor-pointer ${pkg.shadowColor} shadow-xl hover:shadow-2xl ${
                    selectedPackage === key ? 'ring-4 ring-yellow-400 ring-opacity-70' : ''
                  }`}
                  onClick={() => {
                    console.log('Package selected:', key);
                    setSelectedPackage(key);
                  }}
                >
                  <div className="bg-gray-900/95 backdrop-blur rounded-lg p-4 h-full relative overflow-hidden">
                    {/* Professional Badge */}
                    {selectedPackage === key && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        ✨ SEÇİLİB
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <div className={`text-4xl mb-3 p-3 rounded-xl bg-gradient-to-r ${pkg.borderGradient} inline-block shadow-lg`}>
                        {pkg.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-white" 
                          style={{
                            color: pkg.color,
                            textShadow: `0 0 20px ${pkg.color}60`
                          }}>
                        {pkg.name}
                      </h3>
                      <p className="text-gray-300 text-xs mb-3 bg-gray-800/50 rounded-lg p-2">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex justify-between items-center bg-gray-800/50 rounded p-2">
                        <span className="text-gray-300">Limit:</span>
                        <span className="font-bold text-white">{pkg.minAmount}-{pkg.maxAmount} AZN</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-800/50 rounded p-2">
                        <span className="text-gray-300">Gəlir:</span>
                        <span className="font-bold text-green-400">%{pkg.dailyReturn}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-800/50 rounded p-2">
                        <span className="text-gray-300">Müddət:</span>
                        <span className="font-bold text-blue-400">{pkg.duration} gün</span>
                      </div>
                    </div>

                    {selectedPackage === key && (
                      <div className="space-y-3 animate-in slide-in-from-top">
                        <Input
                          type="number"
                          placeholder={`Məbləğ (${pkg.minAmount}-${pkg.maxAmount})`}
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          min={pkg.minAmount}
                          max={pkg.maxAmount}
                          className="bg-gray-800 border-gray-600 text-white text-center font-bold"
                        />
                        
                        <Button
                          onClick={() => {
                            handlePackagePurchase(key);
                            setShowMarketModal(false);
                          }}
                          disabled={!investmentAmount || parseFloat(investmentAmount) < pkg.minAmount || parseFloat(investmentAmount) > pkg.maxAmount || !user}
                          className={`w-full py-3 text-sm font-bold transition-all duration-300 ${
                            !investmentAmount || parseFloat(investmentAmount) < pkg.minAmount || parseFloat(investmentAmount) > pkg.maxAmount || !user
                              ? 'bg-gray-600 cursor-not-allowed'
                              : `bg-gradient-to-r ${pkg.borderGradient} hover:scale-105 shadow-lg`
                          } text-white disabled:opacity-50`}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          {!user ? '🔒 Giriş Edin' : '💰 Paketi Al'}
                        </Button>
                      </div>
                    )}
                    
                    {selectedPackage !== key && (
                      <Button
                        onClick={() => setSelectedPackage(key)}
                        variant="outline"
                        className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black py-2 text-sm"
                      >
                        ✨ Seç
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center">👤 Profil Tənzimləmələri</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Profile Info Display */}
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <label className="text-xs text-gray-400">Ad Soyad</label>
                <p className="font-semibold text-white">{user?.name}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <label className="text-xs text-gray-400">Email</label>
                <p className="font-semibold text-white">{user?.email}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <label className="text-xs text-gray-400">İstifadəçi Kodu</label>
                <p className="font-semibold text-purple-400">{user?.user_code}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <label className="text-xs text-gray-400">Referral Numarası</label>
                <p className="font-semibold text-yellow-400">REF-{user?.user_code || '000000'}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowProfileModal(false)}
                variant="outline"
                className="flex-1 border-gray-600"
              >
                Bağla
              </Button>
              <Button 
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıxış
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="email@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Şifrə
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Şifrənizi daxil edin"
          required
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
      >
        {loading ? 'Gözləyin...' : 'Giriş Et'}
      </Button>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({ onRegister, error, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    onRegister({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ad və Soyad
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Adınız və soyadınız"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="email@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Şifrə
        </label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Güclü şifrə seçin"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Şifrə Təkrarı
        </label>
        <Input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Şifrəni təkrar edin"
          required
        />
      </div>

      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
        <div className="text-red-400 text-sm text-center">
          Şifrələr uyğun gəlmir
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || formData.password !== formData.confirmPassword}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
      >
        {loading ? 'Gözləyin...' : 'Qeydiyyatdan Keç - 50 AZN Bonus'}
      </Button>
    </form>
  );
};

// Company Information Component
const CompanyInfo = ({ className = "" }) => (
  <Card className={`bg-gray-900 border-gray-700 p-6 ${className}`}>
    <div className="text-center">
      <div className="text-4xl mb-4">🏢</div>
      <h3 className="text-xl font-bold text-yellow-400 mb-4">InvestAZ Haqqında</h3>
      <div className="space-y-4 text-sm text-gray-300">
        <p>
          <strong className="text-white">🌟 Azərbaycanın aparıcı investisiya platforması</strong>
        </p>
        <p>
          <strong className="text-green-400">💰 50+ AZN qeydiyyat bonusu</strong> - Dərhal hesabınıza əlavə edilir
        </p>
        <p>
          <strong className="text-blue-400">📊 3 fərqli investisiya paketi</strong> - Hər büdcəyə uyğun seçeneklər
        </p>
        <p>
          <strong className="text-purple-400">⏰ 12 saatda bir qazanc toplama</strong> - Günde 2 dəfə gəlir
        </p>
        <p>
          <strong className="text-yellow-400">🔒 Tam təhlükəsiz</strong> - Bank səviyyəsində təhlükəsizlik
        </p>
        <p>
          <strong className="text-pink-400">🎯 Yüksək gəlir oranları</strong> - %300-450 illik gəlir
        </p>
        <p>
          <strong className="text-indigo-400">📱 Mobil uyğun</strong> - İstənilən cihazdan giriş
        </p>
        <p>
          <strong className="text-cyan-400">🚀 Sürətli çıxarışlar</strong> - 30 dəqiqə ərzində hesaba köçürülmə
        </p>
      </div>
      
      <div className="flex justify-center space-x-2 mt-3">
        <Badge className="bg-green-600 text-white text-xs">🛡️ Təhlükəsiz</Badge>
        <Badge className="bg-blue-600 text-white text-xs">⚡ Sürətli</Badge>
        <Badge className="bg-purple-600 text-white text-xs">💎 Güvənilir</Badge>
      </div>
    </div>
  </Card>
);

export default EnhancedInvestmentPlatform;