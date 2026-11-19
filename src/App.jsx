import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShieldCheck, Wallet, Zap, QrCode, CheckCircle2, Search, ChevronDown, Bell, Activity, Truck, Lock, Users, FileText, ShieldAlert, Power, UserCheck, Plus } from 'lucide-react';
import DeliveryMap from './components/DeliveryMap';

export default function App() {
  const [role, setRole] = useState('Platform Admin');
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [toast, setToast] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [driverBalance, setDriverBalance] = useState(64.50);

  // Dynamic Users Pool (Persisted in LocalStorage)
  const initialUsersPool = JSON.parse(localStorage.getItem('microtip_users_pool')) || [
    { fullName: 'Alex Thompson', role: 'Platform Admin', walletAddress: '0x71C2...39A2', vehicleType: 'EV Scooter' },
    { fullName: 'Rahul Kumar', role: 'Driver', walletAddress: '0x8A1B...92C1', vehicleType: 'Delivery Bicycle' },
    { fullName: 'Priya Sharma', role: 'Consumer', walletAddress: '0x3F4E...11B9', vehicleType: 'N/A' }
  ];
  const [usersPool, setUsersPool] = useState(initialUsersPool);

  // Active User Profile State
  const savedActiveUser = JSON.parse(localStorage.getItem('microtip_active_user')) || initialUsersPool[0];
  const [userProfile, setUserProfile] = useState(savedActiveUser);

  // Dynamic Fleet State with GPS Coords for Map rendering
  const initialFleet = JSON.parse(localStorage.getItem('microtip_drivers')) || [
    { name: 'Alex Thompson', vehicle: 'EV Scooter', wallet: '0x71C...39A2', status: 'Online', coords: [18.5210, 73.8572] },
    { name: 'Rahul Kumar', vehicle: 'Delivery Bicycle', wallet: '0x8A1...92C1', status: 'Online', coords: [18.5225, 73.8540] }
  ];
  const [driversList, setDriversList] = useState(initialFleet);

  const initialSpoofCount = parseInt(localStorage.getItem('microtip_spoof_count')) || 18902;
  const [spoofCount, setSpoofCount] = useState(initialSpoofCount);

  const initialOrdersCount = parseInt(localStorage.getItem('microtip_orders_count')) || 389;
  const [ordersCount, setOrdersCount] = useState(initialOrdersCount);

  const savedTransactions = JSON.parse(localStorage.getItem('microtip_txs')) || [
    { id: "5137333", time: "16:13:28", driver: "Jion", amount: "$7.00", status: "Settled", speed: "1.2s" },
    { id: "2229256", time: "16:12:30", driver: "Kloop", amount: "$3.00", status: "Settled", speed: "1.2s" },
    { id: "7028199", time: "16:11:35", driver: "Piyush", amount: "$5.00", status: "Settled", speed: "1.2s" }
  ];

  const [transactions, setTransactions] = useState(savedTransactions);

  // Dynamic Analytics Calculations
  const activeTxSum = transactions.reduce((acc, tx) => acc + (parseFloat(tx.amount.replace('$', '')) || 0), 0);
  const realTimeTipsPaid = 145000.00 + activeTxSum;
  const totalEscrowVolume = 4200000.00 + (activeTxSum * 12);
  const avgSpeed = (transactions.reduce((acc, tx) => acc + (parseFloat(tx.speed) || 1.2), 0) / (transactions.length || 1)).toFixed(1);

  const onlineDriversCount = driversList.filter(d => d.status === 'Online').length;

  const tipTrendChartData = [
    { time: "10:00", volume: 450 },
    { time: "12:00", volume: 1200 },
    { time: "14:00", volume: 890 },
    { time: "16:00", volume: 1650 + Math.round(activeTxSum * 10) },
    { time: "18:00", volume: 2400 + Math.round(activeTxSum * 15) },
  ];

  const settlementSpeedChartData = [
    { time: "10:00", speed: 180 },
    { time: "12:00", speed: 250 },
    { time: "14:00", speed: 120 },
    { time: "16:00", speed: 310 },
    { time: "18:00", speed: 140 },
  ];

  const [tipAmount, setTipAmount] = useState(3.0);
  const [handshakeState, setHandshakeState] = useState('idle');
  
  const customerCoords = [18.5204, 73.8567];
  const [driverCoords, setDriverCoords] = useState([18.5299, 73.8662]); // Starts ~950m away (inside 2km)

  const currentDistanceMeters = Math.abs(driverCoords[0] - customerCoords[0]) * 100000;
  const isWithinGeofence = currentDistanceMeters <= 2000;

  const triggerToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch Active User from Dropdown Selection
  const switchUser = (user) => {
    setUserProfile(user);
    setRole(user.role);
    localStorage.setItem('microtip_active_user', JSON.stringify(user));
    setIsUserMenuOpen(false);
    triggerToast(`Switched active profile to ${user.fullName} (${user.role})`);
  };

  // Handle Onboarding New User Form
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedRole = formData.get('role');
    const name = formData.get('fullName');
    const vehicle = formData.get('vehicleType') || 'N/A';
    
    const randomWallet = '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('') + '...';

    const newUser = {
      fullName: name,
      role: selectedRole,
      walletAddress: randomWallet,
      vehicleType: vehicle
    };

    // Save to users pool
    const updatedPool = [newUser, ...usersPool];
    setUsersPool(updatedPool);
    localStorage.setItem('microtip_users_pool', JSON.stringify(updatedPool));

    // Set as active profile
    setUserProfile(newUser);
    setRole(selectedRole);
    localStorage.setItem('microtip_active_user', JSON.stringify(newUser));

    // Append to fleet if role is Driver
    if (selectedRole === 'Driver') {
      const randomLat = 18.5204 + (Math.random() - 0.5) * 0.01;
      const randomLng = 73.8567 + (Math.random() - 0.5) * 0.01;
      const newDriver = { name, vehicle, wallet: randomWallet, status: 'Online', coords: [randomLat, randomLng] };
      const updatedDrivers = [...driversList, newDriver];
      setDriversList(updatedDrivers);
      localStorage.setItem('microtip_drivers', JSON.stringify(updatedDrivers));
    }

    setIsProfileModalOpen(false);
    triggerToast(`🎉 Onboarded & selected new ${selectedRole}: ${name}`);
  };

  const toggleDriverStatus = (index) => {
    const updated = [...driversList];
    updated[index].status = updated[index].status === 'Online' ? 'Offline' : 'Online';
    setDriversList(updated);
    localStorage.setItem('microtip_drivers', JSON.stringify(updated));
    triggerToast(`Driver ${updated[index].name} is now ${updated[index].status}`);
  };

  const triggerHandshake = () => {
    const distanceMeters = Math.abs(driverCoords[0] - customerCoords[0]) * 100000;
    if (distanceMeters > 2000) {
      triggerSpoofingAttack();
      return;
    }

    setHandshakeState('scanning');
    setDriverCoords([18.52041, 73.85671]); 
    
    setTimeout(() => {
      setHandshakeState('verified');
      setDriverBalance((prev) => prev + tipAmount);

      setOrdersCount((prev) => {
        const nextOrders = prev + 1;
        localStorage.setItem('microtip_orders_count', nextOrders);
        return nextOrders;
      });

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const txId = Math.floor(1000000 + Math.random() * 9000000).toString();

      const newTx = {
        id: txId,
        time: timeStr,
        driver: userProfile.fullName || "Alex Thompson",
        amount: `$${tipAmount.toFixed(2)}`,
        status: "Settled",
        speed: "1.2s"
      };

      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('microtip_txs', JSON.stringify(updatedTxs));

      triggerToast(`⚡ Escrow Released! $${tipAmount.toFixed(2)} USDC payout verified via ECDSA on Polygon.`);
    }, 1500);
  };

  const triggerSpoofingAttack = () => {
    setDriverCoords([18.5550, 73.8900]); // Moves marker outside 2km geofence
    setHandshakeState('idle');

    setSpoofCount((prev) => {
      const updated = prev + 1;
      localStorage.setItem('microtip_spoof_count', updated);
      return updated;
    });

    triggerToast("🚨 Anti-Spoofing Triggered: Geofence mismatch (>2km limit). ECDSA Signature Rejected!", true);
  };

  const tabs = ['Dashboard', 'Logistics', 'Escrow', 'Drivers', 'Reports', 'Security'];

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans p-6">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center pb-6 border-b border-slate-800/80 gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400 fill-amber-400" />
            <span className="text-xl font-bold tracking-wider text-amber-400">MicroTip</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {tabs.map((tab) => (
              <span
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer transition-all ${
                  activeTab === tab
                    ? 'text-amber-400 border-b-2 border-amber-400 pb-1 font-semibold'
                    : 'hover:text-slate-200'
                }`}
              >
                {tab}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              {role} <ChevronDown className="h-3 w-3" />
            </button>

            {isRoleOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
                {['Platform Admin', 'Driver', 'Consumer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setIsRoleOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-amber-500 hover:text-slate-950 font-medium transition-colors cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive User Switcher & Profile Widget */}
          <div className="relative border-l border-slate-800 pl-4">
            <div 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-900/80 transition-all border border-transparent hover:border-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-400">
                {userProfile.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{userProfile.fullName}</p>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500">{userProfile.role} • {userProfile.walletAddress}</p>
              </div>
            </div>

            {/* Profile Selection Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
                <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Profile</span>
                  <button 
                    onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}
                    className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded flex items-center gap-1 font-semibold"
                  >
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60">
                  {usersPool.map((u, idx) => (
                    <button
                      key={idx}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors ${
                        userProfile.fullName === u.fullName ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-200">{u.fullName}</p>
                        <p className="text-[10px] text-slate-500">{u.role} • {u.walletAddress}</p>
                      </div>
                      {userProfile.fullName === u.fullName && (
                        <UserCheck className="h-4 w-4 text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto mt-6">
        {/* DASHBOARD TAB */}
        {activeTab === 'Dashboard' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
              {role === 'Platform Admin' && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={triggerSpoofingAttack}
                    className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    🚨 Test Anti-Spoofing Defense
                  </button>
                  <span className="bg-slate-900 border border-slate-800 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
                    ONLINE DRIVERS: {onlineDriversCount} / {driversList.length}
                  </span>
                  <span className="bg-slate-900 border border-slate-800 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
                    ORDERS: {ordersCount}
                  </span>
                </div>
              )}
            </div>

            {role === 'Platform Admin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#121824] border border-emerald-500/20 p-5 rounded-xl text-left">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Total Escrow Volume</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-slate-100">
                        ${totalEscrowVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+18.7%</span>
                    </div>
                  </div>

                  <div className="bg-[#121824] border border-amber-500/20 p-5 rounded-xl text-left">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Real-Time Tip Volume</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-slate-100">
                        ${realTimeTipsPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">+12.4%</span>
                    </div>
                  </div>

                  <div className="bg-[#121824] border border-emerald-500/20 p-5 rounded-xl text-left">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Avg Settlement Speed</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-slate-100">{avgSpeed}s</span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">-0.3s</span>
                    </div>
                  </div>

                  <div className="bg-[#121824] border border-rose-500/20 p-5 rounded-xl text-left">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Spoofing Attacks Prevented</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-slate-100">{spoofCount.toLocaleString()}</span>
                      <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">+25%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl">
                      <h2 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-4">Tip Volume Trend (24h)</h2>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={tipTrendChartData}>
                            <defs>
                              <linearGradient id="tipGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0d1117', borderColor: '#334155' }} />
                            <Area type="monotone" dataKey="volume" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#tipGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl">
                      <h2 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-4">Settlement Speed (ms)</h2>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={settlementSpeedChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0d1117', borderColor: '#334155' }} />
                            <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">Live Drivers: Pune</h2>
                        <span className="text-[10px] text-slate-400">2km Geofence Active</span>
                      </div>
                      <DeliveryMap 
                        customerCoords={customerCoords} 
                        driversList={driversList} 
                        activeDriverCoords={driverCoords} 
                        isVerified={isWithinGeofence} 
                      />
                    </div>

                    <div className="bg-[#121824] border border-slate-800 p-5 rounded-xl">
                      <h2 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-4">Latest Transactions</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-medium">
                              <th className="pb-2">ID</th>
                              <th className="pb-2">Time</th>
                              <th className="pb-2">Driver</th>
                              <th className="pb-2">Amount</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2">Speed</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 text-slate-300">
                            {transactions.map((tx, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/40">
                                <td className="py-2.5 font-mono text-slate-400">{tx.id}</td>
                                <td className="py-2.5">{tx.time}</td>
                                <td className="py-2.5 font-medium">{tx.driver}</td>
                                <td className="py-2.5 text-amber-400 font-semibold">{tx.amount}</td>
                                <td className="py-2.5">
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-emerald-400">{tx.speed}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'Consumer' && (
              <div className="max-w-xl mx-auto bg-[#121824] border border-slate-800 p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold">🛒 Active Order #ORD-8921</h2>
                
                <DeliveryMap 
                  customerCoords={customerCoords} 
                  driversList={driversList} 
                  activeDriverCoords={driverCoords} 
                  isVerified={isWithinGeofence} 
                />

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Simulate Driver Proximity (GPS Geofence)</span>
                    <span className={`font-mono font-bold ${isWithinGeofence ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentDistanceMeters.toFixed(1)} meters away ({isWithinGeofence ? 'Inside 2km' : 'Outside 2km'})
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="50"
                    value={Math.round(currentDistanceMeters)}
                    onChange={(e) => {
                      const distanceMeters = parseFloat(e.target.value);
                      const offset = distanceMeters / 100000;
                      setDriverCoords([customerCoords[0] + offset, customerCoords[1] + offset]);
                      setHandshakeState('idle');
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <label className="text-sm text-slate-400 block mb-2 text-left">Add Direct Driver Tip (Escrow Locked)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xl font-bold text-amber-400">${tipAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={triggerHandshake}
                  disabled={handshakeState === 'scanning'}
                  className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isWithinGeofence 
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                      : 'bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300'
                  }`}
                >
                  {handshakeState === 'idle' && <><QrCode className="h-5 w-5" /> Scan Driver Handshake QR</>}
                  {handshakeState === 'scanning' && <Activity className="h-5 w-5 animate-spin" />}
                  {handshakeState === 'verified' && <><CheckCircle2 className="h-5 w-5" /> Handshake Verified!</>}
                </button>
              </div>
            )}

            {role === 'Driver' && (
              <div className="max-w-xl mx-auto bg-[#121824] border border-slate-800 p-8 rounded-2xl space-y-6 text-center">
                <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                  <Wallet className="h-8 w-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold">Driver Earnings Hub</h2>
                <div className="text-4xl font-extrabold text-emerald-400">${driverBalance.toFixed(2)} USDC</div>
                
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-4">SHOW CODE TO CONSUMER UPON ARRIVAL</span>
                  <div className="bg-white p-4 rounded-xl">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MICROTIP:ORD-8921"
                      alt="Ephemeral Proximity QR Code"
                      className="w-44 h-44"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* LOGISTICS TAB */}
        {activeTab === 'Logistics' && (
          <div className="bg-[#121824] border border-slate-800 p-6 rounded-2xl space-y-6 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Truck className="h-6 w-6 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">Active Delivery Logistics</h2>
            </div>
            <DeliveryMap 
              customerCoords={customerCoords} 
              driversList={driversList} 
              activeDriverCoords={driverCoords} 
              isVerified={isWithinGeofence} 
            />
          </div>
        )}

        {/* DRIVERS TAB */}
        {activeTab === 'Drivers' && (
          <div className="bg-[#121824] border border-slate-800 p-6 rounded-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-slate-100">Active Delivery Fleet</h2>
              </div>
              <span className="text-xs text-slate-400">
                Active Online: <strong className="text-emerald-400">{onlineDriversCount}</strong> / {driversList.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driversList.map((driver, index) => (
                <div key={index} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">{driver.name}</p>
                    <p className="text-xs text-slate-400">{driver.vehicle} • {driver.wallet}</p>
                  </div>

                  <button
                    onClick={() => toggleDriverStatus(index)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      driver.status === 'Online'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {driver.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESCROW TAB */}
        {activeTab === 'Escrow' && (
          <div className="bg-[#121824] border border-slate-800 p-6 rounded-2xl space-y-6 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Lock className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">Smart Contract Escrow Vault</h2>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <p className="text-slate-400">Contract Address: <span className="text-amber-400">0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063</span></p>
              <p className="text-slate-400">Network: <span className="text-emerald-400">Polygon Amoy Testnet (Chain ID: 80002)</span></p>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'Security' && (
          <div className="bg-[#121824] border border-slate-800 p-6 rounded-2xl space-y-6 text-left">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
              <h2 className="text-xl font-bold text-slate-100">Anti-Spoofing & ECDSA Security Engine</h2>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Haversine Geofence Engine</span>
                <span className="text-emerald-400">Operational (2km Threshold)</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-left">
            <h2 className="text-base font-bold text-slate-100 mb-4">MicroTip User Onboarding</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input name="fullName" required placeholder="e.g. Rahul Sharma" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Role</label>
                <select name="role" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200">
                  <option value="Consumer">Consumer</option>
                  <option value="Driver">Driver</option>
                  <option value="Platform Admin">Platform Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Vehicle Type</label>
                <input name="vehicleType" placeholder="e.g. Ather EV" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="w-1/2 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg">Cancel</button>
                <button type="submit" className="w-1/2 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg">Onboard & Activate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[3000] px-5 py-3 rounded-xl border text-xs font-medium backdrop-blur-md shadow-2xl ${toast.isError ? 'bg-rose-950/90 border-rose-500/40 text-rose-300' : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'}`}>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}