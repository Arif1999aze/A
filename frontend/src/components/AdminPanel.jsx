import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { formatAmount } from '../mock';
import { Users, DollarSign, MessageCircle, CheckCircle, XCircle, Clock, Eye, FileText, Search, Edit, Trash2 } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [balanceEditUser, setBalanceEditUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activePackages: 0
  });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchData();
      setupAdminWebSocket();
      // Auto-refresh data every 10 seconds
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Setup WebSocket for admin real-time updates
  const setupAdminWebSocket = () => {
    const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/admin`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleAdminWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
      console.log('Admin WebSocket error:', error);
    };
    
    setWebsocket(ws);
    
    return () => {
      if (ws) ws.close();
    };
  };

  const handleAdminWebSocketMessage = (data) => {
    // Handle real-time admin notifications
    switch (data.type) {
      case 'new_user_registration':
        fetchUsers();
        break;
      case 'package_purchase':
      case 'new_transaction':
      case 'receipt_uploaded':
        fetchTransactions();
        break;
      case 'new_message':
        fetchMessages();
        break;
      default:
        // Refresh all data for unknown message types
        fetchData();
        break;
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchTransactions(),
        fetchMessages()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
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
    if (websocket) {
      websocket.close();
    }
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
      fetchStats();
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

  const deleteMessage = async (messageId) => {
    if (!confirm('Bu mesajı silmək istədiyinizdən əminsiniz?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Mesaj silindi.');
      fetchMessages();
    } catch (error) {
      alert('❌ Mesaj silinmədi.');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('❌ Axtarış zamanı xəta baş verdi.');
    }
  };

  const updateUserBalance = async () => {
    if (!balanceEditUser || !newBalance) return;

    try {
      await axios.post(`${API_BASE_URL}/api/admin/users/update-balance`, {
        user_id: balanceEditUser.id,
        new_balance: parseFloat(newBalance),
        notes: `Admin tərəfindən balans yeniləndi`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ İstifadəçi balansı yeniləndi.');
      setBalanceEditUser(null);
      setNewBalance('');
      fetchUsers();
      // Clear search results to refresh
      if (searchQuery.trim()) {
        searchUsers();
      }
    } catch (error) {
      alert('❌ Balans yenilənmədi.');
    }
  };

  const viewReceipt = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/receipts/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('❌ Dekont açıla bilmədi.');
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <div className="text-2xl font-bold text-purple-400">{stats.activePackages}</div>
                <div className="text-gray-400 text-sm">Aktiv Paketlər</div>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
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

        {/* User Search Section */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">İstifadəçi Axtarışı</h2>
          <div className="flex space-x-4 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="AZ kodu və ya ad ilə axtarın..."
              className="bg-gray-800 border-gray-600 text-white flex-1"
            />
            <Button onClick={searchUsers} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Axtar
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-300">Axtarış Nəticələri:</h3>
              {searchResults.map((user) => (
                <UserSearchResult 
                  key={user.id} 
                  user={user} 
                  onEditBalance={(user) => {
                    setBalanceEditUser(user);
                    setNewBalance(user.balance.toString());
                  }}
                />
              ))}
            </div>
          )}
        </Card>

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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => viewReceipt(txn.receipt_filename)}
                          >
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
                      <p className="text-yellow-400 text-sm font-bold">Kod: {user.user_code}</p>
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
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          setBalanceEditUser(user);
                          setNewBalance(user.balance.toString());
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Balans
                      </Button>
                      <Button
                        onClick={() => setSelectedUser(user)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detallar
                      </Button>
                    </div>
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
                    <Button
                      onClick={() => deleteMessage(msg.id)}
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Sil
                    </Button>
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

      {/* Balance Edit Modal */}
      <Dialog open={!!balanceEditUser} onOpenChange={() => setBalanceEditUser(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Balans Yenilə</DialogTitle>
          </DialogHeader>
          {balanceEditUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">İstifadəçi:</label>
                <div className="text-white font-bold">{balanceEditUser.name}</div>
                <div className="text-yellow-400 text-sm">Kod: {balanceEditUser.user_code}</div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Cari Balans:</label>
                <div className="text-green-400 font-bold">{formatAmount(balanceEditUser.balance)} AZN</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Yeni Balans (AZN):</label>
                <Input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setBalanceEditUser(null)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Ləğv Et
                </Button>
                <Button 
                  onClick={updateUserBalance}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Yenilə
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// User Search Result Component
const UserSearchResult = ({ user, onEditBalance }) => {
  return (
    <Card className="bg-gray-800 border-gray-600 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div>
              <h3 className="font-bold text-white">{user.name}</h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-yellow-400 text-sm font-bold">Kod: {user.user_code}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
            <div>
              <span className="text-gray-400">Balans:</span>
              <div className="text-green-400 font-bold">{formatAmount(user.balance)} AZN</div>
            </div>
            <div>
              <span className="text-gray-400">Yatırım:</span>
              <div className="text-blue-400 font-bold">{formatAmount(user.total_invested)} AZN</div>
            </div>
            <div>
              <span className="text-gray-400">Qazanc:</span>
              <div className="text-yellow-400 font-bold">{formatAmount(user.total_earned)} AZN</div>
            </div>
          </div>

          {user.active_package && (
            <div className="bg-gray-700 rounded p-3 mb-3">
              <h4 className="text-sm font-bold text-white mb-2">Aktiv Paket:</h4>
              <div className="text-sm">
                <span className="text-gray-400">Paket: </span>
                <span className="text-white">{user.active_package.package_type}</span>
                <span className="text-gray-400 ml-4">Məbləğ: </span>
                <span className="text-green-400">{formatAmount(user.active_package.invested_amount)} AZN</span>
              </div>
            </div>
          )}

          {user.recent_transactions && user.recent_transactions.length > 0 && (
            <div className="bg-gray-700 rounded p-3">
              <h4 className="text-sm font-bold text-white mb-2">Son Əməliyyatlar:</h4>
              <div className="space-y-1">
                {user.recent_transactions.slice(0, 3).map((txn) => (
                  <div key={txn.id} className="text-xs flex justify-between">
                    <span className={txn.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                      {txn.type === 'deposit' ? '↑' : '↓'} {formatAmount(txn.amount)} AZN
                    </span>
                    <span className="text-gray-500">
                      {new Date(txn.created_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-4">
          <Button
            onClick={() => onEditBalance(user)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Balans Dəyiş
          </Button>
        </div>
      </div>
    </Card>
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
          <label className="text-sm text-gray-400">İstifadəçi Kodu</label>
          <div className="text-yellow-400 font-bold">{user.user_code}</div>
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