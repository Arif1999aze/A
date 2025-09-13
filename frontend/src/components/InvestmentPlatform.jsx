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
  investmentPackages,
  storeItems,
  companyInfo,
  formatAmount,
  calculatePackageEarnings
} from '../mock';
import { ArrowUp, TrendingUp, Users, Activity, DollarSign, Eye, EyeOff, Building, Award, Shield, Globe, CreditCard, Upload, Package, Clock, CheckCircle, MoreVertical, ShoppingCart, Gift, AlertTriangle, Sparkles } from 'lucide-react';

const InvestmentPlatform = () => {
  const [transactions, setTransactions] = useState([]);
  const [membershipActivities, setMembershipActivities] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [packageSelectOpen, setPackageSelectOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [user, setUser] = useState(null);
  const [userPackages, setUserPackages] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [hasUsedFreePackage, setHasUsedFreePackage] = useState(false);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);

  // Load registered users from localStorage on start
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('investaz_users') || '[]');
    setRegisteredUsers(savedUsers);
  }, []);

  // Save users to localStorage whenever registeredUsers changes
  useEffect(() => {
    localStorage.setItem('investaz_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Live transaction feed - daha sürətli
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateRandomTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 29)]);
    }, 1200 + Math.random() * 800); // 1.2-2 saniyə

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

  // Package earnings update every second
  useEffect(() => {
    if (userPackages.length > 0) {
      const interval = setInterval(() => {
        setUserPackages(prev => prev.map(pkg => {
          const packageData = investmentPackages.find(p => p.id === pkg.packageId);
          const daysPassed = Math.floor((new Date() - new Date(pkg.startDate)) / (1000 * 60 * 60 * 24));
          const secondsPassed = Math.floor((new Date() - new Date(pkg.startDate)) / 1000);
          
          // Calculate earnings per second
          const totalEarnings = pkg.investedAmount * packageData.multiplier;
          const earningsPerSecond = (totalEarnings - pkg.investedAmount) / (packageData.duration * 24 * 60 * 60);
          const newEarnings = Math.min(earningsPerSecond * secondsPassed, totalEarnings - pkg.investedAmount);
          
          return {
            ...pkg,
            accumulatedEarnings: Math.max(0, newEarnings)
          };
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [userPackages]);

  const handleLogin = (email, password) => {
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      alert('❌ Bu email və şifrə ilə qeydiyyatlı istifadəçi tapılmadı. Zəhmət olmasa əvvəlcə qeydiyyatdan keçin.');
      return;
    }

    setUser(foundUser);
    setIsLoggedIn(true);
    setLoginOpen(false);
    
    // Load user's packages
    const savedPackages = JSON.parse(localStorage.getItem(`packages_${foundUser.email}`) || '[]');
    setUserPackages(savedPackages);
    
    // Show welcome bonus if first login
    if (!foundUser.hasSeenWelcome) {
      setShowWelcomeBonus(true);
      // Update user to mark as seen welcome
      const updatedUsers = registeredUsers.map(u => 
        u.email === email ? { ...u, hasSeenWelcome: true } : u
      );
      setRegisteredUsers(updatedUsers);
    }
  };

  const handleRegister = (email, password, name) => {
    const existingUser = registeredUsers.find(u => u.email === email);
    if (existingUser) {
      alert('❌ Bu email artıq qeydiyyatlıdır. Zəhmət olmasa giriş edin.');
      return;
    }

    const newUser = { 
      email, 
      password,
      name, 
      balance: 10,
      joinDate: new Date().toISOString(),
      hasSeenWelcome: false,
      totalInvested: 0,
      totalEarned: 0
    };
    
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setIsLoggedIn(true);
    setRegisterOpen(false);
    setShowWelcomeBonus(true);
  };

  const handleWithdraw = (amount, cardName, cardNumber) => {
    if (amount > user.balance) {
      alert('❌ Balansınızda kifayət qədər vəsait yoxdur.');
      return;
    }
    
    const newTransaction = {
      id: Date.now(),
      type: 'withdraw',
      amount: amount,
      cardName: cardName,
      cardNumber: cardNumber,
      status: 'pending',
      date: new Date().toISOString(),
      userName: user.name,
      userEmail: user.email
    };
    
    setPendingTransactions(prev => [newTransaction, ...prev]);
    updateUserBalance(user.balance - amount);
    
    alert('🎉 Təbriklər! Çıxarış sorğunuz uğurla göndərildi. Admin tərəfindən yoxlanılacaq.');
    setWithdrawOpen(false);
    setMenuOpen(false);
  };

  const handleDeposit = (amount, cardNumber, receipt) => {
    const newTransaction = {
      id: Date.now(),
      type: 'deposit',
      amount: amount,
      cardNumber: cardNumber,
      receipt: receipt ? receipt.name : 'receipt.jpg',
      status: 'pending',
      date: new Date().toISOString(),
      userName: user.name,
      userEmail: user.email
    };
    
    setPendingTransactions(prev => [newTransaction, ...prev]);
    
    alert('🎉 Təbriklər! Depozit sorğunuz uğurla göndərildi. Admin təsdiqi gözlənilir.');
    setDepositOpen(false);
    setMenuOpen(false);
  };

  const updateUserBalance = (newBalance) => {
    setUser(prev => ({ ...prev, balance: newBalance }));
    setRegisteredUsers(prev => prev.map(u => 
      u.email === user.email ? { ...u, balance: newBalance } : u
    ));
  };

  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
    setPackageSelectOpen(true);
  };

  const handlePackagePurchase = (packageId, investedAmount, isFree = false) => {
    const pkg = investmentPackages.find(p => p.id === packageId);
    
    if (!isFree && user.balance < investedAmount) {
      alert('⚠️ Balansınızda kifayət qədər vəsait yoxdur. Zəhmət olmasa balansınızı artırın.');
      return;
    }

    if (investedAmount < pkg.minAmount || investedAmount > pkg.maxAmount) {
      alert(`❌ Bu paket üçün ${pkg.minAmount}-${pkg.maxAmount} AZN arası məbləğ daxil edin.`);
      return;
    }

    const newPackage = {
      id: Date.now(),
      packageId: packageId,
      investedAmount: investedAmount,
      startDate: new Date().toISOString(),
      accumulatedEarnings: 0,
      isActive: true
    };

    setUserPackages([newPackage]);
    
    if (!isFree) {
      updateUserBalance(user.balance - investedAmount);
      // Update total invested
      setRegisteredUsers(prev => prev.map(u => 
        u.email === user.email ? { ...u, totalInvested: (u.totalInvested || 0) + investedAmount } : u
      ));
    }
    
    // Save to localStorage
    localStorage.setItem(`packages_${user.email}`, JSON.stringify([newPackage]));
    
    setPackageSelectOpen(false);
    alert(`🎉 ${pkg.name} uğurla alındı! Gəliriniz toplanmağa başladı.`);
  };

  const handleStorePackagePurchase = (storeItem, packageId, investedAmount) => {
    const totalCost = storeItem.price + investedAmount;
    
    if (user.balance < totalCost) {
      alert(`⚠️ Mağazadan paket almaq üçün balansınızda ${formatAmount(totalCost)} AZN olmalıdır. Cari balansınız: ${formatAmount(user.balance)} AZN. Zəhmət olmasa balansınızı artırın.`);
      return;
    }

    // First pay for store item + investment
    updateUserBalance(user.balance - totalCost);
    
    // Update total invested
    setRegisteredUsers(prev => prev.map(u => 
      u.email === user.email ? { ...u, totalInvested: (u.totalInvested || 0) + investedAmount } : u
    ));

    // Then create package
    const newPackage = {
      id: Date.now(),
      packageId: packageId,
      investedAmount: investedAmount,
      startDate: new Date().toISOString(),
      accumulatedEarnings: 0,
      isActive: true
    };

    setUserPackages([newPackage]);
    localStorage.setItem(`packages_${user.email}`, JSON.stringify([newPackage]));
    
    setStoreOpen(false);
    alert(`🎉 Mağazadan paket uğurla alındı! Gəliriniz toplanmağa başladı.`);
  };

  const collectEarnings = (packageIndex) => {
    const pkg = userPackages[packageIndex];
    const earnings = pkg.accumulatedEarnings;
    
    if (earnings < 0.01) {
      alert('⚠️ Toplanacaq gəlir yoxdur.');
      return;
    }
    
    updateUserBalance(user.balance + earnings);
    
    // Update total earned
    setRegisteredUsers(prev => prev.map(u => 
      u.email === user.email ? { ...u, totalEarned: (u.totalEarned || 0) + earnings } : u
    ));
    
    setUserPackages(prev => prev.map((p, i) => 
      i === packageIndex ? { ...p, accumulatedEarnings: 0 } : p
    ));
    
    // Update localStorage
    const updatedPackages = userPackages.map((p, i) => 
      i === packageIndex ? { ...p, accumulatedEarnings: 0 } : p
    );
    localStorage.setItem(`packages_${user.email}`, JSON.stringify(updatedPackages));
    
    alert(`🎉 ${formatAmount(earnings)} AZN balansınıza əlavə edildi!`);
  };

  const blurName = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}*** ${parts[1]}`;
    }
    return `${name.charAt(0)}***`;
  };

  // Check if user has active package
  const hasActivePackage = userPackages.length > 0 && userPackages.some(p => p.isActive);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Welcome Bonus Alert */}
      {showWelcomeBonus && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 max-w-md w-full text-center border-0">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-black mb-4">Təbriklər!</h2>
            <p className="text-black mb-4">
              İlk qeydiyyat bonusu olaraq hesabınıza <strong>10 AZN</strong> əlavə edildi!
            </p>
            <Button 
              onClick={() => setShowWelcomeBonus(false)}
              className="bg-black text-yellow-400 hover:bg-gray-800"
            >
              Davam Et
            </Button>
          </Card>
        </div>
      )}

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
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">{user.email}</div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="text-gray-400">Balans</div>
                    <div className="font-bold text-yellow-400">{formatAmount(user?.balance || 0)} AZN</div>
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
                    <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-50">
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
                          <Badge className="bg-red-600 text-white text-xs">
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

                      <button
                        onClick={() => {
                          setPackagesOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Paketlərim
                      </button>

                      <button
                        onClick={() => {
                          setStoreOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mağaza
                      </button>

                      <hr className="border-gray-700 my-1" />
                      
                      <button
                        onClick={() => {
                          setIsLoggedIn(false);
                          setUser(null);
                          setUserPackages([]);
                          setMenuOpen(false);
                        }}
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
                Xoş gəlmisiniz, {user.name}!
              </h1>
              <p className="text-gray-300">İnvestisiya paketinizi seçin və qazanmağa başlayın</p>
            </div>

            {/* Show packages only if user doesn't have active package */}
            {!hasActivePackage && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-yellow-400 text-center">İnvestisiya Paketləri</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {investmentPackages.map((pkg) => (
                    <EnhancedPackageCard 
                      key={pkg.id}
                      package={pkg}
                      onSelect={handlePackageSelection}
                      canUseFree={!hasUsedFreePackage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show active packages */}
            {hasActivePackage && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-yellow-400 text-center">Aktiv Paketiniz</h2>
                <div className="grid gap-6">
                  {userPackages.map((userPkg, index) => {
                    const pkg = investmentPackages.find(p => p.id === userPkg.packageId);
                    const totalEarnings = userPkg.investedAmount * pkg.multiplier;
                    const remainingEarnings = totalEarnings - userPkg.accumulatedEarnings;
                    const progressPercentage = ((userPkg.accumulatedEarnings / (totalEarnings - userPkg.investedAmount)) * 100).toFixed(1);
                    
                    return (
                      <Card key={userPkg.id} className="bg-gradient-to-r from-gray-900 to-gray-800 border-yellow-400 p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                            <div className="text-6xl animate-pulse" style={{ color: pkg.color }}>
                              {pkg.icon}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                              <p className="text-gray-400">{pkg.description}</p>
                              <div className="text-sm text-gray-500 mt-1">
                                Başlama: {new Date(userPkg.startDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-yellow-400 mt-1">
                                İnvestisiya: {formatAmount(userPkg.investedAmount)} AZN
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right w-full lg:w-auto">
                            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                              <div className="text-sm text-gray-400">Şu ana qədər qazanc</div>
                              <div className="text-3xl font-bold text-green-400 animate-pulse">
                                {formatAmount(userPkg.accumulatedEarnings)} AZN
                              </div>
                              <div className="text-sm text-gray-500">
                                Qalan: {formatAmount(remainingEarnings)} AZN
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
                            
                            <Button
                              onClick={() => collectEarnings(index)}
                              disabled={userPkg.accumulatedEarnings < 0.01}
                              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
                            >
                              <Gift className="w-5 h-5 mr-2" />
                              Qazancı Götür
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Feed */}
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
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
      </main>

      {/* Package Selection Dialog */}
      <Dialog open={packageSelectOpen} onOpenChange={setPackageSelectOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedPackage?.name}</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <PackageInvestmentForm 
              package={selectedPackage}
              onPurchase={handlePackagePurchase}
              userBalance={user?.balance || 0}
              canUseFree={!hasUsedFreePackage}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Other Dialogs remain the same... */}
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

      <Dialog open={packagesOpen} onOpenChange={setPackagesOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Mənim Paketlərim</DialogTitle>
          </DialogHeader>
          <MyPackagesView packages={userPackages} investmentPackages={investmentPackages} />
        </DialogContent>
      </Dialog>

      <Dialog open={storeOpen} onOpenChange={setStoreOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Mağaza</DialogTitle>
          </DialogHeader>
          <StoreView 
            storeItems={storeItems} 
            investmentPackages={investmentPackages}
            onPurchase={handleStorePackagePurchase}
            userBalance={user?.balance || 0}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Enhanced Package Card Component
const EnhancedPackageCard = ({ package: pkg, onSelect, canUseFree }) => {
  const [investAmount, setInvestAmount] = useState(pkg.minAmount);

  const totalEarnings = investAmount * pkg.multiplier;
  const profit = totalEarnings - investAmount;
  const monthlyProfit = profit / (pkg.duration / 30);

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700 p-6 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
      {/* Sparkle effect */}
      <div className="absolute top-2 right-2">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>
      
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce" style={{ color: pkg.color }}>
          {pkg.icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">İnvestisiya məbləği</label>
            <Input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(parseFloat(e.target.value) || pkg.minAmount)}
              min={pkg.minAmount}
              max={pkg.maxAmount}
              className="bg-gray-800 border-gray-600 text-white text-center text-lg font-bold"
            />
            <div className="text-xs text-gray-500 mt-1">
              {pkg.minAmount} - {pkg.maxAmount} AZN
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">İnvestisiya:</span>
              <span className="text-white font-bold">{formatAmount(investAmount)} AZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Ümumi gəlir:</span>
              <span className="text-green-400 font-bold">{formatAmount(totalEarnings)} AZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Təmiz qazanc:</span>
              <span className="text-yellow-400 font-bold">{formatAmount(profit)} AZN</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span className="text-gray-400 text-sm">Aylıq qazanc:</span>
              <span className="text-blue-400 font-bold">~{formatAmount(monthlyProfit)} AZN</span>
            </div>
          </div>

          <Alert className="bg-blue-900/50 border-blue-600">
            <AlertTriangle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200 text-sm">
              İşte {pkg.duration} gün sonra toplam <strong>{formatAmount(totalEarnings)} AZN</strong> elde edeceksiniz!
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button
              onClick={() => onSelect(pkg)}
              className="flex-1 text-black hover:opacity-80 font-bold"
              style={{ backgroundColor: pkg.color }}
            >
              Seç və Satın Al
            </Button>
            
            {canUseFree && (
              <Button
                onClick={() => onSelect(pkg)}
                variant="outline"
                className="flex-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-bold"
              >
                <Gift className="w-4 h-4 mr-1" />
                Pulsuz
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Package Investment Form Component
const PackageInvestmentForm = ({ package: pkg, onPurchase, userBalance, canUseFree }) => {
  const [investAmount, setInvestAmount] = useState(pkg.minAmount);
  const [useFreeLicense, setUseFreeLicense] = useState(false);

  const totalEarnings = investAmount * pkg.multiplier;
  const profit = totalEarnings - investAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (investAmount < pkg.minAmount || investAmount > pkg.maxAmount) {
      alert(`❌ Məbləğ ${pkg.minAmount} - ${pkg.maxAmount} AZN aralığında olmalıdır.`);
      return;
    }

    onPurchase(pkg.id, investAmount, useFreeLicense);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-2" style={{ color: pkg.color }}>
          {pkg.icon}
        </div>
        <p className="text-gray-400">{pkg.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Yatırmak istediğiniz tutar (AZN)
          </label>
          <Input
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(parseFloat(e.target.value) || pkg.minAmount)}
            min={pkg.minAmount}
            max={pkg.maxAmount}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
          <div className="text-xs text-gray-400 mt-1">
            Minimum: {pkg.minAmount} AZN, Maksimum: {pkg.maxAmount} AZN
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Hesaplama Özeti</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Yatırım:</span>
              <span className="text-white">{formatAmount(investAmount)} AZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Süre:</span>
              <span className="text-white">{pkg.duration} gün</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Çarpan:</span>
              <span className="text-yellow-400">{pkg.multiplier}x</span>
            </div>
            <hr className="border-gray-700" />
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam gəlir:</span>
              <span className="text-green-400 font-bold">{formatAmount(totalEarnings)} AZN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Təmiz qazanc:</span>
              <span className="text-yellow-400 font-bold">{formatAmount(profit)} AZN</span>
            </div>
          </div>
        </div>

        {canUseFree && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="freeLicense"
              checked={useFreeLicense}
              onChange={(e) => setUseFreeLicense(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="freeLicense" className="text-sm text-green-400">
              Pulsuz ilk paket haqqqımı istifadə et
            </label>
          </div>
        )}

        {!useFreeLicense && userBalance < investAmount && (
          <Alert className="bg-red-900/50 border-red-600">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Balansınızda kifayət qədər vəsait yoxdur. Cari balans: {formatAmount(userBalance)} AZN
              <br />
              Tələb olunan: {formatAmount(investAmount)} AZN
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={!useFreeLicense && userBalance < investAmount}
          className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 font-bold py-3"
        >
          {useFreeLicense ? 'Pulsuz Al' : 'Satın Al'}
        </Button>
      </form>
    </div>
  );
};

// Store View Component - Enhanced
const StoreView = ({ storeItems, investmentPackages, onPurchase, userBalance }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [investAmount, setInvestAmount] = useState(0);

  const handlePurchase = () => {
    if (!selectedItem) return;
    
    const pkg = investmentPackages.find(p => p.type === selectedItem.type);
    
    if (investAmount < pkg.minAmount || investAmount > pkg.maxAmount) {
      alert(`❌ İnvestisiya məbləği ${pkg.minAmount} - ${pkg.maxAmount} AZN aralığında olmalıdır.`);
      return;
    }
    
    onPurchase(selectedItem, pkg.id, investAmount);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-900/50 border-blue-600">
        <AlertTriangle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          Yeni paket almaq üçün əvvəlcə mağazadan paket almalısınız.
          <br />
          <strong>Cari balansınız:</strong> {formatAmount(userBalance)} AZN
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {storeItems.map((item) => {
          const pkg = investmentPackages.find(p => p.type === item.type);
          return (
            <Card
              key={item.id}
              className={`bg-gray-800 border-gray-700 p-4 cursor-pointer transition-all ${
                selectedItem?.id === item.id ? 'border-yellow-400 bg-gray-700' : 'hover:border-gray-600'
              }`}
              onClick={() => {
                setSelectedItem(item);
                setInvestAmount(pkg.minAmount);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                    <div className="text-xs text-yellow-400">
                      {pkg.minAmount} - {pkg.maxAmount} AZN aralığı
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-400">{item.price} AZN</div>
                  <div className="text-xs text-gray-500">Paket haqqı</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedItem && (
        <div className="border-t border-gray-700 pt-6">
          <h4 className="font-bold text-white mb-4">İnvestisiya təfərrüatları</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">İnvestisiya məbləği</label>
              <Input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(parseFloat(e.target.value) || 0)}
                min={investmentPackages.find(p => p.type === selectedItem.type)?.minAmount}
                max={investmentPackages.find(p => p.type === selectedItem.type)?.maxAmount}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lisenziya haqqı:</span>
                  <span className="text-white">{selectedItem.price} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">İnvestisiya:</span>
                  <span className="text-white">{formatAmount(investAmount)} AZN</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Ümumi xərc:</span>
                  <span className="text-yellow-400 font-bold">{formatAmount(selectedItem.price + investAmount)} AZN</span>
                </div>
              </div>
            </div>

            {userBalance < (selectedItem.price + investAmount) && (
              <Alert className="bg-red-900/50 border-red-600">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  Balansınız yetersizdir! Balansınızı artırın.
                  <br />
                  Tələb olunan: {formatAmount(selectedItem.price + investAmount)} AZN
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePurchase}
              disabled={userBalance < (selectedItem.price + investAmount) || investAmount <= 0}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 font-bold py-3"
            >
              {userBalance >= (selectedItem.price + investAmount) ? 'Satın Al' : 'Balans Yetersiz'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Other components remain the same but I'll include key ones...

// Pending Transactions View Component
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
                    {new Date(txn.date).toLocaleString()}
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
                    <div className="text-white">****{txn.cardNumber.slice(-4)}</div>
                  </div>
                )}
                {txn.type === 'deposit' && (
                  <div>
                    <span className="text-gray-400">Dekont:</span>
                    <div className="text-blue-400">{txn.receipt}</div>
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

// Login Form Component
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

// Register Form Component
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

// Withdraw Form Component
const WithdrawForm = ({ onWithdraw, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && amountNum <= maxAmount && cardName && cardNumber.length === 16) {
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
          max={maxAmount}
          min="1"
          step="0.01"
          required
        />
        <div className="text-xs text-gray-400 mt-1">Maksimum: {formatAmount(maxAmount)} AZN</div>
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

// Deposit Form Component
const DepositForm = ({ onDeposit }) => {
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && cardNumber.length === 16 && receipt) {
      onDeposit(amountNum, cardNumber, receipt);
      setAmount('');
      setCardNumber('');
      setReceipt(null);
    } else {
      alert('❌ Zəhmət olmasa bütün məlumatları daxil edin və dekontu yükləyin.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Yatırım Məbləği (AZN)</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="0.00"
          min="1"
          step="0.01"
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

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Dekontu Yüklə</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
            id="receipt-upload"
          />
          <label htmlFor="receipt-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">
              {receipt ? receipt.name : 'Fayl seçin (JPG, PNG, PDF)'}
            </div>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full bg-green-500 text-white hover:bg-green-600">
        <DollarSign className="w-4 h-4 mr-2" />
        Yatır
      </Button>
    </form>
  );
};

// My Packages View Component
const MyPackagesView = ({ packages, investmentPackages }) => {
  if (!packages.length) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Hələ heç bir paketiniz yoxdur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {packages.map((userPkg) => {
        const pkg = investmentPackages.find(p => p.id === userPkg.packageId);
        return (
          <Card key={userPkg.id} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="text-3xl animate-pulse" style={{ color: pkg.color }}>
                  {pkg.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{pkg.name}</h3>
                  <div className="text-sm text-gray-400">
                    {new Date(userPkg.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white">
                  {formatAmount(userPkg.investedAmount)} AZN
                </div>
                <div className="text-sm text-green-400">
                  Toplanmış: {formatAmount(userPkg.accumulatedEarnings)} AZN
                </div>
                <Badge className="mt-1 bg-green-600 animate-pulse">
                  {userPkg.isActive ? 'Aktiv' : 'Bitib'}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default InvestmentPlatform;