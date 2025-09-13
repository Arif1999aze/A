import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  generateRandomTransaction, 
  generateMembershipActivity,
  initialStats,
  investmentPackages,
  companyInfo,
  formatAmount 
} from '../mock';
import { ArrowUp, TrendingUp, Users, Activity, DollarSign, Eye, EyeOff, Building, Award, Shield, Globe, CreditCard, Upload, Package } from 'lucide-react';

const InvestmentPlatform = () => {
  const [transactions, setTransactions] = useState([]);
  const [membershipActivities, setMembershipActivities] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [user, setUser] = useState(null);
  const [userInvestments, setUserInvestments] = useState([]);

  // Live transaction feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateRandomTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 19)]);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  // Live membership activities
  useEffect(() => {
    const interval = setInterval(() => {
      const newMember = generateMembershipActivity();
      setMembershipActivities(prev => [newMember, ...prev.slice(0, 9)]);
    }, 4000 + Math.random() * 3000);

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
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (email, password) => {
    setUser({ 
      email, 
      name: email.split('@')[0], 
      balance: 2500 
    });
    setIsLoggedIn(true);
    setLoginOpen(false);
  };

  const handleRegister = (email, password, name) => {
    setUser({ 
      email, 
      name, 
      balance: 0 
    });
    setIsLoggedIn(true);
    setRegisterOpen(false);
  };

  const handleWithdraw = (amount, cardName, cardNumber) => {
    if (amount > user.balance) {
      alert('Balansınızda kifayət qədər vəsait yoxdur.');
      return;
    }
    
    setUser(prev => ({ ...prev, balance: prev.balance - amount }));
    alert(`${formatAmount(amount)} AZN çıxarış sorğusu göndərildi. Kart: ${cardNumber.slice(-4)}`);
    setWithdrawOpen(false);
  };

  const handleDeposit = (amount, cardNumber, receipt) => {
    alert(`${formatAmount(amount)} AZN yatırım sorğusu göndərildi. Təsdiq gözlənilir.`);
    setDepositOpen(false);
  };

  const blurName = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}*** ${parts[1]}`;
    }
    return `${name.charAt(0)}***`;
  };

  const handleInvestment = (packageId) => {
    const pkg = investmentPackages.find(p => p.id === packageId);
    if (user.balance >= pkg.price) {
      setUser(prev => ({ ...prev, balance: prev.balance - pkg.price }));
      setUserInvestments(prev => [...prev, {
        id: Date.now(),
        package: pkg,
        date: new Date().toISOString(),
        status: 'active'
      }]);
      alert(`${pkg.name} paketinə uğurla investisiya etdiniz!`);
    } else {
      alert('Balansınızda kifayət qədər vəsait yoxdur.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-yellow-400">InvestAZ</div>
            <Badge className="bg-green-600 text-white animate-pulse">Canlı</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                      Giriş
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Hesaba Giriş</DialogTitle>
                    </DialogHeader>
                    <LoginForm onLogin={handleLogin} />
                  </DialogContent>
                </Dialog>

                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                      Qeydiyyat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Yeni Hesab</DialogTitle>
                    </DialogHeader>
                    <RegisterForm onRegister={handleRegister} />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <div className="text-gray-400">Xoş gəlmisiniz</div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-400">Balans</div>
                    <div className="font-bold text-yellow-400">{formatAmount(user?.balance || 0)} AZN</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white">
                        Çıxarış Et
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Çıxarış Et</DialogTitle>
                      </DialogHeader>
                      <WithdrawForm onWithdraw={handleWithdraw} maxAmount={user.balance} />
                    </DialogContent>
                  </Dialog>

                  <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white">
                        Yatırım Et
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Yatırım Et</DialogTitle>
                      </DialogHeader>
                      <DepositForm onDeposit={handleDeposit} />
                    </DialogContent>
                  </Dialog>

                  <Dialog open={packagesOpen} onOpenChange={setPackagesOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                        <Package className="w-4 h-4 mr-1" />
                        Paketlərim
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Mənim Paketlərim</DialogTitle>
                      </DialogHeader>
                      <MyPackagesView investments={userInvestments} />
                    </DialogContent>
                  </Dialog>
                </div>

                <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                  Çıxış
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!isLoggedIn ? (
          // Landing Page
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center py-16">
              <h1 className="text-6xl font-bold mb-6">
                <span className="text-white">Invest</span>
                <span className="text-yellow-400">AZ</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Azərbaycanın ən etibarlı investisiya platforması. 15 illik təcrübə ilə maliyyə azadlığınıza giden yol.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setRegisterOpen(true)} className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-3 text-lg">
                  İndi Başla
                </Button>
                <Button variant="outline" onClick={() => setLoginOpen(true)} className="border-yellow-400 text-yellow-400 px-8 py-3 text-lg">
                  Hesaba Giriş
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-gray-900 border-gray-800 p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 count-up">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2">Ümumi İstifadəçi</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Artır</span>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6 text-center">
                <div className="text-3xl font-bold text-green-400 count-up">
                  {stats.activeUsers.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2">Aktiv İstifadəçi</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Artır</span>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 count-up">
                  {stats.dailyTransactions.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2">Gündəlik Əməliyyat</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Artır</span>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 count-up">
                  {stats.newMembers.toLocaleString()}
                </div>
                <div className="text-gray-400 mt-2">Yeni Üzvlər (Bu gün)</div>
                <div className="flex items-center justify-center text-green-400 mt-2">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Artır</span>
                </div>
              </Card>
            </div>

            {/* Investment Packages */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">İnvestisiya Paketləri</h2>
              <div className="grid md:grid-cols-5 gap-6">
                {investmentPackages.map((pkg) => (
                  <Card key={pkg.id} className="bg-gray-900 border-gray-800 p-6 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
                    <div className="text-center">
                      <div className="text-4xl mb-4" style={{ color: pkg.color }}>
                        {pkg.icon}
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">{pkg.name}</h3>
                      <div className="text-2xl font-bold mb-4" style={{ color: pkg.color }}>
                        {formatAmount(pkg.price)} AZN
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gündəlik Gəlir</span>
                          <span className="text-green-400">{pkg.dailyProfit}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Müddət</span>
                          <span className="text-white">{pkg.duration} gün</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full text-black hover:opacity-80" 
                        style={{ backgroundColor: pkg.color }}
                        onClick={() => setRegisterOpen(true)}
                      >
                        İnvestisiya Et
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Live Activities */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Live Transactions */}
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">Canlı Əməliyyatlar</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">CANLI</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-yellow-400">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white text-sm">
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
                          <div className={`font-bold text-sm ${txn.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
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
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">Yeni Üzvlər</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-purple-400">CANLI</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {membershipActivities.map((member) => (
                    <div key={member.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-purple-400">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-white text-sm">
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
            <Card className="bg-gray-900 border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">InvestAZ Haqqında</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Globe className="w-6 h-6 text-yellow-400" />
                    <div>
                      <div className="font-bold text-white">{companyInfo.name}</div>
                      <div className="text-gray-400">{companyInfo.country} şirkəti</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="font-bold text-white">Lisenziya: {companyInfo.license}</div>
                      <div className="text-gray-400">FCA tərəfindən tənzimlənir</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="font-bold text-white">{companyInfo.experience}</div>
                      <div className="text-gray-400">{companyInfo.established}-cu ildən xidmətdə</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-4 flex items-center">
                    <Award className="w-5 h-5 text-yellow-400 mr-2" />
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
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">
                Xoş gəlmisiniz, {user.name}!
              </h1>
              <p className="text-gray-300">İnvestisiya paketinizi seçin və qazanca başlayın</p>
            </div>

            {/* Investment Packages - Enhanced */}
            <div className="grid md:grid-cols-5 gap-6">
              {investmentPackages.map((pkg) => (
                <Card key={pkg.id} className="bg-gray-900 border-gray-800 p-6 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 glow">
                  <div className="text-center">
                    <div className="text-5xl mb-4" style={{ color: pkg.color }}>
                      {pkg.icon}
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">{pkg.name}</h3>
                    <div className="text-2xl font-bold mb-4" style={{ color: pkg.color }}>
                      {formatAmount(pkg.price)} AZN
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gündəlik Gəlir</span>
                        <span className="text-green-400">{pkg.dailyProfit}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Müddət</span>
                        <span className="text-white">{pkg.duration} gün</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ümumi Gəlir</span>
                        <span className="text-yellow-400">
                          {formatAmount(pkg.price * (pkg.dailyProfit / 100) * pkg.duration)} AZN
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="w-full text-black hover:opacity-80" 
                      style={{ backgroundColor: pkg.color }}
                      onClick={() => handleInvestment(pkg.id)}
                      disabled={user.balance < pkg.price}
                    >
                      {user.balance >= pkg.price ? 'İnvestisiya Et' : 'Balans Yoxdur'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Live Feed */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">Canlı Əməliyyatlar</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">CANLI</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-yellow-400">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white text-sm">
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
                          <div className={`font-bold text-sm ${txn.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
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
                    className="border-gray-600 text-gray-400 hover:text-white"
                  >
                    {showBalances ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showBalances ? 'Adları Gizlə' : 'Adları Göstər'}
                  </Button>
                </div>
              </Card>

              {/* Live Memberships */}
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">Yeni Üzvlər</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-purple-400">CANLI</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {membershipActivities.map((member) => (
                    <div key={member.id} className="bg-gray-800 rounded-lg p-3 slide-up border-l-4 border-l-purple-400">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-white text-sm">
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
const MyPackagesView = ({ investments }) => {
  if (!investments.length) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Hələ heç bir paketiniz yoxdur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {investments.map((investment) => (
        <Card key={investment.id} className="bg-gray-800 border-gray-700 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="text-2xl" style={{ color: investment.package.color }}>
                {investment.package.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{investment.package.name}</h3>
                <div className="text-sm text-gray-400">
                  {new Date(investment.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white">
                {formatAmount(investment.package.price)} AZN
              </div>
              <div className="text-sm text-green-400">
                +{investment.package.dailyProfit}% gündəlik
              </div>
              <Badge className="mt-1 bg-green-600">
                {investment.status === 'active' ? 'Aktiv' : 'Bitib'}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InvestmentPlatform;