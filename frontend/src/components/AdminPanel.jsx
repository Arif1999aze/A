import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { formatAmount } from '../mock';
import { Users, DollarSign, MessageCircle, CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [users, setUsers] = useState([]);
  const [transactions, setPendingTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0
  });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchData();
      // Auto-refresh data every 5 seconds
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchTransactions(),
        fetchMessages()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setStats(prev => ({ ...prev, totalUsers: response.data.length }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pending = response.data.filter(t => t.status === 'pending');
      setPendingTransactions(pending);
      
      const deposits = response.data.filter(t => t.type === 'deposit' && t.status === 'approved');
      const withdrawals = response.data.filter(t => t.type === 'withdraw' && t.status === 'approved');
      
      setStats(prev => ({
        ...prev,
        pendingTransactions: pending.length,
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0)
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/messages`, {
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
      localStorage.setItem('admin_token', access_token);
      setToken(access_token);
      setIsLoggedIn(true);
    } catch (error) {
      alert('❌ Admin girişi uğursuz. Email və şifrənizi yoxlayın.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsLoggedIn(false);
  };

  const approveTransaction = async (transactionId, approve, notes = '') => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/transactions/approve`, {
        transaction_id: transactionId,
        approve: approve,
        admin_notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(approve ? '✅ Əməliyyat təsdiqləndi.' : '❌ Əməliyyat rədd edildi.');
      fetchTransactions();
      setSelectedTransaction(null);
    } catch (error) {
      alert('❌ Əməliyyat zamanı xəta baş verdi.');
    }
  };

  const replyToMessage = async (messageId) => {
    if (!replyMessage.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/api/admin/messages/${messageId}/reply`, {
        content: replyMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Cavab göndərildi.');
      setReplyMessage('');
      fetchMessages();
    } catch (error) {
      alert('❌ Mesaj göndərilmədi.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-700 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-yellow-400 mb-2">InvestAZ Admin</h1>
            <p className="text-gray-400">Admin panelinə giriş</p>
          </div>
          <AdminLoginForm onLogin={handleLogin} />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-yellow-400">InvestAZ Admin</h1>
            <Badge className="bg-red-600 text-white animate-pulse">Canlı</Badge>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-red-400 text-red-400">
            Çıxış
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
                <div className="text-gray-400 text-sm">Ümumi İstifadəçilər</div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pendingTransactions}</div>
                <div className="text-gray-400 text-sm">Gözləyən Əməliyyatlar</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{formatAmount(stats.totalDeposits)}</div>
                <div className="text-gray-400 text-sm">Ümumi Depozitlər</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{formatAmount(stats.totalWithdrawals)}</div>
                <div className="text-gray-400 text-sm">Ümumi Çıxarışlar</div>
              </div>
              <DollarSign className="w-8 h-8 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="transactions" className="text-white">
              Əməliyyatlar
              {stats.pendingTransactions > 0 && (
                <Badge className="ml-2 bg-red-600">{stats.pendingTransactions}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white">İstifadəçilər</TabsTrigger>
            <TabsTrigger value="messages" className="text-white">
              Mesajlar
              {messages.filter(m => !m.is_from_admin).length > 0 && (
                <Badge className="ml-2 bg-blue-600">{messages.filter(m => !m.is_from_admin).length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <h2 className="text-xl font-bold text-yellow-400">Gözləyən Əməliyyatlar</h2>
            {transactions.map((txn) => (
              <Card key={txn.id} className="bg-gray-900 border-gray-700 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-3xl">
                        {txn.type === 'deposit' ? '💰' : '🏦'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          {txn.type === 'deposit' ? 'Depozit Sorğusu' : 'Çıxarış Sorğusu'}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {new Date(txn.created_date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Məbləğ:</span>
                        <div className="font-bold text-yellow-400">
                          {formatAmount(txn.amount)} AZN
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">İstifadəçi ID:</span>
                        <div className="text-white">{txn.user_id}</div>
                      </div>
                    </div>

                    {txn.type === 'withdraw' && (
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-400">Kart Sahibi:</span>
                          <div className="text-white">{txn.card_name}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Kart Nömrəsi:</span>
                          <div className="text-white">****{txn.card_number?.slice(-4)}</div>
                        </div>
                      </div>
                    )}

                    {txn.type === 'deposit' && txn.receipt_filename && (
                      <div className="mb-4">
                        <span className="text-gray-400">Dekont:</span>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">{txn.receipt_filename}</span>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Bax
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => approveTransaction(txn.id, true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Təsdiq Et
                    </Button>
                    <Button
                      onClick={() => approveTransaction(txn.id, false)}
                      size="sm"
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rədd Et
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Gözləyən əməliyyat yoxdur.</p>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-bold text-yellow-400">İstifadəçilər</h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id} className="bg-gray-900 border-gray-700 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white">{user.name}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <div className="flex space-x-4 mt-2 text-sm">
                        <span className="text-green-400">
                          Balans: {formatAmount(user.balance)} AZN
                        </span>
                        <span className="text-blue-400">
                          Yatırım: {formatAmount(user.total_invested)} AZN
                        </span>
                        <span className="text-yellow-400">
                          Qazanc: {formatAmount(user.total_earned)} AZN
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedUser(user)}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detallar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <h2 className="text-xl font-bold text-yellow-400">Dəstək Mesajları</h2>
            <div className="space-y-4">
              {messages.filter(m => m.message_type === 'support').map((msg) => (
                <Card key={msg.id} className="bg-gray-900 border-gray-700 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-white">İstifadəçi: {msg.user_id}</span>
                        {!msg.is_from_admin && !msg.is_read && (
                          <Badge className="bg-red-600 text-xs">Yeni</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.created_date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg mb-3 ${msg.is_from_admin ? 'bg-blue-900/30 border-l-4 border-blue-400' : 'bg-gray-800 border-l-4 border-yellow-400'}`}>
                    <div className="text-sm text-gray-300 mb-1">
                      {msg.is_from_admin ? 'Admin' : 'İstifadəçi'}
                    </div>
                    <p className="text-white">{msg.content}</p>
                  </div>

                  {!msg.is_from_admin && (
                    <div className="space-y-2">
                      <Input
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Cavabınızı yazın..."
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Button
                        onClick={() => replyToMessage(msg.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Cavabla
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">İstifadəçi Detalları</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserDetailsView user={selectedUser} onClose={() => setSelectedUser(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Admin Login Form Component
const AdminLoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@investaz.com');
  const [password, setPassword] = useState('18061999');

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
      <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
        Admin Girişi
      </Button>
    </form>
  );
};

// User Details View Component
const UserDetailsView = ({ user, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Ad Soyad</label>
          <div className="text-white font-medium">{user.name}</div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Email</label>
          <div className="text-white font-medium">{user.email}</div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Balans</label>
          <div className="text-green-400 font-bold">{formatAmount(user.balance)} AZN</div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Ümumi Yatırım</label>
          <div className="text-blue-400 font-bold">{formatAmount(user.total_invested)} AZN</div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Ümumi Qazanc</label>
          <div className="text-yellow-400 font-bold">{formatAmount(user.total_earned)} AZN</div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Qeydiyyat Tarixi</label>
          <div className="text-white">{new Date(user.join_date).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <Button onClick={onClose} className="w-full">
          Bağla
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;