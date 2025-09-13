// InvestAZ - Azərbaycan İnvestisiya Platforması Mock Data

// Azərbaycan adları - kişi
export const maleNames = [
  "Elvin", "Murad", "Arif", "Rəşad", "Elnur", "Tural", "Fərid", "Samir", 
  "Rauf", "Nijat", "Kamran", "Səməd", "Eldar", "Orxan", "Anar", "Nurlan", 
  "Hikmət", "Tahir", "Rəhman", "Vüsal", "Aydın", "Rəşit", "Fuad", "Zaur", 
  "Cavid", "Amin", "Kamal", "Sadiq", "Qabil", "Bəxtiyar", "Mahir", "Rufat", 
  "Zahid", "Səid", "Emin", "İlqar", "Ramin", "Ilkin", "Əli", "Qasım", 
  "Nicat", "Elçin", "Ruslan", "Emil", "Farid", "Kənan", "Məhəmməd", "Hüseyn"
];

// Azərbaycan adları - qadın
export const femaleNames = [
  "Səmra", "Aytac", "Sevil", "Aysel", "Nərmin", "Günel", "Ləman", "Havva", 
  "Nigar", "Zeynəb", "Aygün", "Könül", "Gülnar", "Rəna", "Məryəm", "Fəridə",
  "Lamiyə", "Gülay", "Şəbnəm", "Ülkər", "Səkinə", "Gülşən", "Nərgiz", "Vəfa",
  "Ləyla", "Xədicə", "Səbinə", "Gülçin", "Təranə", "Şəhla", "Zülfiyyə", "İradə",
  "Məhəbbət", "Gülşah", "Sevda", "Nilufer", "Reyhan", "Esmira", "Dilara", "Aysun"
];

// Soyad adları
export const lastNames = [
  "Məmmədov", "Hüseynov", "Əhmədov", "İsmayılov", "Rzayev", "Quliyev", 
  "Abbasov", "Səfərov", "Qasımov", "Səlimov", "Muradov", "Əlizadə", 
  "Hüseynli", "Rəhimov", "Təhməzli", "Süleymanov", "Cəfərov", "Xəlilov", 
  "İbrahimov", "Orucov", "Əkbərov", "Şükürov", "Babayev", "Qurbanov", 
  "Həsənov", "Mirzəyev", "Nəsirov", "Rəcəbov", "Hacıyev", "Məcidov"
];

// Bank adları
export const banks = [
  'ABB Bank',
  'Kapital Bank', 
  'UniBank',
  'Yelo Bank',
  'LeoBank'
];

// Yenilenmiş İnvestisiya Paketləri - Binalar
export const investmentPackages = [
  { 
    id: 1, 
    name: 'Yasamal Residences', 
    type: 'building',
    price: 500, 
    dailyProfit: 2.8, 
    duration: 30,
    color: '#8B4513',
    icon: '🏢'
  },
  { 
    id: 2, 
    name: 'Port Baku Towers', 
    type: 'building',
    price: 1200, 
    dailyProfit: 3.5, 
    duration: 45,
    color: '#CD853F',
    icon: '🏬'
  },
  { 
    id: 3, 
    name: 'Flame Towers View', 
    type: 'building',
    price: 2500, 
    dailyProfit: 4.2, 
    duration: 60,
    color: '#DAA520',
    icon: '🏘️'
  },
  { 
    id: 4, 
    name: 'White City Premium', 
    type: 'building',
    price: 5000, 
    dailyProfit: 5.5, 
    duration: 75,
    color: '#B8860B',
    icon: '🏙️'
  },
  { 
    id: 5, 
    name: 'Caspian Gold Plaza', 
    type: 'building',
    price: 10000, 
    dailyProfit: 7.0, 
    duration: 90,
    color: '#FFD700',
    icon: '🏛️'
  }
];

// Şirkət məlumatları
export const companyInfo = {
  name: "InvestAZ Limited",
  country: "Böyük Britanya",
  established: "2009",
  license: "FCA 789456123",
  experience: "15+ il təcrübə",
  achievements: [
    "2024-cü ildə 'Ən Yaxşı İnvestisiya Platforması' mükafatı",
    "500,000+ məmnun müştəri",
    "Bloomberg və Reuters-də xəbər çıxışları",
    "ISO 27001 Təhlükəsizlik Sertifikatı"
  ]
};

// Utility functions
export function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatAmount(amount) {
  return amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Generate random name
export function generateRandomName() {
  const isMale = Math.random() > 0.5;
  const firstName = isMale ? maleNames[rnd(0, maleNames.length - 1)] : femaleNames[rnd(0, femaleNames.length - 1)];
  const lastName = lastNames[rnd(0, lastNames.length - 1)];
  return `${firstName} ${lastName.charAt(0)}.`;
}

// Generate random transaction
export function generateRandomTransaction() {
  const types = ['deposit', 'withdraw'];
  const type = types[rnd(0, 1)];
  
  // Yenilenmiş məbləğ aralıqları
  const amount = type === 'withdraw' 
    ? rnd(1000, 5000)  // Çıxarış: 1000-5000 AZN
    : rnd(50, 2000);   // Depozit: 50-2000 AZN
    
  const bank = banks[rnd(0, banks.length - 1)];
  
  return {
    id: Date.now() + Math.random(),
    type,
    name: generateRandomName(),
    amount,
    bank,
    timestamp: new Date().toISOString()
  };
}

// Generate membership registration
export function generateMembershipActivity() {
  return {
    id: Date.now() + Math.random(),
    type: 'membership',
    name: generateRandomName(),
    action: 'qeydiyyatdan keçdi',
    timestamp: new Date().toISOString()
  };
}

// Initial user stats
export const initialStats = {
  totalUsers: 2547832,
  activeUsers: 89543,
  dailyTransactions: 15687,
  newMembers: 324
};