import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
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
import { ArrowUp, TrendingUp, Users, Activity, DollarSign, Eye, EyeOff, Building, Award, Shield, Globe, CreditCard, Upload, Package, Clock, CheckCircle, MoreVertical, ShoppingCart, Gift } from 'lucide-react';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [user, setUser] = useState(null);
  const [userPackages, setUserPackages] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [hasUsedFreePackage, setHasUsedFreePackage] = useState(false);

  // Live transaction feed - daha sürətli
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateRandomTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 29)]); // 30 transaction
    }, 1500 + Math.random() * 1000); // 1.5-2.5 saniyə

    return () => clearInterval(interval);
  }, []);

  // Live membership activities
  useEffect(() => {
    const interval = setInterval(() => {
      const newMember = generateMembershipActivity();
      setMembershipActivities(prev => [newMember, ...prev.slice(0, 9)]);
    }, 3000 + Math.random() * 2000);

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
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Package earnings update every second
  useEffect(() => {
    if (userPackages.length > 0) {
      const interval = setInterval(() => {
        setUserPackages(prev => prev.map(pkg => ({
          ...pkg,
          accumulatedEarnings: calculatePackageEarnings(
            investmentPackages.find(p => p.id === pkg.packageId),
            pkg.investedAmount,
            pkg.startDate
          )
        })));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [userPackages]);

  const handleLogin = (email, password) => {
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      alert('Bu email və şifrə ilə qeydiyyatlı istifadəçi tapılmadı. Zəhmət olmasa əvvəlcə qeydiyyatdan keçin.');
      return;
    }

    setUser(foundUser);
    setIsLoggedIn(true);
    setLoginOpen(false);
    
    // Load user's packages
    const savedPackages = JSON.parse(localStorage.getItem(`packages_${foundUser.email}`) || '[]');
    setUserPackages(savedPackages);
    
    const savedFreeUsage = localStorage.getItem(`freeUsed_${foundUser.email}`) === 'true';
    setHasUsedFreePackage(savedFreeUsage);
  };

  const handleRegister = (email, password, name) => {
    const existingUser = registeredUsers.find(u => u.email === email);
    if (existingUser) {
      alert('Bu email artıq qeydiyyatlıdır. Zəhmət olmasa giriş edin.');
      return;
    }

    const newUser = { 
      email, 
      password,
      name, 
      balance: 10,
      joinDate: new Date().toISOString()
    };
    
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setIsLoggedIn(true);
    setRegisterOpen(false);
    
    setTimeout(() => {
      alert('🎉 Təbriklər! Hesabınıza 10 AZN bonus əlavə edildi!');
    }, 500);
  };

  const handleWithdraw = (amount, cardName, cardNumber) => {
    if (amount > user.balance) {
      alert('Balansınızda kifayət qədər vəsait yoxdur.');
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
    setUser(prev => ({ ...prev, balance: prev.balance - amount }));
    
    // Update registered users
    setRegisteredUsers(prev => prev.map(u => 
      u.email === user.email ? { ...u, balance: u.balance - amount } : u
    ));
    
    alert('🎉 Təbriklər! Əməliyyat uğurla yerinə yetirildi. Çıxarış sorğunuz admin tərəfindən yoxlanılacaq.');
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
    
    alert('🎉 Təbriklər! Əməliyyat uğurla yerinə yetirildi. Depozit sorğunuz admin tərəfindən yoxlanılacaq.');
    setDepositOpen(false);
    setMenuOpen(false);
  };

  const handlePackagePurchase = (packageId, investedAmount, isFree = false) => {
    const pkg = investmentPackages.find(p => p.id === packageId);
    
    if (!isFree && user.balance < investedAmount) {
      alert('Balansınızda kifayət qədər vəsait yoxdur.');
      return;
    }

    if (investedAmount < pkg.minAmount || investedAmount > pkg.maxAmount) {
      alert(`Bu paket üçün ${pkg.minAmount}-${pkg.maxAmount} AZN arası məbləğ daxil edin.`);
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
      setUser(prev => ({ ...prev, balance: prev.balance - investedAmount }));
      setRegisteredUsers(prev => prev.map(u => 
        u.email === user.email ? { ...u, balance: u.balance - investedAmount } : u
      ));
    } else {
      setHasUsedFreePackage(true);
      localStorage.setItem(`freeUsed_${user.email}`, 'true');
    }
    
    // Save to localStorage
    localStorage.setItem(`packages_${user.email}`, JSON.stringify([newPackage]));
    
    alert(`🎉 ${pkg.name} uğurla alındı! Gəliriniz toplanmağa başladı.`);
  };

  const handlePackageFromStore = (storeItem, packageId, investedAmount) => {
    if (user.balance < storeItem.price) {
      alert('Mağazadan paket almaq üçün balansınızda kifayət qədər vəsait yoxdur.');
      return;
    }

    // First pay for store item
    setUser(prev => ({ ...prev, balance: prev.balance - storeItem.price }));
    setRegisteredUsers(prev => prev.map(u => 
      u.email === user.email ? { ...u, balance: u.balance - storeItem.price } : u
    ));

    // Then purchase package
    handlePackagePurchase(packageId, investedAmount, false);
    setStoreOpen(false);
  };

  const collectEarnings = (packageIndex) => {
    const pkg = userPackages[packageIndex];
    const earnings = pkg.accumulatedEarnings;
    
    setUser(prev => ({ ...prev, balance: prev.balance + earnings }));
    setRegisteredUsers(prev => prev.map(u => 
      u.email === user.email ? { ...u, balance: u.balance + earnings } : u
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
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
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
                      <DialogTitle className="text-white">Yeni Hesab</DialogTitle>
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
                      <div className="font-bold text-white">Lisenziya: {companyInfo.license}</div>
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
                    <PackageCard 
                      key={pkg.id}
                      package={pkg}
                      onPurchase={handlePackagePurchase}
                      canUseFree={!hasUsedFreePackage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show active packages */}
            {hasActivePackage && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-yellow-400 text-center">Aktiv Paketləriniz</h2>
                <div className="grid gap-6">
                  {userPackages.map((userPkg, index) => {
                    const pkg = investmentPackages.find(p => p.id === userPkg.packageId);
                    const totalEarnings = userPkg.investedAmount * pkg.multiplier;
                    const remainingEarnings = totalEarnings - userPkg.accumulatedEarnings;
                    
                    return (
                      <Card key={userPkg.id} className="bg-gray-900 border-gray-800 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="text-4xl" style={{ color: pkg.color }}>
                              {pkg.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                              <p className="text-gray-400">{pkg.description}</p>
                              <div className="text-sm text-gray-500 mt-1">
                                Başlama: {new Date(userPkg.startDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right w-full sm:w-auto">
                            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                              <div className="text-sm text-gray-400">Toplanmış Gəlir</div>
                              <div className="text-2xl font-bold text-green-400">
                                {formatAmount(userPkg.accumulatedEarnings)} AZN
                              </div>
                              <div className="text-sm text-gray-500">
                                Qalan: {formatAmount(remainingEarnings)} AZN
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => collectEarnings(index)}
                              disabled={userPkg.accumulatedEarnings < 0.01}
                              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Topla
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

      {/* Dialogs */}
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
            onPurchase={handlePackageFromStore}
            userBalance={user?.balance || 0}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Package Card Component
const PackageCard = ({ package: pkg, onPurchase, canUseFree }) => {
  const [investAmount, setInvestAmount] = useState(pkg.minAmount);
  const [showFreeOption, setShowFreeOption] = useState(false);

  const monthlyEarning = (investAmount * pkg.multiplier - investAmount) / (pkg.duration / 30);

  return (
    <Card className="bg-gray-900 border-gray-800 p-6 hover:border-indigo-500 transition-all duration-300">
      <div className="text-center">
        <div className="text-5xl mb-4" style={{ color: pkg.color }}>
          {pkg.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">İnvestisiya məbləği</label>
            <Input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(parseFloat(e.target.value))}
              min={pkg.minAmount}
              max={pkg.maxAmount}
              className="bg-gray-800 border-gray-600 text-white text-center"
            />
            <div className="text-xs text-gray-500 mt-1">
              {pkg.minAmount} - {pkg.maxAmount} AZN
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-400">Aylıq gəlir</div>
            <div className="text-lg font-bold text-green-400">
              ~{formatAmount(monthlyEarning)} AZN
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => onPurchase(pkg.id, investAmount, false)}
              className="flex-1 text-black hover:opacity-80"
              style={{ backgroundColor: pkg.color }}
            >
              Satın Al
            </Button>
            
            {canUseFree && (
              <Button
                onClick={() => onPurchase(pkg.id, investAmount, true)}
                variant="outline"
                className="flex-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
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

// Store View Component
const StoreView = ({ storeItems, investmentPackages, onPurchase, userBalance }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [investAmount, setInvestAmount] = useState(0);

  const handlePurchase = () => {
    if (!selectedItem) return;
    
    const pkg = investmentPackages.find(p => p.type === selectedItem.type);
    onPurchase(selectedItem, pkg.id, investAmount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-400">
          Yeni paket almaq üçün əvvəlcə mağazadan paket lisenziyası almalısınız.
        </p>
        <div className="text-sm text-yellow-400 mt-2">
          Cari balansınız: {formatAmount(userBalance)} AZN
        </div>
      </div>

      <div className="grid gap-4">
        {storeItems.map((item) => {
          const pkg = investmentPackages.find(p => p.type === item.type);
          return (
            <Card
              key={item.id}
              className={`bg-gray-800 border-gray-700 p-4 cursor-pointer transition-all ${
                selectedItem?.id === item.id ? 'border-yellow-400' : 'hover:border-gray-600'
              }`}
              onClick={() => {
                setSelectedItem(item);
                setInvestAmount(pkg.minAmount);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-400">{item.price} AZN</div>
                  <div className="text-xs text-gray-500">Lisenziya haqqı</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedItem && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-bold text-white mb-4">İnvestisiya məbləği seçin</h4>
          <div className="space-y-4">
            <Input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(parseFloat(e.target.value))}
              min={investmentPackages.find(p => p.type === selectedItem.type)?.minAmount}
              max={investmentPackages.find(p => p.type === selectedItem.type)?.maxAmount}
              className="bg-gray-800 border-gray-600 text-white"
            />
            
            <div className="text-sm text-gray-400">
              Ümumi xərc: {selectedItem.price + investAmount} AZN
              (Lisenziya: {selectedItem.price} AZN + İnvestisiya: {investAmount} AZN)
            </div>

            <Button
              onClick={handlePurchase}
              disabled={userBalance < (selectedItem.price + investAmount)}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
            >
              {userBalance >= (selectedItem.price + investAmount) ? 'Satın Al' : 'Balans Yetərsiz'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Other component definitions remain the same...
// (PendingTransactionsView, LoginForm, RegisterForm, WithdrawForm, DepositForm, MyPackagesView)

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
                    <div className="text-white">{txn.cardNumber.slice(-4)}</div>
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
              <Badge className="bg-yellow-600">
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
      alert('Zəhmət olmasa bütün məlumatları düzgün daxil edin.');
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
      alert('Zəhmət olmasa bütün məlumatları daxil edin və dekontu yükləyin.');
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
                <div className="text-2xl" style={{ color: pkg.color }}>
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
                <Badge className="mt-1 bg-green-600">
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