import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  packagesData, 
  generateDemoTransactions, 
  getMultiplier, 
  formatAmount,
  initialState 
} from '../mock';

const DemoInvestPage = () => {
  const [state, setState] = useState(initialState);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', code: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Load state from localStorage on component mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('demo_invest_state');
      if (savedState) {
        setState(JSON.parse(savedState));
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }, []);

  // Save state to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('demo_invest_state', JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [state]);

  // Generate demo transactions if empty
  useEffect(() => {
    if (state.user && (!state.transactions || state.transactions.length < 100)) {
      const demoTxns = generateDemoTransactions(100);
      setState(prev => ({
        ...prev,
        transactions: demoTxns.concat(prev.transactions || [])
      }));
    }
  }, [state.user]);

  const handleLogin = () => {
    if (!loginForm.username.trim() || !loginForm.code.trim()) {
      alert('İstifadəçi və kod daxil edin.');
      return;
    }

    setState(prev => ({
      ...prev,
      user: { username: loginForm.username, code: loginForm.code },
      balance: prev.balance === 0 ? 500 : prev.balance // Demo starting balance
    }));

    setLoginOpen(false);
    setLoginForm({ username: '', code: '' });
  };

  const buyPackage = (pkgId) => {
    if (!state.user) {
      alert('Zəhmət olmasa əvvəlcə demo hesabla daxil olun.');
      return;
    }

    const pkg = packagesData.find(x => x.id === pkgId);
    if (!pkg) return;

    if (state.balance < pkg.price) {
      alert('Balansda kifayət qədər vəsait yoxdur. Demo balansı artırmaq üçün "Test depozit" et.');
      return;
    }

    const idx = packagesData.findIndex(x => x.id === pkgId);
    const mult = getMultiplier(idx);

    setState(prev => ({
      ...prev,
      balance: prev.balance - pkg.price,
      investments: [...prev.investments, {
        id: Date.now(),
        pkgId,
        price: pkg.price,
        multiplier: mult,
        freq: 'monthly',
        created: new Date().toISOString()
      }],
      transactions: [{
        id: Date.now() + Math.random(),
        type: 'DEMO Invest',
        label: `${pkg.name} - DEMO`,
        amount: -pkg.price,
        name: prev.user.username || 'Demo User',
        note: 'DEMO invest',
        timestamp: new Date().toISOString()
      }, ...prev.transactions]
    }));

    alert(`Paket alındı (demo). Proqnozlaşdırılmış gəlir: ${pkg.price * mult} AZN (x${mult}).`);
  };

  const handleWithdraw = () => {
    if (!state.user) {
      alert('Daxil olun.');
      return;
    }

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Düzgün məbləğ yaz.');
      return;
    }

    if (amt > state.balance) {
      alert('Balansda kifayət qədər vəsait yoxdur.');
      return;
    }

    setState(prev => ({
      ...prev,
      balance: prev.balance - amt,
      transactions: [{
        id: Date.now() + Math.random(),
        type: 'DEMO Withdraw',
        label: 'İstifadəçi çıxarışı - DEMO',
        amount: -amt,
        name: prev.user.username || 'Demo User',
        note: 'DEMO çıxarış',
        timestamp: new Date().toISOString()
      }, ...prev.transactions]
    }));

    setWithdrawAmount('');
    alert('Çıxarış (demo) uğurla qeyd edildi.');
  };

  const handleSupport = () => {
    if (!state.user) {
      alert('Daxil olun ki, demo chat aktivləşsin.');
      return;
    }

    const question = prompt('Demo dəstək: sualınızı yazın (bu yalnız nümayişdir):');
    if (question) {
      alert('Demo: mesajınız qeydə alındı (real göndərilmir).');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071025] to-[#0b1a2b] text-[#e6eef6]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 px-8">
        <div className="font-bold text-lg tracking-wide">
          Demo Invest <span className="text-sm font-normal text-[#97a0b3]">— NÜMUNƏ (100 demo çıxarış)</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-lg">
            <div className="text-sm text-[#97a0b3]">Balans (AZN)</div>
            <div className="font-extrabold text-lg">{formatAmount(state.balance)}</div>
          </div>
          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1f7a8c] hover:bg-[#1a6b7a] text-[#051019] font-bold">
                Giriş / Demo Hesab
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#06111a] border-[rgba(255,255,255,0.1)] max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-[#e6eef6]">Demo Giriş</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-[#97a0b3]">
                  Hər hansı istifadəçi adı və kodla demo hesab aça bilərsiniz.
                </p>
                <Input
                  placeholder="İstifadəçi adı"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-transparent border-[rgba(255,255,255,0.05)] text-[#e6eef6]"
                />
                <Input
                  placeholder="Kod"
                  type="password"
                  value={loginForm.code}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, code: e.target.value }))}
                  className="bg-transparent border-[rgba(255,255,255,0.05)] text-[#e6eef6]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleLogin} className="bg-[#1f7a8c] hover:bg-[#1a6b7a] text-[#051019] font-bold">
                    Daxil ol
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setLoginOpen(false)}
                    className="bg-transparent border-[rgba(255,255,255,0.04)] text-[#cfe7ef] hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    Bağla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Column - Packages and Investments */}
        <div className="flex-[1.6] space-y-6">
          <Card className="bg-[#0b1220] border-[rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold">Populyar Paketlər</h2>
              <Badge className="bg-[rgba(255,255,255,0.06)] text-[#ffd27f] hover:bg-[rgba(255,255,255,0.08)]">
                DEMO
              </Badge>
            </div>
            <p className="text-sm text-[#97a0b3] mb-6">
              Aşağıdan paket seçib nümunə investisiya edə bilərsiniz. Bütün məlumatlar *demo* məqsədlidir və real investisiya təklifi deyil.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {packagesData.map((pkg, i) => {
                const mult = getMultiplier(i);
                return (
                  <div 
                    key={pkg.id}
                    className="p-4 rounded-lg bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent hover:from-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">{pkg.name}</div>
                        <div className="text-sm text-[#97a0b3]">
                          Qiymət: {pkg.price} AZN · Gəlir x{mult}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{pkg.price} AZN</div>
                        <div className="mt-2">
                          <Button 
                            onClick={() => buyPackage(pkg.id)}
                            size="sm"
                            className="bg-[#1f7a8c] hover:bg-[#1a6b7a] text-[#051019] font-bold"
                          >
                            Al
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-[#0b1220] border-[rgba(255,255,255,0.1)] p-6">
            <h2 className="text-lg font-semibold mb-4">Sənin Investisiyalar</h2>
            <div className="max-h-80 overflow-auto space-y-3">
              {state.investments.length === 0 ? (
                <p className="text-sm text-[#97a0b3]">Heç bir investisiya yoxdur.</p>
              ) : (
                state.investments.map(inv => {
                  const pkg = packagesData.find(p => p.id === inv.pkgId);
                  return (
                    <div key={inv.id} className="flex justify-between items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                      <div>
                        <div className="font-bold">
                          {pkg.name} <span className="text-sm text-[#97a0b3]">· DEMO</span>
                        </div>
                        <div className="text-sm text-[#97a0b3]">
                          Alındı: {new Date(inv.created).toLocaleString()} · Gəlir x{inv.multiplier}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold">{inv.price} AZN</div>
                        <div className="text-sm text-[#97a0b3]">
                          Proqnoz: {inv.price * inv.multiplier} AZN
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Operations and Transactions */}
        <div className="flex-1 space-y-6">
          <Card className="bg-[#0b1220] border-[rgba(255,255,255,0.1)] p-6">
            <h2 className="text-lg font-semibold mb-4">Əməliyyatlar və Çıxarış</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm text-[#97a0b3] block mb-2">Çıxarış məbləği (AZN)</label>
                <Input
                  placeholder="Məbləği daxil et"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-transparent border-[rgba(255,255,255,0.05)] text-[#e6eef6]"
                />
              </div>
              <Button 
                onClick={handleWithdraw}
                className="bg-[#1f7a8c] hover:bg-[#1a6b7a] text-[#051019] font-bold"
              >
                Çıxarış et (Demo)
              </Button>
            </div>
          </Card>

          <Card className="bg-[#0b1220] border-[rgba(255,255,255,0.1)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold">Demo Tranzaksiyalar</h2>
              <span className="text-xs text-[#97a0b3]">— 100 avtomatik nümunə çıxarış</span>
            </div>
            <div className="max-h-80 overflow-auto space-y-2">
              {(!state.transactions || state.transactions.length === 0) ? (
                <p className="text-sm text-[#97a0b3]">Heç bir əməliyyat yoxdur.</p>
              ) : (
                state.transactions.slice(0, 50).map(txn => (
                  <div key={txn.id} className="flex justify-between items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                    <div>
                      <div className="font-bold text-sm">
                        {txn.name} · <span className="text-[#97a0b3]">{txn.bank || txn.label}</span>
                      </div>
                      <div className="text-xs text-[#97a0b3]">
                        {new Date(txn.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm">
                        {txn.amount > 0 ? '+' : ''}{formatAmount(txn.amount)} AZN
                      </div>
                      <div className="text-xs text-[#97a0b3] flex items-center gap-1">
                        {txn.note} 
                        <Badge className="bg-[rgba(255,255,255,0.06)] text-[#ffd27f] text-xs">DEMO</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-[linear-gradient(90deg,rgba(31,122,140,0.08),rgba(255,255,255,0.01))] border-[rgba(255,255,255,0.1)] p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">Dəstək</div>
                <div className="text-sm text-[#97a0b3]">Suallarınız üçün demo chat.</div>
              </div>
              <Button 
                onClick={handleSupport}
                className="bg-[#1f7a8c] hover:bg-[#1a6b7a] text-[#051019] font-bold"
              >
                Mesaj yaz
              </Button>
            </div>
          </Card>

          <Card className="bg-[#3b1b1b] border-[rgba(255,210,210,0.2)] p-4">
            <div className="font-bold text-[#ffd2d2] mb-2">Qanuni Açıqlama</div>
            <p className="text-sm text-[#ffd2d2]">
              Bu səhifədə göstərilən bütün əməliyyatlar <strong>nümunə/demo</strong> məlumatlardır. 
              Heç bir real şəxsin və ya real bank əməliyyatının əks etdirilməsi nəzərdə tutulmur. 
              Real istifadə və təqdim üçün qanuni məsləhətləşmə və KYC tələb olunur.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-xs text-[#97a0b3]">
        Demo Invest — yalnız nümunə. Heç bir real investisiya təklifi deyil.
      </footer>
    </div>
  );
};

export default DemoInvestPage;