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
      showNotification('✅ Qazanc çəkiləbilir balansa əlavə edildi!', 'success');
      
    } catch (error) {
      showNotification(error.response?.data?.detail || '❌ Qazanc toplama xətası', 'error');
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

      {/* Main Content - Mobile Responsive */}
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
                
                // Calculate remaining days
                const endDate = new Date(pkg.end_date);
                const now = new Date();
                const remainingMs = endDate - now;
                const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
                
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
                          <p className="font-bold text-yellow-400">{formatAmount(pkg.total_earned || 0)} AZN</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Qalan Gün</p>
                          <p className="font-bold text-blue-400">{remainingDays} gün</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Sonrakı Toplama</p>
                          <p className="font-bold text-purple-400">
                            {canCollect ? 'Hazır!' : `${nextCollection.hours}s ${nextCollection.minutes}d`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-400">Tamamlanma</span>
                          <span className="text-yellow-400">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {/* Collect Earnings Button */}
                      <Button
                        onClick={() => handleCollectEarnings(pkg.id)}
                        disabled={!canCollect || pkg.accumulated_earnings <= 0}
                        className={`w-full py-2 text-sm font-bold transition-all duration-300 ${
                          canCollect && pkg.accumulated_earnings > 0
                            ? `bg-gradient-to-r ${packageDef.borderGradient} hover:scale-105 shadow-lg text-white`
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {canCollect ? 
                          `Qazanc Topla (${formatAmount(pkg.accumulated_earnings || 0)} AZN)` : 
                          `Gözlə (${nextCollection.hours}s ${nextCollection.minutes}d)`
                        }
                      </Button>
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
          <TabsList className="bg-gradient-to-r from-gray-800 to-gray-700 mb-4 sm:mb-6 grid grid-cols-5 h-auto border border-gray-600 shadow-lg">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-xs sm:text-sm py-3 px-2 sm:px-4 font-medium"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-xs sm:text-sm py-3 px-2 sm:px-4 font-medium"
            >
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Depozit
            </TabsTrigger>
            <TabsTrigger 
              value="withdraw" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-3 px-2 sm:px-4 font-medium"
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Çıxarış
            </TabsTrigger>
            <TabsTrigger 
              value="tracking" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-xs sm:text-sm py-3 px-2 sm:px-4 font-medium"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Tarixçə
            </TabsTrigger>
            <TabsTrigger 
              value="market" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-xs sm:text-sm py-3 px-2 sm:px-4 font-medium"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Market
            </TabsTrigger>
          </TabsList>

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