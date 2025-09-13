import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { formatAmount } from '../mock';
import { Users, DollarSign, CheckCircle, XCircle, Clock, TrendingUp, User, Package, CreditCard, Building, Eye } from 'lucide-react';

const AdminPanel = () => {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 2547832,
    pendingDeposits: 23,
    pendingWithdrawals: 15,
    totalVolume: 1250000
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Mock data for demo
  useEffect(() => {
    // Mock pending deposits
    setDeposits([
      {
        id: 1,
        userName: 'Elvin Məmmədov',
        email: 'elvin@example.com',
        amount: 500,
        cardNumber: '****1234',
        receipt: 'receipt1.jpg',
        date: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: 2,
        userName: 'Aysel Hüseynova',
        email: 'aysel@example.com',
        amount: 1200,
        cardNumber: '****5678',
        receipt: 'receipt2.jpg',
        date: new Date(Date.now() - 3600000).toISOString(),
        status: 'pending'
      },
      {
        id: 3,
        userName: 'Murad Rzayev',
        email: 'murad@example.com',
        amount: 750,
        cardNumber: '****9012',
        receipt: 'receipt3.jpg',
        date: new Date(Date.now() - 7200000).toISOString(),
        status: 'approved'
      }
    ]);

    // Mock pending withdrawals
    setWithdrawals([
      {
        id: 1,
        userName: 'Səmra Qasımova',
        email: 'semra@example.com',
        amount: 2500,
        cardName: 'SEMRA QASIMOVA',
        cardNumber: '****3456',
        date: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: 2,
        userName: 'Rəşad Əlizadə',
        email: 'resad@example.com',
        amount: 1800,
        cardName: 'RESAD ALIZADE',
        cardNumber: '****7890',
        date: new Date(Date.now() - 1800000).toISOString(),
        status: 'pending'
      }
    ]);

    // Mock users with detailed info
    setUsers([
      {
        id: 1,
        name: 'Elvin Məmmədov',
        email: 'elvin@example.com',
        balance: 2500,
        totalInvested: 5000,
        totalWithdrawn: 1200,
        joinDate: '2024-01-15',
        status: 'active',
        packages: [
          { name: 'Yasamal Residences', amount: 500, date: '2024-01-20', status: 'active' },
          { name: 'Port Baku Towers', amount: 1200, date: '2024-02-10', status: 'completed' }
        ],
        deposits: [
          { amount: 500, date: '2024-01-16', status: 'approved' },
          { amount: 1000, date: '2024-02-01', status: 'approved' }
        ],
        withdrawals: [
          { amount: 300, date: '2024-02-15', status: 'approved' }
        ]
      },
      {
        id: 2,
        name: 'Aysel Hüseynova',
        email: 'aysel@example.com',
        balance: 1200,
        totalInvested: 3000,
        totalWithdrawn: 800,
        joinDate: '2024-02-20',
        status: 'active',
        packages: [
          { name: 'Flame Towers View', amount: 2500, date: '2024-03-01', status: 'active' }
        ],
        deposits: [
          { amount: 1200, date: '2024-02-21', status: 'approved' },
          { amount: 800, date: '2024-03-01', status: 'pending' }
        ],
        withdrawals: []
      }
    ]);
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'Batu' && loginForm.password === '18061999') {
      setIsLoggedIn(true);
    } else {
      alert('Yanlış istifadəçi adı və ya şifrə!');
    }
  };

  const handleDepositAction = (depositId, action) => {
    setDeposits(prev => prev.map(deposit => 
      deposit.id === depositId 
        ? { ...deposit, status: action }
        : deposit
    ));

    if (action === 'approved') {
      alert('Depozit təsdiqləndi və istifadəçinin balansına əlavə edildi.');
    } else if (action === 'rejected') {
      alert('Depozit imtina edildi.');
    } else if (action === 'processing') {
      alert('Depozit "İcrada" statusuna keçirildi.');
    }
  };

  const handleWithdrawalAction = (withdrawalId, action) => {
    setWithdrawals(prev => prev.map(withdrawal => 
      withdrawal.id === withdrawalId 
        ? { ...withdrawal, status: action }
        : withdrawal
    ));

    if (action === 'approved') {
      alert('Çıxarış təsdiqləndi və emal edildi.');
    } else if (action === 'rejected') {
      alert('Çıxarış imtina edildi.');
    } else if (action === 'processing') {
      alert('Çıxarış "İcrada" statusuna keçirildi.');
    }
  };

  const updateUserBalance = (userId, newBalance) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, balance: newBalance }
        : user
    ));
    alert('İstifadəçinin balansı yeniləndi.');
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-700 p-8 w-96">
          <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Admin Giriş</h1>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">İstifadəçi adı</label>
              <Input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="İstifadəçi adı"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şifrə</label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Şifrə"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
              Daxil Ol
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Admin Panel</h1>
            <p className="text-gray-400">InvestAZ idarəetmə paneli</p>
          </div>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            Çıxış
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ümumi İstifadəçi</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gözləyən Depozitlər</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingDeposits}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gözləyən Çıxarışlar</p>
                <p className="text-2xl font-bold text-red-400">{stats.pendingWithdrawals}</p>
              </div>
              <Clock className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ümumi Həcm</p>
                <p className="text-2xl font-bold text-green-400">{formatAmount(stats.totalVolume)} AZN</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="deposits" className="text-white">Depozitlər</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-white">Çıxarışlar</TabsTrigger>
            <TabsTrigger value="users" className="text-white">İstifadəçilər</TabsTrigger>
          </TabsList>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Depozit Sorğuları</h3>
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div key={deposit.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <h4 className="font-bold text-white">{deposit.userName}</h4>
                            <p className="text-sm text-gray-400">{deposit.email}</p>
                          </div>
                          <Badge className={`${
                            deposit.status === 'pending' ? 'bg-yellow-600' :
                            deposit.status === 'approved' ? 'bg-green-600' : 
                            deposit.status === 'processing' ? 'bg-blue-600' : 'bg-red-600'
                          }`}>
                            {deposit.status === 'pending' ? 'Gözləyir' :
                             deposit.status === 'approved' ? 'Təsdiqlənib' : 
                             deposit.status === 'processing' ? 'İcrada' : 'İmtina'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Məbləğ:</span>
                            <div className="font-bold text-green-400">{formatAmount(deposit.amount)} AZN</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Kart:</span>
                            <div className="text-white">{deposit.cardNumber}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Tarix:</span>
                            <div className="text-white">{new Date(deposit.date).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400 text-sm">Dekont:</span>
                          <div className="text-blue-400 text-sm cursor-pointer hover:underline">
                            📄 {deposit.receipt}
                          </div>
                        </div>
                      </div>
                      {deposit.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleDepositAction(deposit.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Təsdiq Et
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleDepositAction(deposit.id, 'processing')}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            İcrada
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDepositAction(deposit.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            İmtina Et
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Çıxarış Sorğuları</h3>
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <h4 className="font-bold text-white">{withdrawal.userName}</h4>
                            <p className="text-sm text-gray-400">{withdrawal.email}</p>
                          </div>
                          <Badge className={`${
                            withdrawal.status === 'pending' ? 'bg-yellow-600' :
                            withdrawal.status === 'approved' ? 'bg-green-600' : 
                            withdrawal.status === 'processing' ? 'bg-blue-600' : 'bg-red-600'
                          }`}>
                            {withdrawal.status === 'pending' ? 'Gözləyir' :
                             withdrawal.status === 'approved' ? 'Təsdiqlənib' : 
                             withdrawal.status === 'processing' ? 'İcrada' : 'İmtina'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Məbləğ:</span>
                            <div className="font-bold text-red-400">{formatAmount(withdrawal.amount)} AZN</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Kart Adı:</span>
                            <div className="text-white">{withdrawal.cardName}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Kart:</span>
                            <div className="text-white">{withdrawal.cardNumber}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400 text-sm">Tarix:</span>
                          <div className="text-white text-sm">{new Date(withdrawal.date).toLocaleString()}</div>
                        </div>
                      </div>
                      {withdrawal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Təsdiq Et
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'processing')}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            İcrada
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            İmtina Et
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">İstifadəçi İdarəetməsi</h3>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <h4 className="font-bold text-white">{user.name}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                          <Badge className="bg-green-600">
                            {user.status === 'active' ? 'Aktiv' : 'Passiv'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Balans:</span>
                            <div className="font-bold text-yellow-400">{formatAmount(user.balance)} AZN</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Ümumi İnvestisiya:</span>
                            <div className="text-white">{formatAmount(user.totalInvested)} AZN</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Qoşulma Tarixi:</span>
                            <div className="text-white">{user.joinDate}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <div className="text-green-400">{user.status}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => openUserDetails(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detaylara Bax
                        </Button>
                        <BalanceUpdateModal 
                          user={user} 
                          onUpdate={(newBalance) => updateUserBalance(user.id, newBalance)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedUser?.name} - Detaylı Məlumatlar
              </DialogTitle>
            </DialogHeader>
            {selectedUser && <UserDetailsView user={selectedUser} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// User Details View Component
const UserDetailsView = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* User Summary */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-sm text-gray-400">Cari Balans</div>
              <div className="text-xl font-bold text-yellow-400">
                {formatAmount(user.balance)} AZN
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-sm text-gray-400">Ümumi İnvestisiya</div>
              <div className="text-xl font-bold text-green-400">
                {formatAmount(user.totalInvested)} AZN
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-sm text-gray-400">Ümumi Çıxarış</div>
              <div className="text-xl font-bold text-red-400">
                {formatAmount(user.totalWithdrawn)} AZN
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="packages" className="text-white">Paketlər</TabsTrigger>
          <TabsTrigger value="deposits" className="text-white">Depozitlər</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-white">Çıxarışlar</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h4 className="font-bold text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              İnvestisiya Paketləri
            </h4>
            <div className="space-y-3">
              {user.packages.map((pkg, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-bold text-white">{pkg.name}</div>
                    <div className="text-sm text-gray-400">{pkg.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">{formatAmount(pkg.amount)} AZN</div>
                    <Badge className={pkg.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                      {pkg.status === 'active' ? 'Aktiv' : 'Tamamlandı'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h4 className="font-bold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Depozit Tarixçəsi
            </h4>
            <div className="space-y-3">
              {user.deposits.map((deposit, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-bold text-green-400">+{formatAmount(deposit.amount)} AZN</div>
                    <div className="text-sm text-gray-400">{deposit.date}</div>
                  </div>
                  <Badge className={deposit.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}>
                    {deposit.status === 'approved' ? 'Təsdiqlənib' : 'Gözləyir'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h4 className="font-bold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Çıxarış Tarixçəsi
            </h4>
            <div className="space-y-3">
              {user.withdrawals.length > 0 ? (
                user.withdrawals.map((withdrawal, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-bold text-red-400">-{formatAmount(withdrawal.amount)} AZN</div>
                      <div className="text-sm text-gray-400">{withdrawal.date}</div>
                    </div>
                    <Badge className={withdrawal.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}>
                      {withdrawal.status === 'approved' ? 'Təsdiqlənib' : 'Gözləyir'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Hələ çıxarış əməliyyatı edilməyib
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Balance Update Modal Component
const BalanceUpdateModal = ({ user, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(user.balance);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(parseFloat(newBalance));
    setOpen(false);
  };

  return (
    <div>
      <Button
        size="sm"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        <DollarSign className="w-4 h-4 mr-1" />
        Balansı Yenilə
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold text-white mb-4">Balansı Yenilə</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {user.name} üçün yeni balans
                </label>
                <Input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Yenilə
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-gray-600"
                >
                  Ləğv Et
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;