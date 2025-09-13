import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  generateRandomTransaction, 
  initialStats,
  investmentPackages,
  formatAmount 
} from '../mock';
import { ArrowUp, TrendingUp, Users, Activity, DollarSign, Eye, EyeOff } from 'lucide-react';

const InvestmentPlatform = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [user, setUser] = useState(null);

  // Live transaction feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateRandomTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 19)]); // Keep last 20 transactions
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  // User counter increment
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 6) + 1, // 1-6 users per minute
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        dailyTransactions: prev.dailyTransactions + Math.floor(Math.random() * 5) + 1
      }));
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (email, password) => {
    // Mock login
    setUser({ email, balance: 0 });
    setIsLoggedIn(true);
    setLoginOpen(false);
  };

  const handleRegister = (email, password, name) => {
    // Mock registration
    setUser({ email, name, balance: 0 });
    setIsLoggedIn(true);
    setRegisterOpen(false);
  };

  const blurName = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}*** ${parts[1]}`;
    }
    return `${name.charAt(0)}***`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-yellow-400">InvestAZ</div>
            <Badge className="bg-green-600 text-white">Canlı</Badge>
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
                <div className="text-sm">
                  <div className="text-gray-400">Balans</div>
                  <div className="font-bold text-yellow-400">{formatAmount(user?.balance || 0)} AZN</div>
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
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats & Packages */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800 p-6 glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ümumi İstifadəçi</p>
                    <p className="text-2xl font-bold text-white count-up">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center text-green-400">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <Users className="w-8 h-8 opacity-50" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6 glow-green">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Aktiv İstifadəçi</p>
                    <p className="text-2xl font-bold text-white count-up">
                      {stats.activeUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center text-green-400">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <Activity className="w-8 h-8 opacity-50" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6 glow-red">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Gündəlik Əməliyyat</p>
                    <p className="text-2xl font-bold text-white count-up">
                      {stats.dailyTransactions.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center text-green-400">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <TrendingUp className="w-8 h-8 opacity-50" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Investment Packages */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-6">İnvestisiya Paketləri</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {investmentPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400 transition-colors">
                    <h3 className="font-bold text-lg text-white mb-2">{pkg.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Minimum</span>
                        <span className="text-white">{formatAmount(pkg.minAmount)} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maksimum</span>
                        <span className="text-white">{formatAmount(pkg.maxAmount)} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gündəlik Gəlir</span>
                        <span className="text-green-400">{pkg.dailyProfit}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Müddət</span>
                        <span className="text-white">{pkg.duration} gün</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-yellow-400 text-black hover:bg-yellow-500" disabled={!isLoggedIn}>
                      {isLoggedIn ? 'İnvestisiya Et' : 'Giriş Tələb Olunur'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Live Transactions */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-yellow-400">Canlı Əməliyyatlar</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
                  <span className="text-xs text-green-400">CANLI</span>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((txn, index) => (
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
          </div>
        </div>
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

export default InvestmentPlatform;