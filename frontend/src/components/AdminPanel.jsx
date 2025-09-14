import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, DollarSign, MessageCircle, CheckCircle, XCircle, Clock, Eye, FileText, Search, Edit, Trash2, RefreshCw, Bell, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';

// Format amount function
const formatAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
  return amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Use development URL for local testing
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [balanceEditUser, setBalanceEditUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activePackages: 0
  });

  // Refs for auto-scroll
  const notificationsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('🔄 UseEffect işləyir, token:', token ? 'mövcud' : 'yox', 'isLoggedIn:', isLoggedIn);
    
    if (token && !isLoggedIn) {
      console.log('🔐 Token mövcud, login edilir...');
      setIsLoggedIn(true);
      initializeAdminPanel();
    } else if (token && isLoggedIn) {
      console.log('✅ Token və login mövcud, panel aktiv');
    }
  }, [token]);

  // Initialize admin panel with data fetching and WebSocket
  const initializeAdminPanel = async () => {
    console.log('🚀 Admin panel başladılır...');
    
    if (!token) {
      console.log('❌ Token yoxdur, panel başladıla bilməz');
      return;
    }
    
    try {
      // Fetch initial data
      console.log('📊 İlkin məlumatlar yüklənir...');
      await fetchAllData();
      
      // Setup WebSocket connection
      console.log('🔌 WebSocket bağlantısı qurulur...');
      setupWebSocketConnection();
      
      // Start auto-refresh timer
      console.log('⏰ Avtomatik yeniləmə başladılır...');
      startAutoRefresh();
      
      console.log('✅ Admin panel tam hazır');
      showNotification('✅ Admin panel uğurla başladıldı', 'success');
    } catch (error) {
      console.error('❌ Admin panel başladılarkən xəta:', error);
      showNotification('❌ Admin panel başladılarkən xəta baş verdi', 'error');
    }
  };

  // Setup WebSocket connection for real-time updates
  const setupWebSocketConnection = () => {
    const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/admin`;
    console.log('🔌 WebSocket bağlantısı qurulur:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ Admin WebSocket bağlandı');
      setIsConnected(true);
      showNotification('🔗 Real-vaxt bağlantı quruldu', 'success');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket mesajı alındı:', data);
        handleRealtimeUpdate(data);
      } catch (e) {
        console.log('📨 WebSocket mətn mesajı:', event.data);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket xətası:', error);
      setIsConnected(false);
      showNotification('⚠️ Bağlantı problemi', 'error');
    };
    
    ws.onclose = (event) => {
      console.log('🔌 WebSocket bağlantısı kəsildi, yenidən bağlanılır...');
      setIsConnected(false);
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (isLoggedIn) {
          setupWebSocketConnection();
        }
      }, 3000);
    };
    
    setWebsocket(ws);
  };

  // Handle real-time updates from WebSocket
  const handleRealtimeUpdate = (data) => {
    switch (data.type) {
      case 'new_user_registration':
        showNotification(`🎉 Yeni qeydiyyat: ${data.user_name} (${data.user_code})`, 'info');
        fetchUsers();
        fetchStats();
        break;
        
      case 'package_purchase':
        showNotification(`📦 Paket alışı: ${data.user_name} - ${data.package_type}`, 'info');
        fetchUsers();
        fetchStats();
        break;
        
      case 'new_transaction':
        showNotification(`💰 Yeni ${data.transaction_type}: ${data.user_name} - ${formatAmount(data.amount)} AZN`, 'warning');
        fetchTransactions();
        fetchStats();
        break;
        
      case 'receipt_uploaded':
        showNotification(`📄 Dekont yükləndi: ${data.user_name}`, 'info');
        fetchTransactions();
        break;
        
      case 'new_message':
        showNotification(`💬 Yeni mesaj: ${data.user_name}`, 'message');
        fetchMessages();
        // Auto-scroll to new message
        setTimeout(() => scrollToBottom(), 100);
        break;
        
      default:
        console.log('🔄 Bilinməyən mesaj tipi, bütün məlumatlar yenilənir');
        fetchAllData();
        break;
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show notification with auto-remove
  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date()
    };
    
    console.log('📢 Bildiriş göstərilir:', notification);
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Fetch all data
  const fetchAllData = async () => {
    console.log('🔄 Bütün məlumatlar yenilənir...');
    setLastRefresh(new Date());
    
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(), 
        fetchTransactions(),
        fetchMessages()
      ]);
      console.log('✅ Bütün məlumatlar yeniləndi');
    } catch (error) {
      console.error('❌ Məlumatları yenilərkən xəta:', error);
      showNotification('❌ Məlumatlar yenilənərkən xəta baş verdi', 'error');
    }
  };

  // Start auto-refresh every 10 seconds
  const startAutoRefresh = () => {
    const interval = setInterval(() => {
      if (isLoggedIn && isConnected) {
        fetchAllData();
      }
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  };

  // Fetch functions
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Stats xətası:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      console.log(`👥 ${response.data.length} istifadəçi yükləndi`);
    } catch (error) {
      console.error('İstifadəçilər xətası:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
      console.log(`💰 ${response.data.length} əməliyyat yükləndi`);
    } catch (error) {
      console.error('Əməliyyatlar xətası:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      console.log(`💬 ${response.data.length} mesaj yükləndi`);
    } catch (error) {
      console.error('Mesajlar xətası:', error);
    }
  };

  // Login function
  const handleLogin = async (username, password) => {
    try {
      const loginEmail = username === 'Batu' ? 'admin@investaz.com' : username;
      const loginPassword = password === '18061999' ? '18061999' : password;
      
      console.log('🔐 Admin girişi başladılır...', {loginEmail});
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      
      const newToken = response.data.access_token;
      console.log('🔑 Token alındı:', newToken.substring(0, 20) + '...');
      
      // Set token first, then localStorage
      setToken(newToken);
      localStorage.setItem('admin_token', newToken);
      
      // Force login state immediately
      setIsLoggedIn(true);
      
      console.log('✅ Admin girişi uğurlu, panel yüklənir...');
      showNotification('✅ Admin panelinə daxil oldunuz', 'success');
      
      // Initialize admin panel after successful login
      setTimeout(() => {
        initializeAdminPanel();
      }, 100);
      
    } catch (error) {
      console.error('❌ Admin girişi xətası:', error);
      showNotification('❌ Yanlış istifadəçi adı və ya şifrə', 'error');
      
      // Clear any stored tokens on error
      localStorage.removeItem('admin_token');
      setToken(null);
      setIsLoggedIn(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsLoggedIn(false);
    setIsConnected(false);
    
    if (websocket) {
      websocket.close();
    }
    
    // Clear all data
    setUsers([]);
    setTransactions([]);
    setMessages([]);
    setNotifications([]);
    
    showNotification('👋 Admin paneldən çıxış edildi', 'info');
  };

  // Search users function
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
      showNotification(`🔍 ${response.data.users?.length || 0} nəticə tapıldı`, 'info');
    } catch (error) {
      console.error('Axtarış xətası:', error);
      showNotification('❌ Axtarış zamanı xəta baş verdi', 'error');
    }
  };

  // Approve transaction
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
      console.error('Əməliyyat təsdiqləmə xətası:', error);
      showNotification('❌ Əməliyyat zamanı xəta baş verdi', 'error');
    }
  };

  // Update user balance
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
      console.error('Balans yeniləmə xətası:', error);
      showNotification('❌ Balans yenilinərkən xəta baş verdi', 'error');
    }
  };

  // Reply to message
  const replyToMessage = async (messageId, content) => {
    if (!content.trim()) {
      showNotification('❌ Cavab boş ola bilməz', 'error');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/admin/messages/${messageId}/reply`, {
        content: content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReplyMessage('');
      setSelectedUser(null);
      fetchMessages();
      showNotification('✅ Cavab göndərildi', 'success');
      
      // Auto-scroll to see the new reply
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Cavab göndərmə xətası:', error);
      showNotification('❌ Cavab göndərilərkən xəta baş verdi', 'error');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Bu mesajı silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchMessages();
      showNotification('✅ Mesaj silindi', 'success');
    } catch (error) {
      console.error('Mesaj silmə xətası:', error);
      showNotification('❌ Mesaj silinərkən xəta baş verdi', 'error');
    }
  };

  // View receipt
  const viewReceipt = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/receipts/${filename}/base64`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentReceipt(response.data);
      setReceiptViewOpen(true);
    } catch (error) {
      console.error('Dekont görüntüləmə xətası:', error);
      showNotification('❌ Dekont görüntülənərkən xəta baş verdi', 'error');
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Filter data
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const userMessages = messages.filter(m => !m.is_from_admin);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Fixed notification area */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm" ref={notificationsRef}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-in slide-in-from-right ${
              notification.type === 'success' ? 'bg-green-900/90 border-green-400' :
              notification.type === 'error' ? 'bg-red-900/90 border-red-400' :
              notification.type === 'warning' ? 'bg-yellow-900/90 border-yellow-400' :
              notification.type === 'message' ? 'bg-blue-900/90 border-blue-400' :
              'bg-gray-900/90 border-gray-400'
            }`}
          >
            <div className="flex items-start space-x-2">
              <Bell className="w-4 h-4 mt-0.5 text-yellow-400 animate-pulse" />
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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">InvestAZ Admin Panel</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-400">
                {isConnected ? 'Real-vaxt bağlı' : 'Bağlantı kəsildi'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">
                Son yeniləmə: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <Button
              onClick={fetchAllData}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-yellow-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenilə
            </Button>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
          Çıxış
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-700 p-4 hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ümumi İstifadəçilər</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Aktiv Paketlər</p>
              <p className="text-2xl font-bold text-green-400">{stats.activePackages}</p>
            </div>
            <FileText className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4 hover:border-yellow-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gözləyən Əməliyyatlar</p>
              <p className="text-2xl font-bold text-yellow-400 animate-pulse">{stats.pendingTransactions}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4 hover:border-green-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Toplam Depozitlər</p>
              <p className="text-xl font-bold text-green-400">{formatAmount(stats.totalDeposits)} AZN</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4 hover:border-red-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Toplam Çıxarışlar</p>
              <p className="text-xl font-bold text-red-400">{formatAmount(stats.totalWithdrawals)} AZN</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Clock className="w-4 h-4 mr-2" />
            Əməliyyatlar ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <MessageCircle className="w-4 h-4 mr-2" />
            Mesajlar ({userMessages.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Users className="w-4 h-4 mr-2" />
            İstifadəçilər ({users.length})
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Search className="w-4 h-4 mr-2" />
            Axtarış
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 animate-pulse" />
                Gözləyən Əməliyyatlar ({pendingTransactions.length})
              </h2>
              <Button onClick={fetchTransactions} size="sm" variant="outline" className="border-blue-600 text-blue-400">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenilə
              </Button>
            </div>
            
            {pendingTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Gözləyən əməliyyat yoxdur</p>
                <p className="text-gray-500 text-sm mt-2">Yeni əməliyyatlar burada görünəcək</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingTransactions.map((transaction) => {
                  const user = users.find(u => u.id === transaction.user_id);
                  return (
                    <div key={transaction.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-yellow-400 hover:bg-gray-750 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge className={transaction.type === 'deposit' ? 'bg-green-600' : 'bg-blue-600'}>
                              {transaction.type === 'deposit' ? '💰 Depozit' : '🏦 Çıxarış'}
                            </Badge>
                            <span className="text-white font-bold text-lg">
                              {formatAmount(transaction.amount)} AZN
                            </span>
                            {user && (
                              <Badge variant="outline" className="border-purple-600 text-purple-400">
                                {user.user_code}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-400 space-y-1">
                            <p><strong>İstifadəçi:</strong> {user?.name || 'Naməlum'}</p>
                            <p><strong>Kart adı:</strong> {transaction.card_name}</p>
                            <p><strong>Kart:</strong> ****{transaction.card_number?.slice(-4)}</p>
                            <p><strong>Tarix:</strong> {new Date(transaction.created_date).toLocaleString()}</p>
                            {transaction.receipt_filename && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewReceipt(transaction.receipt_filename)}
                                className="mt-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Dekont Gör
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            onClick={() => approveTransaction(transaction.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Təsdiqlə
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveTransaction(transaction.id, false)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rədd Et
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Dəstək Mesajları ({userMessages.length})
              </h2>
              <Button onClick={fetchMessages} size="sm" variant="outline" className="border-green-600 text-green-400">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenilə
              </Button>
            </div>
            
            {userMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Mesaj yoxdur</p>
                <p className="text-gray-500 text-sm mt-2">Yeni mesajlar burada görünəcək</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userMessages.map((message) => {
                  const user = users.find(u => u.id === message.user_id);
                  const isSelected = selectedUser === message.id;
                  
                  return (
                    <div key={message.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-green-400 hover:bg-gray-750 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium text-lg">{user?.name || 'Naməlum'}</span>
                          {user && (
                            <Badge className="bg-purple-600">{user.user_code}</Badge>
                          )}
                          <Badge variant="outline" className="border-green-600 text-green-400">
                            Yeni Mesaj
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-gray-100">{message.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Cavabınızı yazın..."
                          value={isSelected ? replyMessage : ''}
                          onChange={(e) => {
                            if (isSelected) {
                              setReplyMessage(e.target.value);
                            }
                          }}
                          onFocus={() => {
                            setSelectedUser(message.id);
                            setReplyMessage('');
                          }}
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (replyMessage.trim()) {
                              replyToMessage(message.id, replyMessage);
                            }
                          }}
                          disabled={!replyMessage.trim() || !isSelected}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Cavab Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMessage(message.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Bütün İstifadəçilər ({users.length})
              </h2>
              <Button onClick={fetchUsers} size="sm" variant="outline" className="border-purple-600 text-purple-400">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenilə
              </Button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-blue-400 hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-white font-bold text-lg">{user.name}</h3>
                        <Badge className="bg-purple-600">{user.user_code}</Badge>
                        <Badge variant="outline" className="border-green-600 text-green-400">
                          Online
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Email: <span className="text-white">{user.email}</span></p>
                          <p className="text-gray-400">Qeydiyyat: <span className="text-white">{new Date(user.join_date).toLocaleDateString()}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-400">Balans: <span className="text-green-400 font-bold">{formatAmount(user.balance)} AZN</span></p>
                          <p className="text-gray-400">Ümumi investisiya: <span className="text-blue-400">{formatAmount(user.total_invested)} AZN</span></p>
                          <p className="text-gray-400">Ümumi qazanc: <span className="text-yellow-400">{formatAmount(user.total_earned)} AZN</span></p>
                        </div>
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
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
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
              <Button 
                onClick={searchUsers} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Axtar
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Axtarış nəticələri ({searchResults.length})
                </h3>
                {searchResults.map((user) => (
                  <div key={user.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-purple-400 hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-white font-bold text-lg">{user.name}</h3>
                          <Badge className="bg-purple-600">{user.user_code}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Email: <span className="text-white">{user.email}</span></p>
                            <p className="text-gray-400">Balans: <span className="text-green-400 font-bold">{formatAmount(user.balance)} AZN</span></p>
                          </div>
                          <div>
                            <p className="text-gray-400">Ümumi investisiya: <span className="text-blue-400">{formatAmount(user.total_invested)} AZN</span></p>
                            <p className="text-gray-400">Ümumi qazanc: <span className="text-yellow-400">{formatAmount(user.total_earned)} AZN</span></p>
                          </div>
                        </div>
                        
                        {user.active_package && (
                          <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                            <p className="text-yellow-400 font-medium mb-2">🏆 Aktiv Paket:</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p className="text-gray-300">Tip: <span className="text-white">{user.active_package.package_type}</span></p>
                              <p className="text-gray-300">İnvestisiya: <span className="text-green-400">{formatAmount(user.active_package.invested_amount)} AZN</span></p>
                            </div>
                          </div>
                        )}
                        
                        {user.recent_transactions && user.recent_transactions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-blue-400 font-medium mb-2">📊 Son Əməliyyatlar:</p>
                            <div className="space-y-1">
                              {user.recent_transactions.slice(0, 3).map((txn, idx) => (
                                <p key={idx} className="text-xs text-gray-400">
                                  {txn.type === 'deposit' ? '💰' : '🏦'} {formatAmount(txn.amount)} AZN - 
                                  <span className={txn.status === 'approved' ? 'text-green-400' : txn.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}>
                                    {' '}{txn.status}
                                  </span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBalanceEditUser(user);
                            setNewBalance(user.balance.toString());
                          }}
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
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
            <DialogTitle className="text-white text-lg">
              💰 {balanceEditUser?.name} - Balans Yenilə
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">Cari Balans</label>
              <p className="text-2xl font-bold text-green-400">
                {formatAmount(balanceEditUser?.balance || 0)} AZN
              </p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Yeni Balans</label>
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white text-lg"
                placeholder="Yeni balans daxil edin"
                step="0.01"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setBalanceEditUser(null)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-400"
              >
                Ləğv Et
              </Button>
              <Button
                onClick={() => updateUserBalance(balanceEditUser?.id, newBalance)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!newBalance || isNaN(parseFloat(newBalance))}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
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
            <DialogTitle className="text-white text-lg">📄 Dekont Görüntülə</DialogTitle>
          </DialogHeader>
          
          {currentReceipt && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Fayl adı: {currentReceipt.filename}</p>
                {currentReceipt.media_type.startsWith('image/') ? (
                  <img
                    src={currentReceipt.data_url}
                    alt="Receipt"
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-600 shadow-lg"
                  />
                ) : (
                  <div className="p-8 border border-gray-600 rounded-lg">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400 mb-4">PDF faylını görmək üçün aşağıdakı düyməni basın</p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.open(currentReceipt.data_url, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onLogin(username, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">InvestAZ</h1>
          <p className="text-gray-400">Admin Paneli</p>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mt-2"></div>
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
            disabled={loading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-3"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Daxil olunur...
              </div>
            ) : (
              'Daxil Ol'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminPanel;