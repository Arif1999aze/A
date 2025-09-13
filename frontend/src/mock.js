// Mock data for Demo Investment Platform

// Investment packages
export const packagesData = [
  {id: 1, name: 'Bina A', price: 20},
  {id: 2, name: 'Bina B', price: 50},
  {id: 3, name: 'Bina C', price: 70},
  {id: 4, name: 'Bina D', price: 90},
  {id: 5, name: 'Bina E', price: 110},
  {id: 6, name: 'Villa F', price: 140},
  {id: 7, name: 'Villa G', price: 150},
  {id: 8, name: 'Kompleks H', price: 180},
  {id: 9, name: 'Kompleks I', price: 200},
  {id: 10, name: 'Premium J', price: 250},
];

// Banks for demo transactions
export const banks = [
  'Kapital Bank',
  'ABB',
  'UniBank',
  'PAŞA Bank',
  'AccessBank',
  'Xalq Bank',
  'Beynəlxalq Bank',
  'Turkiye Bank',
  'Express Bank',
  'Premium Bank'
];

// Azerbaijani first names
export const firstNames = [
  "Elvin", "Murad", "Arif", "Rəşad", "Elnur", "Tural", "Fərid", "Samir", 
  "Rauf", "Nijat", "Kamran", "Səməd", "Eldar", "Orxan", "Anar", "Nurlan", 
  "Hikmət", "Tahir", "Rəhman", "Vüsal", "Aydın", "Rəşit", "Fuad", "Zaur", 
  "Cavid", "Amin", "Kamal", "Sadiq", "Qabil", "Bəxtiyar", "Mahir", "Rufat", 
  "Zahid", "Səid", "Emin", "İlqar", "Ramin", "Ilkin", "Əli", "Qasım", 
  "Nicat", "Elçin", "Səmra", "Aytac", "Sevil", "Aysel", "Nərmin", "Günel", 
  "Ləman", "Havva", "Nigar", "Zeynəb", "Aygün"
];

// Azerbaijani last names
export const lastNames = [
  "Məmmədov", "Hüseynov", "Əhmədov", "İsmayılov", "Rzayev", "Quliyev", 
  "Abbasov", "Səfərov", "Qasımov", "Səlimov", "Muradov", "Əlizadə", 
  "Hüseynli", "Rəhimov", "Təhməzli", "Süleymanov", "Cəfərov", "Xəlilov", 
  "İbrahimov", "Orucov", "Əkbərov", "Şükürov", "Babayev", "Qurbanov", 
  "Həsənov", "Mirzəyev", "Nəsirov", "Rəcəbov", "Hacıyev", "Məcidov", 
  "Zeynalov", "Nuriyev", "Əsgərov", "Yusifov"
];

// Utility functions
export function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatAmount(amount) {
  return (Math.round(amount * 100) / 100).toFixed(2);
}

// Generate unique full names
export function generateUniqueNames(count) {
  const set = new Set();
  const names = [];
  let attempts = 0;
  
  while (names.length < count && attempts < 10000) {
    attempts++;
    const fn = firstNames[rnd(0, firstNames.length - 1)];
    const ln = lastNames[rnd(0, lastNames.length - 1)];
    const full = `${fn} ${ln}`;
    
    if (!set.has(full)) {
      set.add(full);
      names.push(full);
    }
  }
  
  return names;
}

// Get multiplier based on package index
export function getMultiplier(index) {
  if (index < 5) return 3;
  if (index < 8) return 4;
  if (index === 8) return 5;
  return 6;
}

// Generate demo transactions
export function generateDemoTransactions(count = 100) {
  const names = generateUniqueNames(count);
  const transactions = [];
  const now = Date.now();
  
  for (let i = 0; i < names.length; i++) {
    const bank = banks[rnd(0, banks.length - 1)];
    const amounts = [20, 50, 70, 90, 100, 140, 150, 180, 200, 250, 300, 350, 400, 500, 700, 1000];
    const amount = amounts[rnd(0, amounts.length - 1)] || rnd(20, 1000);
    const timestamp = new Date(now - rnd(0, 30 * 24 * 3600 * 1000) - i * 1000 * 60).toISOString();
    
    transactions.push({
      id: `demo-${i}-${Date.now()}`,
      type: 'DEMO Withdraw',
      label: `${bank} çıxarışı`,
      amount: -amount,
      name: names[i],
      bank,
      note: 'DEMO çıxarış',
      timestamp
    });
  }
  
  return transactions.reverse();
}

// Initial mock state
export const initialState = {
  user: null,
  balance: 0,
  investments: [],
  transactions: []
};