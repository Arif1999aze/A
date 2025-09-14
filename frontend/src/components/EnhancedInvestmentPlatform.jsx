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
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Package States
  const [packages, setPackages] = useState([]);
  const [activePackages, setActivePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [countdownTimers, setCountdownTimers] = useState({});
  const [autoCollectionEnabled, setAutoCollectionEnabled] = useState(true);

  // Market States
  const [marketItems, setMarketItems] = useState([]);
  const [selectedMarketItem, setSelectedMarketItem] = useState(null);

  // Transaction States
  const [transactions, setTransactions] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);

  // Message States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [canSendMessage, setCanSendMessage] = useState(true);

  // Real-time States
  const [websocket, setWebsocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);

  // Package definitions with updated limits
  const packageDefinitions = {
    gold: {
      name: "Gold Paket",
      icon: "🥇",
      color: "#FFD700",
      gradient: "from-yellow-400 to-yellow-600",
      minAmount: 50,
      maxAmount: 250,
      multiplier: 4.5,
      duration: 60,
      dailyReturn: 7.5,
      description: "Stabil gəlir və uzunmüddətli artım"
    },
    titanium: {
      name: "Titanium Paket", 
      icon: "🔷",
      color: "#9370DB",
      gradient: "from-purple-400 to-purple-600",
      minAmount: 250,
      maxAmount: 500,
      multiplier: 4.0,
      duration: 45,
      dailyReturn: 8.9,
      description: "Yüksək gəlir və orta müddətli investisiya"
    },
    platinum: {
      name: "Platinum Paket",
      icon: "💎", 
      color: "#E5E5E5",
      gradient: "from-gray-300 to-gray-500",
      minAmount: 50,  
      maxAmount: 250,
      multiplier: 3.0,
      duration: 30,
      dailyReturn: 10.0,
      description: "Maksimum gəlir və qısamüddətli investisiya"
    }
  };

  // Market Items - Virtual products/services
  const marketItemsData = [
    {
      id: 1,
      name: "Premium Analiz Paketi",
      icon: "📊",
      price: 150,
      category: "analiz",
      description: "Gündəlik bazar analizləri və investisiya tövsiyələri",
      benefits: ["Gündəlik analiz", "SMS bildirişlər", "30 gün dəstək"]
    },
    {
      id: 2,
      name: "VIP Konsultasiya",
      icon: "🎯",  
      price: 300,
      category: "konsultasiya",
      description: "Şəxsi investisiya məsləhətçisi ilə 1-1 görüş",
      benefits: ["2 saatlıq görüş", "Şəxsi strategiya", "3 ay izləmə"]
    },
    {
      id: 3,
      name: "Trading Botu",
      icon: "🤖",
      price: 500,
      category: "bot",
      description: "Avtomatik trading botu lisenziyası",
      benefits: ["24/7 işləmə", "AI alqoritmi", "1 il lisenziya"]
    },
    {
      id: 4,
      name: "Kriptovalyuta Kursu",
      icon: "🎓",
      price: 200,
      category: "təhsil",
      description: "Kriptovalyuta ticarəti üzrə tam kurs",
      benefits: ["20 video dərs", "Sertifikat", "Canlı dəstək"]
    },
    {
      id: 5,
      name: "Portfolio Optimizer",
      icon: "⚡",
      price: 100,
      category: "alət",
      description: "Portfolio optimallaşdırma aləti",
      benefits: ["Risk analizi", "Diversifikasiya", "Aylıq report"]
    },
    {
      id: 6,
      name: "Mobil Tətbiq Premium",
      icon: "📱",
      price: 80,
      category: "tətbiq",
      description: "Mobil app premium versiyası",
      benefits: ["Reklamssız", "Push bildiriş", "Advanced grafikler"]
    }
  ];

  // Initialize component
  useEffect(() => {
    initializePlatform();
    return () => {
      if (websocket) websocket.close();
    };
  }, []);

  // Check token on mount
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Start countdown timers for active packages
  useEffect(() => {
    if (activePackages.length > 0) {
      activePackages.forEach(pkg => {
        if (!countdownTimers[pkg.id]) {
          // Check if collection is available
          const lastCollection = pkg.last_collection_time ? new Date(pkg.last_collection_time) : null;
          const now = new Date();
          const timeSinceLastCollection = lastCollection ? (now - lastCollection) / 1000 : Infinity;
          
          if (timeSinceLastCollection >= 20 * 60) { // 20 minutes passed
            // Ready for collection, no countdown needed
            if (autoCollectionEnabled && pkg.accumulated_earnings > 0) {
              handleAutoCollection(pkg.id);
            }
          } else {
            // Start countdown for remaining time
            const remainingTime = (20 * 60) - timeSinceLastCollection;
            startCountdownTimer(pkg.id, remainingTime);
          }
        }
      });
    }
    
    // Cleanup timers for packages that no longer exist
    Object.keys(countdownTimers).forEach(packageId => {
      if (!activePackages.find(pkg => pkg.id === packageId)) {
        if (countdownTimers[packageId]) {
          clearInterval(countdownTimers[packageId]);
        }
        setCountdownTimers(prev => {
          const updated = { ...prev };
          delete updated[packageId];
          return updated;
        });
      }
    });
  }, [activePackages]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(countdownTimers).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);

  // Initialize platform
  const initializePlatform = () => {
    setMarketItems(marketItemsData);
    generateLiveTransactions();
  };

  // Auto-refresh functionality - Faster intervals
  useEffect(() => {
    if (isLoggedIn && user) {
      // Refresh user data every 5 seconds (faster)
      const userRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing user data...');
        fetchUserData();
      }, 5000);

      // Refresh live transactions every 2.5 seconds (faster for customer engagement)
      const liveTransactionInterval = setInterval(() => {
        generateLiveTransactions();
      }, 2500);

      return () => {
        clearInterval(userRefreshInterval);
        clearInterval(liveTransactionInterval);
      };
    }
  }, [isLoggedIn, user]);

  // Page visibility auto-refresh - refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn) {
        console.log('👁️ Page visible again, refreshing data...');
        fetchUserData();
        generateLiveTransactions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn]);

  // Validate token
  const validateToken = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/packages/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        await fetchUserData();
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);

      // Fetch user packages
      const packagesResponse = await axios.get(`${API_BASE_URL}/api/packages/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivePackages(packagesResponse.data);

      // Fetch transactions
      const transactionsResponse = await axios.get(`${API_BASE_URL}/api/transactions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(transactionsResponse.data);
      setPendingTransactions(transactionsResponse.data.filter(t => t.status === 'pending'));

      // Fetch messages
      const messagesResponse = await axios.get(`${API_BASE_URL}/api/messages/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messagesResponse.data);
      
      // Check if user can send message
      checkMessagePermission(messagesResponse.data);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Check message permission
  const checkMessagePermission = (userMessages) => {
    const userSentMessages = userMessages.filter(m => !m.is_from_admin);
    const adminReplies = userMessages.filter(m => m.is_from_admin);
    
    if (userSentMessages.length === 0) {
      setCanSendMessage(true);
      return;
    }
    
    const latestUserMessage = userSentMessages.reduce((latest, msg) => 
      new Date(msg.created_date) > new Date(latest.created_date) ? msg : latest
    );
    
    const hasAdminReplyAfter = adminReplies.some(msg => 
      new Date(msg.created_date) > new Date(latestUserMessage.created_date)
    );
    
    setCanSendMessage(hasAdminReplyAfter);
  };

  // Generate live transactions for animation - More diverse and colorful
  const generateLiveTransactions = () => {
    const names = [
      "Rəşad M.", "Ayşə Q.", "Mehman B.", "Günel S.", "Elvin T.", "Nigar H.", 
      "Fərid K.", "Səma A.", "Tural R.", "Leyla Ə.", "Kamran İ.", "Zəhra N.",
      "Orxan Y.", "Mehriban S.", "Eldən V.", "Aynur M.", "Ruslan Q.", "Könül A.",
      "İlham B.", "Sevda H.", "Murad T.", "Ülviyyə K.", "Vüsal E.", "Nərgiz F."
    ];
    
    // Enhanced amounts range: 50-2500 AZN for better engagement
    const amounts = [
      52, 89, 134, 187, 245, 298, 356, 423, 489, 567, 634, 712, 798, 856, 923, 
      1045, 1156, 1234, 1387, 1456, 1523, 1634, 1789, 1856, 1923, 2034, 2156, 
      2245, 2334, 2423, 2487
    ];
    const types = [
      { name: "depozit", color: "bg-blue-500", icon: "💰" },
      { name: "qazanc", color: "bg-green-500", icon: "📈" },
      { name: "çıxarış", color: "bg-purple-500", icon: "🏦" },
      { name: "bonus", color: "bg-yellow-500", icon: "🎁" },
      { name: "paket", color: "bg-pink-500", icon: "📦" }
    ];
    
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    const newTransaction = {
      id: Date.now() + Math.random(),
      name: names[Math.floor(Math.random() * names.length)],
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      type: selectedType.name,
      color: selectedType.color,
      icon: selectedType.icon,
      timestamp: new Date()
    };
    
    setLiveTransactions(prev => [newTransaction, ...prev.slice(0, 5)]); // Keep 6 transactions
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 2)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Handle login
  const handleLogin = async (email, password) => {
    setLoginError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      
      const newToken = response.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      setShowLogin(false);
      
      await fetchUserData();
      showNotification('✅ Uğurla daxil oldunuz!', 'success');
    } catch (error) {
      setLoginError(error.response?.data?.detail || 'Giriş xətası');
    } finally {
      setLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (name, email, password) => {
    setRegisterError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      
      const newToken = response.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      setShowRegister(false);
      
      await fetchUserData();
      showNotification('🎉 Qeydiyyat uğurlu! 50 AZN bonus əlavə edildi!', 'success');
    } catch (error) {
      setRegisterError(error.response?.data?.detail || 'Qeydiyyat xətası');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setActivePackages([]);
    setTransactions([]);
    setMessages([]);
    showNotification('👋 Çıxış edildi', 'info');
  };

  // Handle package purchase - Simplified and robust for all devices
  const handlePackagePurchase = async (packageType) => {
    console.log('📦 Paket alış başladıldı:', { packageType, amount: investmentAmount, userBalance: user?.balance });
    
    // Basic validations
    if (!investmentAmount || !selectedPackage || !packageType) {
      showNotification('❌ Paket və məbləğ seçin', 'error');
      return;
    }
    
    if (!user || !token) {
      showNotification('❌ İlk olaraq sisteme daxil olun', 'error');
      setShowLogin(true);
      return;
    }
    
    const amount = parseFloat(investmentAmount);
    const pkg = packageDefinitions[packageType];
    
    // Amount validation
    if (isNaN(amount) || amount <= 0) {
      showNotification('❌ Düzgün məbləğ daxil edin', 'error');
      return;
    }
    
    if (amount < pkg.minAmount || amount > pkg.maxAmount) {
      showNotification(`❌ Məbləğ ${pkg.minAmount}-${pkg.maxAmount} AZN arasında olmalıdır`, 'error');
      return;
    }
    
    if (user.balance < amount) {
      showNotification(`❌ Balansınız kifayət etmir. Lazım: ${formatAmount(amount)} AZN, Mövcud: ${formatAmount(user.balance)} AZN`, 'error');
      return;
    }

    // Show loading
    showNotification('⏳ Paket alınır...', 'info');
    
    try {
      console.log('🔄 API sorğusu göndərilir...');
      
      // Simple axios request - most reliable
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/packages/purchase`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          package_type: packageType,
          invested_amount: amount  // ✅ Backend expects "invested_amount"
        },
        timeout: 20000, // 20 seconds
        validateStatus: function (status) {
          return status < 500; // Resolve only if status is less than 500
        }
      });
      
      console.log('📡 API cavabı:', {
        status: response.status,
        data: response.data
      });
      
      if (response.status >= 400) {
        throw new Error(response.data?.detail || `HTTP ${response.status}`);
      }
      
      console.log('✅ Paket alış uğurlu');
      
      // Clear form
      setInvestmentAmount('');
      setSelectedPackage(null);
      
      // Refresh user data
      console.log('🔄 İstifadəçi məlumatları yenilənir...');
      await fetchUserData();
      
      // Success notification with detailed package info
      const dailyEarnings = (amount * pkg.multiplier) / pkg.duration;
      const totalEarnings = amount * pkg.multiplier;
      
      showNotification(
        `🎉 ${pkg.name} uğurla alındı!\n` +
        `💰 İnvestisiya: ${formatAmount(amount)} AZN\n` +
        `📈 Gündelik gəlir: ${formatAmount(dailyEarnings)} AZN\n` +
        `🏆 Toplam gəlir: ${formatAmount(totalEarnings)} AZN\n` +
        `⏰ 20 dəqiqədə bir qazanc toplayın!`, 
        'success'
      );
      
      // Switch to dashboard after short delay
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Paket alış xətası:', error);
      
      // Detailed error handling
      let errorMessage = 'Naməlum xəta';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Bağlantı vaxtı bitdi. İnternet bağlantınızı yoxlayın.';
      } else if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.message;
        
        if (status === 400) {
          errorMessage = detail || 'Yanlış məlumat göndərildi';
        } else if (status === 401) {
          errorMessage = 'Giriş vaxtınız bitib. Yenidən daxil olun.';
          setTimeout(() => {
            handleLogout();
          }, 2000);
        } else if (status === 403) {
          errorMessage = 'Bu əməliyyat üçün icazəniz yoxdur';
        } else if (status === 422) {
          errorMessage = detail || 'Məlumat doğrulanmadı';
        } else if (status >= 500) {
          errorMessage = 'Server xətası. Bir neçə dəqiqə sonra cəhd edin.';
        } else {
          errorMessage = detail || `Server xətası (${status})`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'İnternet bağlantısı problemi. Bağlantınızı yoxlayın.';
      } else {
        errorMessage = error.message || 'Paket alış zamanı xəta baş verdi';
      }
      
      console.log('📋 Xəta təfsilatı:', errorMessage);
      showNotification(`❌ ${errorMessage}`, 'error');
    }
  };

  // Handle market purchase
  const handleMarketPurchase = async (item) => {
    if (user.balance < item.price) {
      showNotification('❌ Balansınız kifayət etmir', 'error');
      return;
    }
    
    try {
      // Create a transaction for market item
      await axios.post(`${API_BASE_URL}/api/transactions`, {
        type: 'market_purchase',
        amount: item.price,
        description: `Market alışı: ${item.name}`,
        item_id: item.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchUserData();
      showNotification(`✅ ${item.name} uğurla alındı!`, 'success');
    } catch (error) {
      showNotification('❌ Alış zamanı xəta', 'error');
    }
  };

  // Handle earnings collection
  const handleCollectEarnings = async (packageId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/packages/${packageId}/collect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchUserData();
      showNotification('✅ Qazanc toplam balansa əlavə edildi!', 'success');
      
      // Restart countdown timer for this package
      startCountdownTimer(packageId);
      
    } catch (error) {
      showNotification(error.response?.data?.detail || '❌ Qazanc toplama xətası', 'error');
    }
  };

  // Countdown timer management
  const startCountdownTimer = (packageId, initialTime = 20 * 60) => {
    // Clear existing timer
    if (countdownTimers[packageId]) {
      clearInterval(countdownTimers[packageId]);
    }
    
    let timeLeft = Math.floor(initialTime);
    
    const timer = setInterval(() => {
      timeLeft--;
      
      setCountdownTimers(prev => ({
        ...prev,
        [packageId]: timeLeft
      }));
      
      // Auto-collect when timer reaches 0
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (autoCollectionEnabled) {
          handleAutoCollection(packageId);
        } else {
          // Remove timer and allow manual collection
          setCountdownTimers(prev => {
            const updated = { ...prev };
            delete updated[packageId];
            return updated;
          });
        }
      }
    }, 1000);
    
    setCountdownTimers(prev => ({
      ...prev,
      [packageId]: timeLeft
    }));
  };

  // Auto-collection function
  const handleAutoCollection = async (packageId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/packages/${packageId}/collect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchUserData();
      showNotification('🎉 Qazanc avtomatik olaraq balansa əlavə edildi!', 'success');
      
      // Restart timer for next collection
      startCountdownTimer(packageId);
      
    } catch (error) {
      console.error('Auto-collection error:', error);
      // Retry after 30 seconds if failed
      setTimeout(() => startCountdownTimer(packageId), 30000);
    }
  };
  
  // Format countdown time
  const formatCountdown = (seconds) => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !canSendMessage) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/messages`, {
        content: newMessage,
        message_type: 'support'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
                className="border-yellow-400 text-yellow-400"
              >
                Qeydiyyat
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section - Mobile Optimized */}
        <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              İnvestisiya ilə <span className="text-yellow-400">Gələcəyinizi</span> Qurun
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              InvestAZ platforması ilə güvənli və gəlirli investisiya imkanlarından yararlanın. 
              Peşəkar komandamız sizin üçün ən yaxşı investisiya həllərini təqdim edir.
            </p>
          </div>

          {/* Live Transactions - Mobile Responsive */}
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
              🔴 Canlı Əməliyyatlar
            </h3>
            <div className="max-w-2xl mx-auto space-y-2">
              {liveTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-900 rounded-lg p-3 sm:p-4 border-l-4 border-l-green-400 animate-in slide-in-from-right duration-500">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-lg">{transaction.icon}</span>
                      <span className="font-medium text-sm sm:text-base text-white">{transaction.name}</span>
                      <Badge className={`${transaction.color} text-white text-xs border-0`}>
                        {transaction.type}
                      </Badge>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-green-400 text-sm sm:text-base animate-pulse">
                        +{formatAmount(transaction.amount)} AZN
                      </p>
                      <p className="text-xs text-gray-500">{transaction.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Overview - Mobile First Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {Object.entries(packageDefinitions).map(([key, pkg]) => (
              <Card key={key} className="bg-gray-900 border-gray-700 p-4 sm:p-6 hover:border-yellow-400 transition-colors">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-3">{pkg.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-white" style={{color: pkg.color}}>
                    {pkg.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed min-h-[3rem]">
                    {pkg.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Limit:</span>
                      <span className="font-bold text-white">{pkg.minAmount}-{pkg.maxAmount} AZN</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Gündəlik gəlir:</span>
                      <span className="font-bold text-green-400">%{pkg.dailyReturn}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Müddət:</span>
                      <span className="font-bold text-white">{pkg.duration} gün</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Toplam gəlir:</span>
                      <span className="font-bold text-yellow-400">%{(pkg.multiplier * 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Call to Action - Mobile Optimized */}
          <div className="text-center">
            <Button 
              onClick={() => setShowRegister(true)}
              size="lg"
              className="bg-yellow-400 text-black hover:bg-yellow-500 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
            >
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              İndi Qoşul və 50 AZN Bonus Al!
            </Button>
          </div>
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

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right ${
              notification.type === 'success' ? 'bg-green-900/90 border-green-400' :
              notification.type === 'error' ? 'bg-red-900/90 border-red-400' :
              notification.type === 'warning' ? 'bg-yellow-900/90 border-yellow-400' :
              'bg-blue-900/90 border-blue-400'
            }`}
          >
            <div className="flex items-start space-x-2">
              <Bell className="w-4 h-4 mt-0.5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{notification.message}</p>
                <p className="text-xs text-gray-300 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header - Mobile Responsive */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center justify-between sm:justify-start space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">InvestAZ</h1>
              <Badge className="bg-purple-600 text-xs">
                {user?.user_code}
              </Badge>
            </div>
            
            {/* Enhanced Balance Info - Separated balances */}
            <div className="flex justify-between sm:justify-end items-center space-x-3 sm:space-x-6">
              <div className="text-center sm:text-right bg-gray-800 rounded-lg p-2">
                <p className="text-xs sm:text-sm text-gray-400">Depozit Balansı</p>
                <p className="text-sm sm:text-lg font-bold text-blue-400">{formatAmount(user?.balance || 0)} AZN</p>
                <p className="text-xs text-gray-500">Paket alımı üçün</p>
              </div>
              
              <div className="text-center sm:text-right bg-gray-800 rounded-lg p-2">
                <p className="text-xs sm:text-sm text-gray-400">Çəkiləbilir Qazanc</p>
                <p className="text-sm sm:text-lg font-bold text-green-400">{formatAmount(user?.total_earned || 0)} AZN</p>
                <p className="text-xs text-gray-500">Çıxarış üçün</p>
              </div>

              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="border-red-600 text-red-400 hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıxış
              </Button>
              
              {/* Mobile logout */}
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="border-red-600 text-red-400 sm:hidden px-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 mb-4 sm:mb-6 grid grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="packages" 
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Paketlər
            </TabsTrigger>
            <TabsTrigger 
              value="market" 
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Market
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Əməliyyatlar
            </TabsTrigger>
            <TabsTrigger 
              value="tracking" 
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Tarixçə
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Dəstək
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Mobile Responsive */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Package Details - Full width on mobile */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold">Aktiv Paketləriniz</h2>
                
                {activePackages.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-700 p-6 sm:p-8 text-center">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium mb-2">Aktiv paketiniz yoxdur</h3>
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">İnvestisiya etmək üçün paket seçin</p>
                    <Button 
                      onClick={() => setActiveTab('packages')}
                      className="bg-yellow-400 text-black hover:bg-yellow-500 w-full sm:w-auto"
                    >
                      Paket Seç
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {activePackages.map((pkg, index) => {
                      const packageDef = packageDefinitions[pkg.package_type];
                      const totalExpectedEarnings = pkg.invested_amount * packageDef.multiplier;
                      const progress = (pkg.accumulated_earnings / totalExpectedEarnings) * 100;
                      const timeRemaining = formatTimeRemaining(pkg.end_date);
                      const countdownTime = countdownTimers[pkg.id] || 0;
                      const dailyEarnings = (pkg.invested_amount * packageDef.multiplier) / packageDef.duration;
                      
                      return (
                        <Card key={pkg.id} className={`bg-gradient-to-r ${packageDef.gradient} p-1 relative`}>
                          <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
                            {/* Package Header - Enhanced */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl sm:text-3xl">{packageDef.icon}</div>
                                <div>
                                  <h3 className="text-lg sm:text-xl font-bold" style={{color: packageDef.color}}>
                                    {packageDef.name} #{index + 1}
                                  </h3>
                                  <p className="text-gray-400 text-sm">İnvestisya: {formatAmount(pkg.invested_amount)} AZN</p>
                                  <p className="text-green-400 text-xs">Gündelik gəlir: {formatAmount(dailyEarnings)} AZN</p>
                                </div>
                              </div>
                              <div className="flex flex-col space-y-2">
                                <Badge className="bg-green-600 animate-pulse self-start">
                                  Aktiv
                                </Badge>
                              </div>
                            </div>

                            {/* Enhanced Package Stats - More Detailed */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                              <div className="text-center bg-gray-800 rounded-lg p-3">
                                <p className="text-xs sm:text-sm text-gray-400">Paket Sonu Gəlir</p>
                                <p className="text-sm sm:text-lg font-bold text-green-400">
                                  {formatAmount(totalExpectedEarnings)} AZN
                                </p>
                              </div>
                              <div className="text-center bg-gray-800 rounded-lg p-3">
                                <p className="text-xs sm:text-sm text-gray-400">Cari Qazanc</p>
                                <p className="text-sm sm:text-lg font-bold text-yellow-400">
                                  {formatAmount(pkg.accumulated_earnings || 0)} AZN
                                </p>
                              </div>
                              <div className="text-center bg-gray-800 rounded-lg p-3">
                                <p className="text-xs sm:text-sm text-gray-400">Paket Qalan Vaxt</p>
                                <p className="text-sm sm:text-lg font-bold text-blue-400">
                                  {timeRemaining}
                                </p>
                              </div>
                              <div className="text-center bg-gray-800 rounded-lg p-3">
                                <p className="text-xs sm:text-sm text-gray-400">Sonrakı Toplama</p>
                                <p className="text-sm sm:text-lg font-bold text-purple-400">
                                  {formatCountdown(countdownTime)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Additional Package Information */}
                            <div className="bg-gray-800 rounded-lg p-3 mb-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Paket Müddəti:</span>
                                  <div className="text-white font-semibold">{packageDef.duration} gün</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Gün Sayı:</span>
                                  <div className="text-white font-semibold">%{(packageDef.multiplier * 100).toFixed(0)} gəlir</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Toplam Edilən:</span>
                                  <div className="text-green-400 font-semibold">{formatAmount(pkg.total_earned || 0)} AZN</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Tamamlanma:</span>
                                  <div className="text-blue-400 font-semibold">{progress.toFixed(1)}%</div>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between text-xs sm:text-sm mb-2">
                                <span>Qazanc Tamamlanması</span>
                                <span>{progress.toFixed(1)}% ({formatAmount(pkg.accumulated_earnings || 0)} / {formatAmount(totalExpectedEarnings)} AZN)</span>
                              </div>
                              <Progress value={progress} className="h-3" />
                            </div>

                            {/* Enhanced Collection Section */}
                            <div className="flex flex-col space-y-3">
                              <div className="flex justify-between items-center text-xs sm:text-sm text-gray-400">
                                <span>Son toplama: {pkg.last_collection ? new Date(pkg.last_collection).toLocaleString() : 'Heç vaxt'}</span>
                                <div className="flex items-center space-x-2">
                                  <span>Auto-toplama:</span>
                                  <Badge className={autoCollectionEnabled ? 'bg-green-600' : 'bg-gray-600'}>
                                    {autoCollectionEnabled ? '✅ Aktiv' : '❌ Deaktiv'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                  onClick={() => handleCollectEarnings(pkg.id)}
                                  disabled={!pkg.can_collect || pkg.accumulated_earnings <= 0 || countdownTime > 0}
                                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 flex-1"
                                >
                                  <Coins className="w-4 h-4 mr-2" />
                                  {countdownTime > 0 ? 
                                    `Qazanc Topla (${formatCountdown(countdownTime)})` : 
                                    `Qazanc Topla (${formatAmount(pkg.accumulated_earnings || 0)} AZN)`
                                  }
                                </Button>
                                
                                <Button
                                  onClick={() => setAutoCollectionEnabled(!autoCollectionEnabled)}
                                  variant="outline"
                                  className={`border-gray-600 hover:bg-gray-800 ${autoCollectionEnabled ? 
                                    'text-green-300 border-green-600' : 'text-gray-300'}`}
                                >
                                  <Timer className="w-4 h-4 mr-2" />
                                  {autoCollectionEnabled ? 'Auto BAĞLA' : 'Auto AÇ'}
                                </Button>
                              </div>
                              
                              {countdownTime > 0 && (
                                <div className={`border rounded-lg p-3 text-center ${
                                  autoCollectionEnabled 
                                    ? 'bg-blue-900/50 border-blue-600' 
                                    : 'bg-orange-900/50 border-orange-600'
                                }`}>
                                  <p className={`text-sm ${
                                    autoCollectionEnabled ? 'text-blue-300' : 'text-orange-300'
                                  }`}>
                                    🕐 Növbəti qazanc {formatCountdown(countdownTime)} sonra{' '}
                                    {autoCollectionEnabled ? (
                                      <span className="font-bold text-green-400">avtomatik toplanacaq</span>
                                    ) : (
                                      <span className="font-bold text-yellow-400">əl ilə toplanacaq</span>
                                    )}
                                  </p>
                                  {!autoCollectionEnabled && (
                                    <p className="text-xs text-orange-400 mt-1">
                                      💡 Auto-toplama açsanız, vaxt bitdikdə avtomatik toplanacaq
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column - Live Data - Mobile adjusted */}
              <div className="space-y-4 sm:space-y-6">
                {/* Live Transactions - Mobile Responsive */}
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

                {/* Quick Stats - Mobile Responsive */}
                <Card className="bg-gray-900 border-gray-700 p-4">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Statistika</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs sm:text-sm">Toplam İnvestisiya:</span>
                      <span className="font-bold text-blue-400 text-xs sm:text-sm">{formatAmount(user?.total_invested || 0)} AZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs sm:text-sm">Toplam Qazanc:</span>
                      <span className="font-bold text-green-400 text-xs sm:text-sm">{formatAmount(user?.total_earned || 0)} AZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs sm:text-sm">Aktiv Paketlər:</span>
                      <span className="font-bold text-purple-400 text-xs sm:text-sm">{activePackages.length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs sm:text-sm">Depozit Balansı:</span>
                      <span className="font-bold text-blue-400 text-xs sm:text-sm">{formatAmount(user?.balance || 0)} AZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs sm:text-sm">Çəkiləbilir Qazanc:</span>
                      <span className="font-bold text-green-400 text-sm sm:text-base">{formatAmount(user?.total_earned || 0)} AZN</span>
                    </div>
                  </div>
                </Card>

                {/* Enhanced Company Information */}
                <CompanyInfo />
              </div>
              
              {/* Company Information */}
              <CompanyInfo className="mt-6" />
            </div>
          </TabsContent>

          {/* Packages Tab - Mobile Optimized */}
          <TabsContent value="packages">
            <div className="space-y-6">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">İnvestisiya Paketləri</h2>
                <p className="text-gray-400 text-sm sm:text-base">Sizə uyğun paketi seçin və investisiyaya başlayın</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(packageDefinitions).map(([key, pkg]) => (
                  <Card 
                    key={key} 
                    className={`bg-gradient-to-b ${pkg.gradient} p-1 hover:scale-105 transition-transform cursor-pointer ${
                      selectedPackage === key ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    onClick={() => {
                      console.log('Package selected:', key);
                      setSelectedPackage(key);
                    }}
                  >
                    <div className="bg-gray-900 rounded-lg p-4 sm:p-6 h-full">
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="text-4xl sm:text-5xl mb-3">{pkg.icon}</div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white drop-shadow-lg" 
                            style={{
                              color: pkg.color,
                              textShadow: `0 0 10px ${pkg.color}40`
                            }}>
                          {pkg.name}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">İnvestisiya Limiti:</span>
                          <span className="font-bold text-white text-sm">{pkg.minAmount}-{pkg.maxAmount} AZN</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Gündəlik Gəlir:</span>
                          <span className="font-bold text-green-400 text-sm">%{pkg.dailyReturn}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Müddət:</span>
                          <span className="font-bold text-white text-sm">{pkg.duration} gün</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Toplam Gəlir:</span>
                          <span className="font-bold text-yellow-400 text-sm">%{(pkg.multiplier * 100).toFixed(0)}</span>
                        </div>
                      </div>

                      {selectedPackage === key && (
                        <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-top">
                          <Input
                            type="number"
                            placeholder={`Məbləğ (${pkg.minAmount}-${pkg.maxAmount} AZN)`}
                            value={investmentAmount}
                            onChange={(e) => {
                              console.log('Amount changed:', e.target.value);
                              setInvestmentAmount(e.target.value);
                            }}
                            min={pkg.minAmount}
                            max={pkg.maxAmount}
                            className="bg-gray-800 border-gray-600 text-white text-center text-lg"
                          />
                          
                          {/* Amount validation display */}
                          {investmentAmount && (
                            <div className="text-center text-sm">
                              {parseFloat(investmentAmount) < pkg.minAmount || parseFloat(investmentAmount) > pkg.maxAmount ? (
                                <p className="text-red-400">⚠️ Məbləğ {pkg.minAmount}-{pkg.maxAmount} AZN arası olmalıdır</p>
                              ) : (
                                <p className="text-green-400">✅ Məbləğ uyğundur</p>
                              )}
                            </div>
                          )}
                          
                          <Button
                            onClick={() => {
                              console.log('Purchase clicked for:', key, 'amount:', investmentAmount);
                              handlePackagePurchase(key);
                            }}
                            disabled={!investmentAmount || parseFloat(investmentAmount) < pkg.minAmount || parseFloat(investmentAmount) > pkg.maxAmount || !user}
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-500 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {!user ? 'Giriş Edin' : 'Paketi Al'}
                          </Button>
                          
                          {/* Balance check */}
                          {user && investmentAmount && parseFloat(investmentAmount) > (user.balance || 0) && (
                            <p className="text-red-400 text-sm text-center">
                              ⚠️ Balansınız kifayət etmir (Cari: {formatAmount(user.balance || 0)} AZN)
                            </p>
                          )}
                        </div>
                      )}
                      
                      {selectedPackage !== key && (
                        <Button
                          onClick={() => {
                            console.log('Select package clicked:', key);
                            setSelectedPackage(key);
                          }}
                          variant="outline"
                          className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black py-3"
                        >
                          Paketi Seç
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Mobile instruction */}
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mt-6 sm:hidden">
                <p className="text-blue-200 text-sm text-center">
                  💡 Paket seçmək üçün kartın üstünə toxunun, sonra məbləği yazıb "Paketi Al" düyməsini basın.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Market Tab - Now Package Store */}
          <TabsContent value="market">
            <div className="space-y-6">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">🛒 Paket Mağazası</h2>
                <p className="text-gray-400 text-sm sm:text-base">Bütün investisiya paketləri burada</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(packageDefinitions).map(([key, pkg]) => (
                  <Card key={key} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:scale-105">
                    <div className="p-4 sm:p-6">
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="text-4xl sm:text-5xl mb-3">{pkg.icon}</div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white drop-shadow-lg" 
                            style={{
                              color: pkg.color,
                              textShadow: `0 0 10px ${pkg.color}40`
                            }}>
                          {pkg.name}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">{pkg.description}</p>
                        <div className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">
                          {pkg.minAmount === pkg.maxAmount ? 
                            `${formatAmount(pkg.minAmount)} AZN` : 
                            `${formatAmount(pkg.minAmount)}-${formatAmount(pkg.maxAmount)} AZN`
                          }
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white">Gündəlik %{pkg.dailyReturn} gəlir</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white">{pkg.duration} gün müddət</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white">Toplam %{(pkg.multiplier * 100).toFixed(0)} gəlir</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white">20 dəqiqədə bir qazanc toplama</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedPackage(key);
                          setActiveTab('packages');
                        }}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 py-3 text-base font-semibold"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Bu Paketi Seç
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Market instruction */}
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="text-blue-200 font-medium mb-2">Paket Seçim Təlimatı</h4>
                    <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                      <li>İstədiyiniz paketi seçin və "Bu Paketi Seç" düyməsini basın</li>
                      <li>Paketlər bölməsinə keçəcək və paket seçili olacaq</li>
                      <li>Məbləği yazıb "Paketi Al" düyməsi ilə satın alın</li>
                      <li>Çoxlu paket satın ala bilərsiniz</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionManager 
              user={user}
              token={token}
              onTransactionUpdate={fetchUserData}
              showNotification={showNotification}
            />
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gray-900 border-gray-700 p-6">
                <h2 className="text-2xl font-bold mb-6">💬 Dəstək Mərkəzi</h2>
                
                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Mesaj yoxdur</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg ${
                        message.is_from_admin 
                          ? 'bg-blue-900/50 border-l-4 border-blue-400' 
                          : 'bg-gray-800 border-l-4 border-yellow-400'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            {message.is_from_admin ? '👨‍💼 Admin' : '👤 Siz'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                {!canSendMessage && (
                  <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 mb-4">
                    <p className="text-yellow-200 text-sm">
                      ⏳ Admin cavab verənə qədər yeni mesaj göndərə bilməzsiniz.
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={canSendMessage ? "Mesajınızı yazın..." : "Admin cavab verənə qədər gözləyin..."}
                    disabled={!canSendMessage}
                    className="bg-gray-800 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSendMessage || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Göndər
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction Tracking Tab */}
          <TabsContent value="tracking">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">📊 Əməliyyat Tarixçəsi</h3>
                <p className="text-gray-400 text-sm">Depozit və çıxarış əməliyyatlarınızın statusu</p>
              </div>
              
              {/* Mock transaction history for now - will be connected to real data later */}
              <div className="space-y-3">
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        💰
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Depozit</h4>
                        <p className="text-sm text-gray-400">250.00 AZN</p>
                        <p className="text-xs text-gray-500">Bu gün, 14:30</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-600 animate-pulse">
                      🕐 Gözləyir
                    </Badge>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Admin tərəfindən yoxlanılır
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        🏦
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Çıxarış</h4>
                        <p className="text-sm text-gray-400">150.00 AZN</p>
                        <p className="text-xs text-gray-500">Dünən, 09:15</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">
                      ✅ Təsdiqləndi
                    </Badge>
                  </div>
                  <div className="mt-3 text-xs text-green-400">
                    30 dəqiqə ərzində hesabınıza köçürüldü
                  </div>
                </Card>

                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        ❌
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Depozit</h4>
                        <p className="text-sm text-gray-400">500.00 AZN</p>
                        <p className="text-xs text-gray-500">3 gün əvvəl, 16:45</p>
                      </div>
                    </div>
                    <Badge className="bg-red-600">
                      ❌ İmtina
                    </Badge>
                  </div>
                  <div className="mt-3 text-xs text-red-400">
                    Dekont oxunmur, yenidən göndərin
                  </div>
                </Card>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="text-blue-200 font-medium mb-2">Əməliyyat Statusları</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-yellow-600">🕐 Gözləyir</Badge>
                        <span className="text-blue-200">Admin yoxlaması gözlənilir</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-600">✅ Təsdiqləndi</Badge>
                        <span className="text-blue-200">Əməliyyat uğurla tamamlandı</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-600">❌ İmtina</Badge>
                        <span className="text-blue-200">Səbəbini oxuyub düzəldin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Şifrə</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
      >
        {loading ? 'Gözləyin...' : 'Daxil Ol'}
      </Button>
    </form>
  );
};

// Register Form Component - Mobile Enhanced
const RegisterForm = ({ onRegister, error, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white w-full"
          placeholder="Ad Soyad"
          autoComplete="name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white w-full"
          placeholder="email@example.com"
          autoComplete="email"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Şifrə</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white w-full"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
      </div>
      
      <Button
        type="submit"
        disabled={loading || !name.trim() || !email.trim() || !password.trim()}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-500 py-3 text-base font-semibold disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
            Qeydiyyat edilir...
          </div>
        ) : (
          'Qeydiyyat'
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          🎁 Qeydiyyatdan sonra 50 AZN bonus alacaqsınız!
        </p>
      </div>
    </form>
  );
};

// Transaction Manager Component - Enhanced Mobile
const TransactionManager = ({ user, token, onTransactionUpdate, showNotification }) => {
  const [activeTransactionTab, setActiveTransactionTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bank options
  const bankOptions = [
    'Kapital Bank', 'Rabitəbank', 'Unibank', 'AccessBank', 'Paşa Bank',
    'Bank of Baku', 'Xalq Bank', 'AMAY Bank', 'Express Bank', 'Digər'
  ];

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || !cardName || !cardNumber || !bankName) {
      showNotification('❌ Bütün sahələri doldurun', 'error');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 50 || amountNum > 2000) {
      showNotification('❌ Depozit məbləği 50-2000 AZN arası olmalıdır', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Depozit sorğusu göndərilir...', {
        amount: amountNum,
        cardName,
        cardNumber,
        bankName
      });

      // First create transaction
      const response = await axios.post(`${API_BASE_URL}/api/transactions`, {
        type: 'deposit',
        amount: amountNum,
        card_name: cardName,
        card_number: cardNumber,
        bank_name: bankName
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // Then upload receipt if provided
      if (receipt) {
        const formData = new FormData();
        formData.append('file', receipt);
        
        await axios.post(`${API_BASE_URL}/api/transactions/${response.data.id}/upload-receipt`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        });
      }

      // Clear form
      setAmount('');
      setCardName('');
      setCardNumber('');
      setBankName('');
      setReceipt(null);
      
      onTransactionUpdate();
      showNotification('✅ Depozit sorğusu uğurla göndərildi! Admin tərəfindən yoxlanılacaq.', 'success');
    } catch (error) {
      console.error('Depozit xətası:', error);
      showNotification(error.response?.data?.detail || '❌ Depozit zamanı xəta baş verdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!amount || !cardName || !cardNumber || !bankName) {
      showNotification('❌ Bütün sahələri doldurun', 'error');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 500 || amountNum > 6500) {
      showNotification('❌ Çıxarış məbləği 500-6500 AZN arası olmalıdır', 'error');
      return;
    }

    if (user?.total_earned < amountNum) {
      showNotification(`❌ Qazancınız kifayət etmir. Çəkiləbilir qazanc: ${formatAmount(user.total_earned || 0)} AZN`, 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Çıxarış sorğusu göndərilir...', {
        amount: amountNum,
        cardName,
        bankName
      });

      await axios.post(`${API_BASE_URL}/api/transactions`, {
        type: 'withdraw',  // Fixed: backend expects 'withdraw' not 'withdrawal'
        amount: amountNum,
        card_name: cardName,
        card_number: cardNumber,
        bank_name: bankName
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // Clear form
      setAmount('');
      setCardName('');
      setCardNumber('');
      setBankName('');
      
      onTransactionUpdate();
      showNotification('✅ Çıxarışınız uğurlu! 30 dəqiqə hesabınıza köçürüləcəkdir.', 'success');
    } catch (error) {
      console.error('Çıxarış xətası:', error);
      showNotification(error.response?.data?.detail || '❌ Çıxarış zamanı xəta baş verdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Enhanced Form with Mobile Support */}
      <Card className="bg-gray-900 border-gray-700 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">💰 Maliyyə Əməliyyatları</h2>
        
        {/* Enhanced Balance Display - Separated */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-900/50 to-blue-700/50 border border-blue-600 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Depozit Balansı</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400">
              {formatAmount(user?.balance || 0)} AZN
            </p>
            <p className="text-xs text-gray-400">Paket alımı üçün</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-900/50 to-green-700/50 border border-green-600 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300 mb-1">Çəkiləbilir Qazanc</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">
              {formatAmount(user?.total_earned || 0)} AZN
            </p>
            <p className="text-xs text-gray-400">Çıxarış üçün</p>
          </div>
        </div>
        
        <Tabs value={activeTransactionTab} onValueChange={setActiveTransactionTab}>
          <TabsList className="bg-gray-800 mb-6 w-full">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-green-600 flex-1">
              💰 Depozit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-blue-600 flex-1">
              🏦 Çıxarış
            </TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-yellow-600 flex-1">
              📊 Əməliyyatlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💵 Məbləğ (50-2000 AZN)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="50"
                    max="2000"
                    className="bg-gray-800 border-gray-600 text-white text-lg text-center"
                    placeholder="Məbləğ"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">Minimum: 50 AZN, Maksimum: 2000 AZN</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🏦 Bank Seçin
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Bank seçin...</option>
                    {bankOptions.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  👤 Ad Soyad (Kart sahibi)
                </label>
                <Input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Kart sahibinin ad soyadı"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  💳 Kart Nömrəsi
                </label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    // Format card number
                    const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                    setCardNumber(formatted);
                  }}
                  className="bg-gray-800 border-gray-600 text-white text-center tracking-wider"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📄 Dekont (JPG, PNG, PDF)
                </label>
                <Input
                  type="file"
                  onChange={(e) => setReceipt(e.target.files[0])}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
                <div className="text-xs text-gray-400 mt-1">Ödəniş dekontunu yükləyin</div>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Göndərilir...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Depozit Et
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="withdraw">
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💵 Məbləğ (500-6500 AZN)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="500"
                    max="6500"
                    className="bg-gray-800 border-gray-600 text-white text-lg text-center"
                    placeholder="Məbləğ"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">Minimum: 500 AZN, Maksimum: 6500 AZN</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🏦 Bank Seçin
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Bank seçin...</option>
                    {bankOptions.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  👤 Ad Soyad (Kart sahibi)
                </label>
                <Input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Kart sahibinin ad soyadı"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  💳 Kart Nömrəsi
                </label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    // Format card number
                    const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                    setCardNumber(formatted);
                  }}
                  className="bg-gray-800 border-gray-600 text-white text-center tracking-wider"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || (user?.balance < parseFloat(amount || 0))}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Göndərilir...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Çıxarış Et
                  </>
                )}
              </Button>
              
              {user?.balance < parseFloat(amount || 0) && amount && (
                <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
                  <p className="text-red-200 text-sm text-center">
                    ⚠️ Balansınız kifayət etmir
                  </p>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

// Company Information Component for all pages
const CompanyInfo = ({ className = "" }) => {
  return (
    <Card className={`bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-600/50 p-4 ${className}`}>
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold text-yellow-400">🏢 InvestAZ</h3>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          <Badge className="bg-yellow-600 text-white font-semibold px-3 py-1">
            ⭐ 2007-ci ildən işləyir
          </Badge>
          <p className="text-yellow-300 font-semibold text-sm">
            🎯 Azərbaycanda ən <span className="text-yellow-400 font-bold">uğurlu</span> investisiya şirkəti
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center bg-yellow-900/30 rounded p-2">
              <div className="font-bold text-yellow-400 text-sm">18 il</div>
              <div className="text-yellow-300 text-xs">Təcrübə</div>
            </div>
            <div className="text-center bg-yellow-900/30 rounded p-2">
              <div className="font-bold text-green-400 text-sm">25,000+</div>
              <div className="text-yellow-300 text-xs">Müştəri</div>
            </div>
            <div className="text-center bg-yellow-900/30 rounded p-2">
              <div className="font-bold text-blue-400 text-sm">%99.9</div>
              <div className="text-yellow-300 text-xs">Uğur</div>
            </div>
          </div>
          <div className="flex justify-center space-x-2 mt-3">
            <Badge className="bg-green-600 text-white text-xs">🛡️ Təhlükəsiz</Badge>
            <Badge className="bg-blue-600 text-white text-xs">⚡ Sürətli</Badge>
            <Badge className="bg-purple-600 text-white text-xs">💎 Güvənilir</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedInvestmentPlatform;