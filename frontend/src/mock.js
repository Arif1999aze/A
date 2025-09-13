// Yeni Investisiya Platforması - Mock Data

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

// İnvestisiya paketləri
export const investmentPackages = [
  { id: 1, name: 'Başlanğic Paket', minAmount: 50, maxAmount: 500, dailyProfit: 2.5, duration: 30 },
  { id: 2, name: 'Standart Paket', minAmount: 500, maxAmount: 2000, dailyProfit: 3.5, duration: 45 },
  { id: 3, name: 'Premium Paket', minAmount: 2000, maxAmount: 10000, dailyProfit: 4.5, duration: 60 },
  { id: 4, name: 'VIP Paket', minAmount: 10000, maxAmount: 50000, dailyProfit: 6.0, duration: 90 }
];

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
  const amount = rnd(100, 5000);
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

// Initial user stats
export const initialStats = {
  totalUsers: 2547832,
  activeUsers: 89543,
  dailyTransactions: 15687
};