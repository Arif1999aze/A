import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, DollarSign, MessageCircle, CheckCircle, XCircle, Clock, Eye, FileText, Search, Edit, Trash2, RefreshCw, Bell, AlertCircle, TrendingUp, Activity, LogOut } from 'lucide-react';
import axios from 'axios';

// Format amount function
const formatAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
  return amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Use environment variable for API URL - always use backend URL from .env
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  // State management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  
  // Data states  
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activePackages: 0
  });
  
  // UI states
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [balanceEditUser, setBalanceEditUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Real-time states
  const [websocket, setWebsocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Refs
  const notificationsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const refreshInterval = useRef(null);

  // Initialize on component mount
  useEffect(() => {
    initializeApp();
    return () => {
      cleanup();
    };
  }, []);

  // Initialize application
  const initializeApp = async () => {
    console.log('🚀 Admin panel başladılır...');
    setLoading(true);
    
    try {
      // Check for existing token
      const savedToken = localStorage.getItem('admin_token');
      if (savedToken) {
        console.log('🔑 Saxlanılmış token tapıldı');
        await validateAndSetToken(savedToken);
      } else {
        console.log('📝 Token tapılmadı, login lazımdır');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Başlatma xətası:', error);
      setLoading(false);
    }
  };

  // Validate and set token
  const validateAndSetToken = async (tokenToValidate) => {
    try {
      // Test token validity by making a request
      const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${tokenToValidate}` }
      });
      
      console.log('✅ Token etibarlıdır');
      setToken(tokenToValidate);
      setIsLoggedIn(true);
      
      // Start admin panel
      await startAdminPanel();
      
    } catch (error) {
      console.error('❌ Token etibarsızdır:', error);
      localStorage.removeItem('admin_token');
      setToken(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Start admin panel
  const startAdminPanel = async () => {
    console.log('📊 Admin panel məlumatları yüklənir...');
    
    try {
      // Load all data
      await Promise.all([
        fetchStats(),
        fetchUsers(), 
        fetchTransactions(),
        fetchMessages()
      ]);
      
      // Setup WebSocket
      setupWebSocket();
      
      // Start auto-refresh
      startAutoRefresh();
      
      showNotification('✅ Admin panel hazırdır', 'success');
      console.log('✅ Admin panel tam yükləndi');
      
    } catch (error) {
      console.error('❌ Panel başlatma xətası:', error);
      showNotification('❌ Məlumat yükləmə xətası', 'error');
    }
  };

  // Handle login
  const handleLogin = async (username, password) => {
    setLoginError('');
    setLoading(true);
    
    try {
      console.log('🔐 Admin girişi başladılır:', { username, apiUrl: API_BASE_URL });
      
      // Check credentials
      if (username !== 'batuhan' || password !== '18061999') {
        throw new Error('Yanlış istifadəçi adı və ya şifrə');
      }
      
      // Make API call with admin credentials
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'admin@investaz.com',
        password: '18061999'
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Token alınmadı');
      }
      
      const newToken = response.data.access_token;
      console.log('🔑 Token uğurla alındı');
      
      // Save token
      localStorage.setItem('admin_token', newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      
      // Start admin panel
      await startAdminPanel();
      
      showNotification('✅ Uğurla daxil oldunuz', 'success');
      
    } catch (error) {
      console.error('❌ Giriş xətası:', error);
      
      let errorMessage = 'Giriş xətası';
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Server ilə bağlantı xətası. Zəhmət olmasa bir qədər sonra cəhd edin.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Yanlış istifadəçi adı və ya şifrə';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server xətası. Zəhmət olmasa bir qədər sonra cəhd edin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      showNotification(`❌ ${errorMessage}`, 'error');
      
      // Clear any stored tokens on error
      localStorage.removeItem('admin_token');
      setToken(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('👋 Çıxış edilir...');
    
    // Clean up
    cleanup();
    
    // Clear states
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsLoggedIn(false);
    setUsers([]);
    setTransactions([]);
    setMessages([]);
    setNotifications([]);
    setStats({
      totalUsers: 0,
      pendingTransactions: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      activePackages: 0
    });
    
    showNotification('👋 Çıxış edildi', 'info');
  };

  // Cleanup function
  const cleanup = () => {
    // Close WebSocket
    if (websocket) {
      websocket.close();
      setWebsocket(null);
      setIsConnected(false);
    }
    
    // Clear intervals
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  };

  // Setup WebSocket
  const setupWebSocket = () => {
    try {
      const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/admin`;
      console.log('🔌 WebSocket bağlantısı:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket bağlandı');
        setIsConnected(true);
        showNotification('🔗 Real-vaxt bağlantı aktiv', 'success');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (e) {
          console.log('📨 WebSocket mətn:', event.data);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket xətası:', error);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket bağlantısı kəsildi');
        setIsConnected(false);
        
        // Reconnect after 5 seconds if logged in
        if (isLoggedIn) {
          setTimeout(() => {
            setupWebSocket();
          }, 5000);
        }
      };
      
      setWebsocket(ws);
      
    } catch (error) {
      console.error('❌ WebSocket qurma xətası:', error);
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    console.log('📨 WebSocket mesajı:', data);
    
    switch (data.type) {
      case 'new_user_registration':
        showNotification(`🎉 Yeni qeydiyyat: ${data.user_name}`, 'info');
        fetchUsers();
        fetchStats();
        break;
        
      case 'package_purchase':
        showNotification(`📦 Yeni paket: ${data.user_name}`, 'info');
        fetchUsers();
        fetchStats();
        break;
        
      case 'new_transaction':
        showNotification(`💰 Yeni əməliyyat: ${formatAmount(data.amount)} AZN`, 'warning');
        fetchTransactions();
        fetchStats();
        break;
        
      case 'new_message':
        showNotification(`💬 Yeni mesaj: ${data.user_name}`, 'message');
        fetchMessages();
        break;
        
      default:
        console.log('🔄 Bilinməyən mesaj tipi, məlumatlar yenilənir');
        refreshAllData();
        break;
    }
  };

  // Check for new notifications
  const checkForNewNotifications = () => {
    // Simulate checking for new admin notifications
    const notificationTypes = [
      { type: 'info', message: '💰 Yeni depozit sorğusu var' },
      { type: 'warning', message: '🏦 Çıxarış təsdiq gözləyir' },
      { type: 'message', message: '📩 Yeni dəstək mesajı' },
      { type: 'info', message: '📦 Yeni paket alımı' }
    ];
    
    // Randomly add notifications (simulate real-time)
    if (Math.random() > 0.95 && notifications.length < 5) { // 5% chance, max 5 notifications
      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      showNotification(randomNotification.message, randomNotification.type);
    }
  };

  // Start enhanced auto-refresh every 3 seconds for admin panel (more aggressive)
  const startAutoRefresh = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    
    refreshInterval.current = setInterval(() => {
      if (isLoggedIn && isConnected) {
        console.log('🔄 Admin panel hızlı yenilənir...');
        refreshAllData();
        
        // Also check for new notifications
        if (notifications.length < 10) { // Prevent spam
          checkForNewNotifications();
        }
      }
    }, 3000); // Every 3 seconds (enhanced speed)
  };
  
  // Page visibility refresh for admin panel
  useEffect(() => {
    const handleAdminVisibilityChange = () => {
      if (!document.hidden && isLoggedIn) {
        console.log('👁️ Admin panel görünür, məlumatlar yenilənir...');
        refreshAllData();
      }
    };

    document.addEventListener('visibilitychange', handleAdminVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleAdminVisibilityChange);
  }, [isLoggedIn]);

  // Refresh all data
  const refreshAllData = async () => {
    setLastRefresh(new Date());
    
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchTransactions(), 
        fetchMessages()
      ]);
    } catch (error) {
      console.error('❌ Məlumat yeniləmə xətası:', error);
    }
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
    } catch (error) {
      console.error('Mesajlar xətası:', error);
    }
  };

  // Action functions
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
      showNotification(`🔍 ${response.data.users?.length || 0} nəticə`, 'info');
    } catch (error) {
      console.error('Axtarış xətası:', error);
      showNotification('❌ Axtarış xətası', 'error');
    }
  };

  const approveTransaction = async (transactionId, approve) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/transactions/approve`, {
        transaction_id: transactionId,
        approve: approve,
        admin_notes: approve ? 'Təsdiqləndi' : 'Rədd edildi'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchTransactions();
      fetchStats();
      showNotification(`✅ Əməliyyat ${approve ? 'təsdiqləndi' : 'rədd edildi'}`, 'success');
    } catch (error) {
      console.error('Təsdiqləmə xətası:', error);
      showNotification('❌ Əməliyyat xətası', 'error');
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
      showNotification('✅ Balans yeniləndi', 'success');
    } catch (error) {
      console.error('Balans xətası:', error);
      showNotification('❌ Balans yeniləmə xətası', 'error');
    }
  };

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
    } catch (error) {
      console.error('Cavab xətası:', error);
      showNotification('❌ Cavab göndərmə xətası', 'error');
    }
  };

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
      console.error('Silmə xətası:', error);
      showNotification('❌ Mesaj silmə xətası', 'error');
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
      console.error('Dekont xətası:', error);
      showNotification('❌ Dekont görüntüləmə xətası', 'error');
    }
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white mb-2">InvestAZ Admin Panel</h2>
          <p className="text-gray-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} error={loginError} loading={loading} />;
  }

  // Filter data
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const userMessages = messages.filter(m => !m.is_from_admin);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right ${
              notification.type === 'success' ? 'bg-green-900/90 border-green-400' :
              notification.type === 'error' ? 'bg-red-900/90 border-red-400' :
              notification.type === 'warning' ? 'bg-yellow-900/90 border-yellow-400' :
              notification.type === 'message' ? 'bg-blue-900/90 border-blue-400' :
              'bg-gray-900/90 border-gray-400'
            }`}
          >
            <div className="flex items-start space-x-2">
              <Bell className="w-4 h-4 mt-0.5 text-yellow-400" />
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
              onClick={refreshAllData}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-yellow-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenilə
            </Button>
          </div>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Çıxış
        </Button>
      </div>

      {/* Real-time Notifications Panel */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <Card className="bg-gray-900 border-yellow-600 p-4">
            <div className="flex items-center mb-3">
              <Bell className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-bold text-yellow-400">Canlı Bildirimlər</h3>
              <Badge className="ml-2 bg-yellow-600">{notifications.length}</Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 rounded border-l-4 text-sm ${
                    notification.type === 'info' ? 'bg-blue-900/30 border-blue-400 text-blue-300' :
                    notification.type === 'warning' ? 'bg-yellow-900/30 border-yellow-400 text-yellow-300' :
                    notification.type === 'message' ? 'bg-green-900/30 border-green-400 text-green-300' :
                    'bg-gray-800/50 border-gray-600 text-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{notification.message}</span>
                    <span className="text-xs opacity-70">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">İstifadəçilər</p>
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
              <p className="text-2xl font-bold text-yellow-400">{pendingTransactions.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Depozitlər</p>
              <p className="text-xl font-bold text-green-400">{formatAmount(stats.totalDeposits)} AZN</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Çıxarışlar</p>
              <p className="text-xl font-bold text-red-400">{formatAmount(stats.totalWithdrawals)} AZN</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <AlertCircle className="w-4 h-4 mr-2" />
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
              <h2 className="text-xl font-bold text-yellow-400">
                Gözləyən Əməliyyatlar ({pendingTransactions.length})
              </h2>
              <Button onClick={fetchTransactions} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenilə
              </Button>
            </div>
            
            {pendingTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Gözləyən əməliyyat yoxdur</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTransactions.map((transaction) => {
                  const user = users.find(u => u.id === transaction.user_id);
                  return (
                    <div key={transaction.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-yellow-400">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={transaction.type === 'deposit' ? 'bg-green-600' : 'bg-blue-600'}>
                              {transaction.type === 'deposit' ? 'Depozit' : 'Çıxarış'}
                            </Badge>
                            <span className="text-white font-bold">
                              {formatAmount(transaction.amount)} AZN
                            </span>
                            {user && (
                              <Badge variant="outline" className="border-purple-600 text-purple-400">
                                {user.user_code}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-400 space-y-1">
                            <p>İstifadəçi: {user?.name || 'Naməlum'}</p>
                            <p>Kart: {transaction.card_name} - ****{transaction.card_number?.slice(-4)}</p>
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
              <h2 className="text-xl font-bold text-yellow-400">
                Dəstək Mesajları ({userMessages.length})
              </h2>
              <Button onClick={fetchMessages} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenilə
              </Button>
            </div>
            
            {userMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Mesaj yoxdur</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userMessages.map((message) => {
                  const user = users.find(u => u.id === message.user_id);
                  const isSelected = selectedUser === message.id;
                  
                  return (
                    <div key={message.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-green-400">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium">{user?.name || 'Naməlum'}</span>
                          {user && (
                            <Badge className="bg-purple-600">{user.user_code}</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_date).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="bg-gray-700 rounded p-3 mb-3">
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
                <div ref={messagesEndRef} />
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">
                İstifadəçilər ({users.length})
              </h2>
              <Button onClick={fetchUsers} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenilə
              </Button>
            </div>
            
            <div className="space-y-4">
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
                        <p>İnvestisiya: {formatAmount(user.total_invested)} AZN</p>
                        <p>Qazanc: {formatAmount(user.total_earned)} AZN</p>
                        <p>Qeydiyyat: {new Date(user.join_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
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
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">İstifadəçi Axtarışı</h2>
            
            <div className="flex space-x-2 mb-6">
              <Input
                placeholder="AZ kodu və ya ad..."
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
                <h3 className="text-white font-medium">Nəticələr ({searchResults.length})</h3>
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
                          <p>İnvestisiya: {formatAmount(user.total_invested)} AZN</p>
                          <p>Qazanc: {formatAmount(user.total_earned)} AZN</p>
                        </div>
                      </div>
                      
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
                placeholder="Yeni balans"
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
                <p className="text-gray-400 mb-4">Fayl: {currentReceipt.filename}</p>
                {currentReceipt.media_type.startsWith('image/') ? (
                  <img
                    src={currentReceipt.data_url}
                    alt="Receipt"
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-600"
                  />
                ) : (
                  <div className="p-8 border border-gray-600 rounded-lg">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400 mb-4">PDF faylı</p>
                    <Button
                      onClick={() => window.open(currentReceipt.data_url, '_blank')}
                    >
                      PDF Aç
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
const AdminLogin = ({ onLogin, error, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">InvestAZ</h1>
          <p className="text-gray-400">Admin Paneli</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        
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
              placeholder="batuhan"
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
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
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
        
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            Demostrativ məlumat: batuhan / 18061999
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;