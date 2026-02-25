import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Link as LinkIcon,
  ChevronRight,
  X,
  CreditCard,
  QrCode,
  Building,
  ArrowRight,
  CheckCircle,
  User as UserIcon,
  MessageCircle,
  Phone,
  Copy,
  Check,
  Mail as MailIcon,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Admin from './Admin';
import Login from './Login';

function HomePage() {
  const [showPayment, setShowPayment] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('info');
  const [customerName, setCustomerName] = useState('');
  const [customerWA, setCustomerWA] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [activeTab, setActiveTab] = useState('links');
  const [storeView, setStoreView] = useState('grid');
  const [userData, setUserData] = useState(null);
  const [orderComplete, setOrderComplete] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./api/manage.php?action=get_data');
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  const handleCreateOrder = async (product, method) => {
    if (!customerName || !customerWA || !customerEmail) {
      alert("Lengkapi data Anda terlebih dahulu");
      return;
    }

    try {
      const response = await fetch('./api/manage.php?action=create_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerName,
          whatsapp: customerWA,
          email: customerEmail,
          product_id: product.id,
          product_name: product.name,
          amount: product.price,
          method: method
        })
      });
      const result = await response.json();

      if (result.status === 'success') {
        setOrderComplete({
          ...result.order,
          bank: userData.paymentSettings.bank,
          qrisUrl: userData.paymentSettings.qrisUrl
        });
      }
    } catch (err) {
      alert("Gagal memproses pesanan");
    }
  };

  const CopyButton = ({ text, label }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button
        onClick={handleCopy}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)',
          border: 'none', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
        }}
      >
        {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
        {copied ? 'Copied!' : `Copy ${label}`}
      </button>
    );
  };

  if (!userData) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <motion.div className="profile-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <img src={userData.avatar} alt={userData.name} className="avatar" />
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{userData.name}</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>{userData.bio}</p>
      </motion.div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => setActiveTab('links')} className={`btn-primary ${activeTab === 'links' ? '' : 'glass-card'}`} style={{ background: activeTab === 'links' ? '' : 'transparent' }}>Links</button>
        <button onClick={() => setActiveTab('store')} className={`btn-primary ${activeTab === 'store' ? '' : 'glass-card'}`} style={{ background: activeTab === 'store' ? '' : 'transparent' }}>Store</button>

        {activeTab === 'store' && (
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
            <button onClick={() => setStoreView('grid')} style={{ padding: '6px', background: storeView === 'grid' ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setStoreView('list')} style={{ padding: '6px', background: storeView === 'list' ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <List size={16} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'links' ? (
          <motion.div key="links" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {userData.links?.map(link => (
              <a key={link.id} href={link.url} className="glass-card link-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <LinkIcon size={20} color="var(--primary)" />
                  <span>{link.title}</span>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" />
              </a>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={storeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={storeView === 'grid' ? "product-grid" : "product-list"}
          >
            {userData.products?.map(product => (
              <div key={product.id} className={`glass-card product-card ${storeView === 'grid' ? 'grid-item' : 'list-item'}`} style={storeView === 'list' ? { display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px', gap: '16px' } : {}}>
                <img src={product.image} alt={product.name} className="product-image" style={storeView === 'list' ? { width: '60px', height: '60px', borderRadius: '10px', marginBottom: 0 } : {}} />
                <div className="product-info" style={storeView === 'list' ? { flex: 1, textAlign: 'left', marginBottom: 0 } : {}}>
                  <h3 style={{ fontSize: storeView === 'list' ? '0.9rem' : '1rem', marginBottom: '2px' }}>{product.name}</h3>
                  <div className="price-tag">Rp {product.price.toLocaleString('id-ID')}</div>
                </div>
                <button className="btn-primary" style={{ padding: storeView === 'list' ? '8px 12px' : '8px 16px', fontSize: '0.8rem', width: storeView === 'grid' ? '100%' : 'auto' }} onClick={() => { setShowPayment(product); setCheckoutStep('info'); }}>Beli</button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayment && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-card modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <button onClick={() => { setShowPayment(null); setOrderComplete(null); }} className="close-btn"><X size={20} /></button>

              {!orderComplete ? (
                <>
                  <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Detail Pesanan</h2>
                  <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>{showPayment.name}</p>

                  {checkoutStep === 'info' ? (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="admin-input-group" style={{ position: 'relative' }}>
                        <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="admin-input" style={{ paddingLeft: '40px' }} placeholder="Nama Anda" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                      </div>
                      <div className="admin-input-group" style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="admin-input" style={{ paddingLeft: '40px' }} placeholder="Nomor WhatsApp" value={customerWA} onChange={e => setCustomerWA(e.target.value)} />
                      </div>
                      <div className="admin-input-group" style={{ position: 'relative' }}>
                        <MailIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="admin-input" style={{ paddingLeft: '40px' }} placeholder="Alamat Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                      </div>
                      <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => { if (customerName && customerWA && customerEmail) setCheckoutStep('method') }}>
                        Lanjut ke Pembayaran <ArrowRight size={18} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button className="glass-card payment-method" onClick={() => handleCreateOrder(showPayment, 'manual')}>
                        <Building size={24} color="#6366f1" /><div><div style={{ fontWeight: '600' }}>Transfer Bank</div><div style={{ fontSize: '0.8rem' }}>Konfirmasi Manual</div></div>
                      </button>
                      <button className="glass-card payment-method" onClick={() => handleCreateOrder(showPayment, 'qris')}>
                        <QrCode size={24} color="#a855f7" /><div><div style={{ fontWeight: '600' }}>QRIS</div><div style={{ fontSize: '0.8rem' }}>Scan QR Code</div></div>
                      </button>
                      <button onClick={() => setCheckoutStep('info')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '8px' }}>← Edit Informasi</button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                  <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ marginBottom: '4px' }}>Pesanan Terkirim!</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>ID: {orderComplete.id}</p>

                  <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', textAlign: 'left', marginBottom: '20px', border: '1px solid var(--primary)' }}>
                    {orderComplete.method === 'qris' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Silakan Scan QRIS di bawah:</div>
                        <img src={orderComplete.qrisUrl} alt="QRIS" style={{ width: '200px', height: '200px', borderRadius: '12px', marginBottom: '16px', background: 'white', padding: '10px' }} />
                        <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--primary)' }}>
                          Rp {orderComplete.amount.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Total Bayar:</span>
                          <CopyButton text={orderComplete.amount.toString()} label="Nominal" />
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '16px' }}>
                          Rp {orderComplete.amount.toLocaleString('id-ID')}
                        </div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}></div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Rekening:</span>
                          <CopyButton text={orderComplete.bank.split(' - ')[1]?.split(' (')[0] || orderComplete.bank} label="" />
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{orderComplete.bank}</div>
                      </>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.4' }}>
                    Konfirmasi pembayaran akan kami kirim ke <strong>{orderComplete.whatsapp}</strong>
                  </p>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setShowPayment(null); setOrderComplete(null); }}>Tutup</button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .admin-input { width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-family: inherit; }
      `}</style>
    </div>
  );
}

function AdminWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetch('./api/manage.php?action=get_data')
        .then(res => res.json())
        .then(data => setUserData(data));
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('admin_token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await fetch('./api/manage.php?action=logout');
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!isLoggedIn) return <Login onLoginSuccess={handleLoginSuccess} />;
  if (!userData) return <div className="loader-container"><div className="loader"></div></div>;

  return <Admin initialData={userData} onLogout={handleLogout} onSave={(newData) => setUserData(newData)} />;
}

function App() {
  return (
    <BrowserRouter basename="/katalog/dist/">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
