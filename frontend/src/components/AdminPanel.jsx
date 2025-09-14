import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, DollarSign, MessageCircle, CheckCircle, XCircle, Clock, Eye, FileText, Search, Edit, Trash2, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import axios from 'axios';

// Format amount function - inline to avoid import issues
const formatAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
  return amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// For testing purposes, use local backend URL
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : process.env.REACT_APP_BACKEND_URL;

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
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState([]);
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
    }
  }, [token]);

  // Auto-refresh data every 3 seconds for better real-time experience
  useEffect(() => {
    if (isLoggedIn && autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
        setLastRefresh(new Date());
      }, 3000); // 3 seconds for faster updates
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, autoRefresh]);

  // Setup WebSocket for real-time admin updates
  const setupAdminWebSocket = () => {
    const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/admin`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ Admin WebSocket connected');
      showNotification('🔗 Real-vaxt bağlantı quruldu');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleAdminWebSocketMessage(data);
      } catch (e) {
        console.log('Admin WebSocket message:', event.data);
      }
    };
    
    ws.onerror = (error) => {
      console.log('❌ Admin WebSocket error:', error);
      showNotification('⚠️ Bağlantı problemi');
    };
    
    ws.onclose = () => {
      console.log('🔌 Admin WebSocket disconnected, reconnecting...');
      // Reconnect after 3 seconds
      setTimeout(() => setupAdminWebSocket(), 3000);
    };
    
    setWebsocket(ws);
    
    return () => {
      if (ws) ws.close();
    };
  };

  const handleAdminWebSocketMessage = (data) => {
    console.log('📧 Admin WebSocket message received:', data);
    
    // Handle real-time admin notifications
    switch (data.type) {
      case 'new_user_registration':
        fetchUsers();
        fetchStats();
        showNotification(`🎉 Yeni qeydiyyat: ${data.user_name} (${data.user_code})`, 'success');
        break;
      case 'package_purchase':
        fetchStats();
        fetchUsers(); // Refresh to show updated user investment
        showNotification(`📦 Paket alışı: ${data.user_name} - ${data.package_type} (${formatAmount(data.amount)} AZN)`, 'info');
        break;
      case 'new_transaction':
        fetchTransactions();
        fetchStats();
        showNotification(`💰 Yeni ${data.transaction_type}: ${data.user_name} - ${formatAmount(data.amount)} AZN`, 'warning');
        break;
      case 'receipt_uploaded':
        fetchTransactions();
        showNotification(`📄 Dekont yükləndi: ${data.user_name} - ${data.filename}`, 'info');
        break;
      case 'new_message':
        fetchMessages();
        showNotification(`💬 Yeni mesaj: ${data.user_name} - ${data.content.substring(0, 50)}...`, 'message');
        break;
      default:
        // Refresh all data for unknown message types
        fetchData();
        break;
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchTransactions(),
        fetchMessages(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
      setPendingTransactions(response.data);
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

  const handleLogin = async (username, password) => {
    try {
      // Use the correct admin credentials for API
      const loginEmail = username === 'Batu' ? 'admin@investaz.com' : username;
      const loginPassword = password === '18061999' ? '18061999' : password;
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      
      const newToken = response.data.access_token;
      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      fetchData();
      setupAdminWebSocket();
      showNotification('✅ Admin panelinə daxil oldunuz', 'success');
    } catch (error) {
      console.error('Admin login error:', error);
      showNotification('❌ Yanlış istifadəçi adı və ya şifrə', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsLoggedIn(false);
    if (websocket) {
      websocket.close();
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
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      showNotification('❌ Axtarış zamanı xəta baş verdi', 'error');
    }
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
      
      fetchTransactions();
      fetchStats();
      showNotification(`✅ Əməliyyat ${approve ? 'təsdiqləndi' : 'rədd edildi'}`, 'success');
    } catch (error) {
      console.error('Error approving transaction:', error);
      showNotification('❌ Əməliyyat zamanı xəta baş verdi', 'error');
    }
  };

  const updateUserBalance = async (userId, newBalanceValue) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/users/update-balance`, {
        user_id: userId,
        new_balance: parseFloat(newBalanceValue),
        notes: 'Admin tərəfindən yeniləndi'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBalanceEditUser(null);
      setNewBalance('');
      fetchUsers();
      showNotification('✅ İstifadəçi balansı yeniləndi', 'success');
    } catch (error) {
      console.error('Error updating balance:', error);
      showNotification('❌ Balans yenilinərkən xəta baş verdi', 'error');
    }
  };

  const replyToMessage = async (messageId, content) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/messages/${messageId}/reply`, {
        content: content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReplyMessage('');
      fetchMessages();
      showNotification('✅ Cavab göndərildi', 'success');
    } catch (error) {
      console.error('Error replying to message:', error);
      showNotification('❌ Cavab göndərilərkən xəta baş verdi', 'error');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchMessages();
      showNotification('✅ Mesaj silindi', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification('❌ Mesaj silinərkən xəta baş verdi', 'error');
    }
  };

  const viewReceipt = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/receipts/${filename}/base64`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentReceipt(response.data);
      setReceiptViewOpen(true);
    } catch (error) {
      console.error('Error viewing receipt:', error);
      showNotification('❌ Dekont görüntülənərkən xəta baş verdi', 'error');
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const userMessages = messages.filter(m => !m.is_from_admin);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Header with notifications */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">InvestAZ Admin Panel</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${websocket?.readyState === 1 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-400">
                {websocket?.readyState === 1 ? 'Real-vaxt bağlı' : 'Bağlantı kəsildi'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">
                Son yeniləmə: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="border-gray-600"
            >
              {autoRefresh ? 'Avtomatik yeniləmə açıq' : 'Avtomatik yeniləmə bağlı'}
            </Button>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-red-600 text-red-400">
          Çıxış
        </Button>
      </div>

      {/* Real-time notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg shadow-lg border-l-4 ${
                notification.type === 'success' ? 'bg-green-900 border-green-400' :
                notification.type === 'error' ? 'bg-red-900 border-red-400' :
                notification.type === 'warning' ? 'bg-yellow-900 border-yellow-400' :
                notification.type === 'message' ? 'bg-blue-900 border-blue-400' :
                'bg-gray-900 border-gray-400'
              } animate-pulse`}
            >
              <div className="flex items-start space-x-2">
                <Bell className="w-4 h-4 mt-0.5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm text-white">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Dashboard - Enhanced with real-time indicators */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ümumi İstifadəçilər</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Aktiv Paketlər</p>
              <p className="text-2xl font-bold text-green-400">{stats.activePackages}</p>
            </div>
            <FileText className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gözləyən Əməliyyatlar</p>
              <p className="text-2xl font-bold text-yellow-400 animate-pulse">{stats.pendingTransactions}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Toplam Depozitlər</p>
              <p className="text-2xl font-bold text-green-400">{formatAmount(stats.totalDeposits)} AZN</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Toplam Çıxarışlar</p>
              <p className="text-2xl font-bold text-red-400">{formatAmount(stats.totalWithdrawals)} AZN</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Əməliyyatlar ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            İstifadəçilər ({users.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Mesajlar ({userMessages.length})
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Axtarış
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Gözləyən Əməliyyatlar ({pendingTransactions.length})
            </h2>
            
            {pendingTransactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Gözləyən əməliyyat yoxdur.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-yellow-400">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={transaction.type === 'deposit' ? 'bg-green-600' : 'bg-blue-600'}>
                            {transaction.type === 'deposit' ? 'Depozit' : 'Çıxarış'}
                          </Badge>
                          <span className="text-white font-medium">
                            {formatAmount(transaction.amount)} AZN
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Kart adı: {transaction.card_name}</p>
                          <p>Kart nömrəsi: ****{transaction.card_number?.slice(-4)}</p>
                          <p>Tarix: {new Date(transaction.created_date).toLocaleString()}</p>
                          {transaction.receipt_filename && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewReceipt(transaction.receipt_filename)}
                              className="mt-2 border-blue-600 text-blue-400"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Dekont Gör
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveTransaction(transaction.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Təsdiqlə
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveTransaction(transaction.id, false)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rədd Et
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Bütün İstifadəçilər ({users.length})
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-blue-400">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-medium">{user.name}</h3>
                        <Badge className="bg-purple-600">{user.user_code}</Badge>
                      </div>
                      
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Email: {user.email}</p>
                        <p>Balans: <span className="text-green-400 font-bold">{formatAmount(user.balance)} AZN</span></p>
                        <p>Ümumi investisiya: {formatAmount(user.total_invested)} AZN</p>
                        <p>Ümumi qazanc: {formatAmount(user.total_earned)} AZN</p>
                        <p>Qeydiyyat: {new Date(user.join_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBalanceEditUser(user);
                          setNewBalance(user.balance.toString());
                        }}
                        className="border-yellow-600 text-yellow-400"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Balans
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Dəstək Mesajları ({userMessages.length})
            </h2>
            
            {userMessages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Mesaj yoxdur.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userMessages.map((message) => {
                  const user = users.find(u => u.id === message.user_id);
                  return (
                    <div key={message.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-green-400">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{user?.name || 'Unknown'}</span>
                          <Badge className="bg-purple-600">{user?.user_code}</Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_date).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{message.content}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Cavabınızı yazın..."
                          value={selectedUser === message.id ? replyMessage : ''}
                          onChange={(e) => {
                            if (selectedUser === message.id) {
                              setReplyMessage(e.target.value);
                            }
                          }}
                          onFocus={() => setSelectedUser(message.id)}
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (replyMessage.trim()) {
                              replyToMessage(message.id, replyMessage);
                            }
                          }}
                          disabled={!replyMessage.trim() || selectedUser !== message.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Cavab Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMessage(message.id)}
                          className="border-red-600 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              İstifadəçi Axtarışı
            </h2>
            
            <div className="flex space-x-2 mb-6">
              <Input
                placeholder="AZ kodu və ya istifadəçi adı daxil edin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <Button onClick={searchUsers} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Axtar
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">Axtarış nəticələri ({searchResults.length})</h3>
                {searchResults.map((user) => (
                  <div key={user.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-purple-400">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-medium">{user.name}</h3>
                          <Badge className="bg-purple-600">{user.user_code}</Badge>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Email: {user.email}</p>
                          <p>Balans: <span className="text-green-400 font-bold">{formatAmount(user.balance)} AZN</span></p>
                          <p>Ümumi investisiya: {formatAmount(user.total_invested)} AZN</p>
                          <p>Ümumi qazanc: {formatAmount(user.total_earned)} AZN</p>
                          
                          {user.active_package && (
                            <div className="mt-2 p-2 bg-gray-700 rounded">
                              <p className="text-yellow-400 font-medium">Aktiv Paket:</p>
                              <p>Tip: {user.active_package.package_type}</p>
                              <p>İnvestisiya: {formatAmount(user.active_package.invested_amount)} AZN</p>
                              <p>Toplanmış qazanc: {formatAmount(user.active_package.accumulated_earnings || 0)} AZN</p>
                            </div>
                          )}
                          
                          {user.recent_transactions && user.recent_transactions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-blue-400 font-medium">Son əməliyyatlar:</p>
                              {user.recent_transactions.slice(0, 3).map((txn, idx) => (
                                <p key={idx} className="text-xs">
                                  {txn.type}: {formatAmount(txn.amount)} AZN ({txn.status})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBalanceEditUser(user);
                            setNewBalance(user.balance.toString());
                          }}
                          className="border-yellow-600 text-yellow-400"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Balans
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Balance Edit Dialog */}
      <Dialog open={!!balanceEditUser} onOpenChange={() => setBalanceEditUser(null)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {balanceEditUser?.name} - Balans Yenilə
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Cari Balans</label>
              <p className="text-xl font-bold text-green-400">
                {formatAmount(balanceEditUser?.balance || 0)} AZN
              </p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Yeni Balans</label>
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Yeni balans daxil edin"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setBalanceEditUser(null)}
                variant="outline"
                className="flex-1"
              >
                Ləğv Et
              </Button>
              <Button
                onClick={() => updateUserBalance(balanceEditUser?.id, newBalance)}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newBalance || isNaN(parseFloat(newBalance))}
              >
                Yenilə
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt View Dialog */}
      <Dialog open={receiptViewOpen} onOpenChange={setReceiptViewOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Dekont Görüntülə</DialogTitle>
          </DialogHeader>
          
          {currentReceipt && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Fayl adı: {currentReceipt.filename}</p>
                {currentReceipt.media_type.startsWith('image/') ? (
                  <img
                    src={currentReceipt.data_url}
                    alt="Receipt"
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-600"
                  />
                ) : (
                  <div className="p-8 border border-gray-600 rounded-lg">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400">PDF faylını görmək üçün aşağıdakı düyməni basın</p>
                    <Button
                      className="mt-4"
                      onClick={() => window.open(currentReceipt.data_url, '_blank')}
                    >
                      PDF-i Aç
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Admin Login Component
const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Batu' && password === '18061999') {
      onLogin('admin@investaz.com', '18061999');
    } else {
      alert('❌ Yanlış istifadəçi adı və ya şifrə');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">InvestAZ</h1>
          <p className="text-gray-400">Admin Paneli</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              İstifadəçi Adı
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="İstifadəçi adını daxil edin"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifrə
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Şifrəni daxil edin"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Daxil Ol
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminPanel;