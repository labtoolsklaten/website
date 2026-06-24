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

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

function HomePage() {
  const [showPayment, setShowPayment] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [detailImgIdx, setDetailImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('info');
  const [customerName, setCustomerName] = useState('');
  const [customerWA, setCustomerWA] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [activeTab, setActiveTab] = useState('links');
  const [storeView, setStoreView] = useState('grid');
  const [userData, setUserData] = useState(null);
  const [orderComplete, setOrderComplete] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const location = useLocation();

  // Ultra-robust detection for current app root
  const getAppRoot = () => {
    let path = window.location.pathname;
    // Remove /admin or /index.html suffix to find the "dist" folder or app root
    const root = path.split('/admin')[0].split('/index.html')[0].replace(/\/$/, '');
    return root || '';
  };

  const APP_ROOT = getAppRoot();
  const API_BASE = APP_ROOT + '/api/manage.php';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}?action=get_data`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setUserData(data);
        } catch (jsonErr) {
          console.error("Invalid JSON response:", text);
          throw new Error(`Format data salah. Awalan: ${text.substring(0, 50)}...`);
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setUserData({
          name: "Koneksi Bermasalah",
          bio: `${err.message}`,
          links: [],
          products: []
        });
      }
    };
    fetchData();
  }, [API_BASE]);

  const handleCreateOrder = async (product, method) => {
    if (!customerName || !customerWA || !customerEmail) {
      alert("Lengkapi data Anda terlebih dahulu");
      return;
    }

    if (isCreatingOrder) return;
    setIsCreatingOrder(true);

    try {
      const response = await fetch(`${API_BASE}?action=create_order`, {
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
          qrisUrl: userData.paymentSettings.qrisUrl,
          paypalUrl: userData.paymentSettings.paypalUrl
        });
      }
    } catch (err) {
      alert("Gagal memproses pesanan");
    } finally {
      setIsCreatingOrder(false);
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
          display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--glass-bg)',
          border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
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
        <button onClick={() => setActiveTab('links')} className={`btn-primary ${activeTab === 'links' ? '' : 'glass-card'}`} style={{ background: activeTab === 'links' ? 'var(--primary)' : 'transparent', color: activeTab === 'links' ? 'white' : 'var(--text-main)' }}>Informasi</button>
        <button onClick={() => setActiveTab('store')} className={`btn-primary ${activeTab === 'store' ? '' : 'glass-card'}`} style={{ background: activeTab === 'store' ? 'var(--primary)' : 'transparent', color: activeTab === 'store' ? 'white' : 'var(--text-main)' }}>Katalog Produk</button>

        {activeTab === 'store' && (
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', padding: '4px', background: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '10px' }}>
            <button onClick={() => setStoreView('grid')} style={{ padding: '6px', background: storeView === 'grid' ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: '6px', color: storeView === 'grid' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setStoreView('list')} style={{ padding: '6px', background: storeView === 'list' ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: '6px', color: storeView === 'list' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
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
            {userData.products?.map(product => {
              const allImages = [product.image, ...(product.images || [])].filter(Boolean);
              return (
                <div key={product.id}
                  className={`glass-card product-card ${storeView === 'grid' ? 'grid-item' : 'list-item'}`}
                  style={storeView === 'list' ? { display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px', gap: '16px', cursor: 'pointer' } : { cursor: 'pointer' }}
                  onClick={() => { setShowDetail(product); setDetailImgIdx(0); }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={product.image} alt={product.name} className="product-image" style={storeView === 'list' ? { width: '60px', height: '60px', borderRadius: '10px', marginBottom: 0 } : {}} />
                    {allImages.length > 1 && storeView === 'grid' && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '20px', padding: '2px 8px', fontSize: '0.7rem', color: 'white' }}>
                        +{allImages.length - 1}
                      </div>
                    )}
                  </div>
                  <div className="product-info" style={storeView === 'list' ? { flex: 1, textAlign: 'left', marginBottom: 0 } : {}}>
                    <h3 style={{ fontSize: storeView === 'list' ? '0.9rem' : '1rem', marginBottom: '2px' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: storeView === 'list' ? 'none' : 'block' }}>
                      {product.description?.length > 60 ? product.description.substring(0, 60) + '...' : product.description}
                    </p>
                    <div className="price-tag">Rp {product.price.toLocaleString('id-ID')}</div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ padding: storeView === 'list' ? '8px 12px' : '8px 16px', fontSize: '0.8rem', width: storeView === 'grid' ? '100%' : 'auto', flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); setShowDetail(product); setDetailImgIdx(0); }}
                  >
                    Detail
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PRODUCT DETAIL MODAL ===== */}
      <AnimatePresence>
        {showDetail && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { if (!lightboxOpen) setShowDetail(null); }}
          >
            <motion.div
              className="glass-card modal-content"
              initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}
              style={{ padding: 0, overflow: 'hidden', maxWidth: '520px' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{showDetail.name}</h2>
                <button onClick={() => setShowDetail(null)} className="close-btn" style={{ position: 'static', transform: 'none', color: 'var(--text-main)' }}><X size={20} /></button>
              </div>

              <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px' }}>
                {/* Image Gallery */}
                {(() => {
                  const imgs = [showDetail.image, ...(showDetail.images || [])].filter(Boolean);
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      {/* Main Image */}
                      <div
                        style={{ width: '100%', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', cursor: 'zoom-in', marginBottom: '10px', position: 'relative' }}
                        onClick={() => setLightboxOpen(true)}
                      >
                        <img src={imgs[detailImgIdx] || showDetail.image} alt={showDetail.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.7rem', color: 'white' }}>
                          🔍 Klik untuk zoom
                        </div>
                      </div>
                      {/* Thumbnail Strip */}
                      {imgs.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                          {imgs.map((img, i) => (
                            <div key={i}
                              onClick={() => setDetailImgIdx(i)}
                              style={{
                                width: '60px', height: '60px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden',
                                border: detailImgIdx === i ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', transition: 'border 0.2s'
                              }}
                            >
                              <img src={img} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* YouTube Preview */}
                {showDetail.youtubeUrl && getYoutubeEmbedUrl(showDetail.youtubeUrl) && (
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', background: 'rgba(0,0,0,0.3)' }}>
                    <iframe width="100%" height="100%" src={getYoutubeEmbedUrl(showDetail.youtubeUrl)}
                      title="Preview" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                )}

                {/* Info */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>
                      Rp {showDetail.price.toLocaleString('id-ID')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 10px', border: '1px solid var(--card-border)', borderRadius: '20px' }}>
                      Produk Digital
                    </div>
                  </div>
                  {showDetail.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      {showDetail.description}
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => { setShowDetail(null); setShowPayment(showDetail); setCheckoutStep('info'); }}
                >
                  Beli Sekarang <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== LIGHTBOX ===== */}
      <AnimatePresence>
        {lightboxOpen && showDetail && (() => {
          const imgs = [showDetail.image, ...(showDetail.images || [])].filter(Boolean);
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}
              onClick={() => setLightboxOpen(false)}
            >
              <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={22} />
              </button>
              <motion.img
                key={detailImgIdx}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                src={imgs[detailImgIdx]} alt="zoom"
                style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain' }}
                onClick={e => e.stopPropagation()}
              />
              {imgs.length > 1 && (
                <div style={{ display: 'flex', gap: '12px' }} onClick={e => e.stopPropagation()}>
                  {imgs.map((img, i) => (
                    <div key={i} onClick={() => setDetailImgIdx(i)}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: detailImgIdx === i ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                    >
                      <img src={img} alt={`lb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ===== CHECKOUT / PAYMENT MODAL ===== */}
      <AnimatePresence>
        {showPayment && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-card modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <button onClick={() => { setShowPayment(null); setOrderComplete(null); }} className="close-btn"><X size={20} /></button>

              {!orderComplete ? (
                <>
                  <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Detail Pesanan</h2>
                  <p style={{ marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>{showPayment.name}</p>

                  {/* YouTube Preview */}
                  {showPayment.youtubeUrl && getYoutubeEmbedUrl(showPayment.youtubeUrl) && (
                    <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', background: 'rgba(0,0,0,0.2)' }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(showPayment.youtubeUrl)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {/* Multiple Images Gallery */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
                    <img src={showPayment.image} alt={showPayment.name} style={{ height: '120px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    {showPayment.images?.map((img, i) => img && (
                      <img key={i} src={img} alt={`${showPayment.name} ${i + 1}`} style={{ height: '120px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    ))}
                  </div>

                  <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', fontStyle: 'italic' }}>{showPayment.description}</p>

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
                      <button 
                        className="glass-card payment-method" 
                        onClick={() => handleCreateOrder(showPayment, 'manual')}
                        disabled={isCreatingOrder}
                        style={{ opacity: isCreatingOrder ? 0.6 : 1, cursor: isCreatingOrder ? 'not-allowed' : 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}
                      >
                        <Building size={24} color="#6366f1" />
                        <div>
                          <div style={{ fontWeight: '600' }}>{isCreatingOrder ? 'Memproses...' : 'Transfer Bank'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Konfirmasi Manual</div>
                        </div>
                      </button>
                      <button 
                        className="glass-card payment-method" 
                        onClick={() => handleCreateOrder(showPayment, 'qris')}
                        disabled={isCreatingOrder}
                        style={{ opacity: isCreatingOrder ? 0.6 : 1, cursor: isCreatingOrder ? 'not-allowed' : 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}
                      >
                        <QrCode size={24} color="#a855f7" />
                        <div>
                          <div style={{ fontWeight: '600' }}>{isCreatingOrder ? 'Memproses...' : 'QRIS'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan QR Code</div>
                        </div>
                      </button>
                      {userData?.paymentSettings?.paypalUrl && (
                        <button 
                          className="glass-card payment-method" 
                          onClick={() => handleCreateOrder(showPayment, 'paypal')}
                          disabled={isCreatingOrder}
                          style={{ opacity: isCreatingOrder ? 0.6 : 1, cursor: isCreatingOrder ? 'not-allowed' : 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}
                        >
                          <CreditCard size={24} color="#3b82f6" />
                          <div>
                            <div style={{ fontWeight: '600' }}>{isCreatingOrder ? 'Memproses...' : 'PayPal'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Bayar via PayPal</div>
                          </div>
                        </button>
                      )}
                      <button disabled={isCreatingOrder} onClick={() => setCheckoutStep('info')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: isCreatingOrder ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: isCreatingOrder ? 0.5 : 1 }}>← Edit Informasi</button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                  <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                  <h2 style={{ marginBottom: '12px' }}>Pesanan Terkirim!</h2>
                  
                  <div style={{ marginBottom: '20px', padding: '12px 20px', background: 'var(--glass-bg)', borderRadius: '12px', display: 'inline-block', border: '1px solid var(--card-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Kode Pesanan</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.3rem', letterSpacing: '1.5px' }}>{orderComplete.id}</span>
                      <CopyButton text={orderComplete.id} label="" />
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', textAlign: 'left', marginBottom: '16px', border: '1px solid var(--primary)' }}>
                    {orderComplete.method === 'qris' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Silakan Scan QRIS di bawah:</div>
                        <img src={orderComplete.qrisUrl} alt="QRIS" style={{ width: '200px', height: '200px', borderRadius: '12px', marginBottom: '16px', background: 'white', padding: '10px' }} />
                        <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--primary)' }}>
                          Rp {orderComplete.amount.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ) : orderComplete.method === 'paypal' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Silakan Lakukan Pembayaran ke PayPal:</div>
                        <a href={orderComplete.paypalUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px', marginBottom: '16px', textDecoration: 'none' }}>
                            Bayar via PayPal
                        </a>
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
                          <CopyButton text={orderComplete.bank?.split(' - ')[1]?.split(' (')[0] || orderComplete.bank} label="" />
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{orderComplete.bank}</div>
                      </>
                    )}
                  </div>

                  <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '8px', padding: '12px', marginBottom: '24px', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.85rem', color: '#facc15', margin: 0, lineHeight: '1.5' }}>
                      ⚠️ <strong>PENTING:</strong> Wajib cantumkan kode pesanan <strong>{orderComplete.id}</strong> pada berita transfer bank agar pembayaran Anda lebih cepat ditemukan dan diverifikasi oleh admin.
                    </p>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.4' }}>
                    Informasi selengkapnya akan kami kirim ke <strong>{orderComplete.whatsapp}</strong>
                  </p>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setShowPayment(null); setOrderComplete(null); }}>Tutup</button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .admin-input { width: 100%; padding: 12px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; color: var(--text-main); font-family: inherit; }
        .admin-input::placeholder { color: var(--text-muted); opacity: 0.7; }
      `}</style>
    </div >
  );
}

function AdminWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const getAppRoot = () => {
    let path = window.location.pathname;
    const root = path.split('/admin')[0].split('/index.html')[0].replace(/\/$/, '');
    return root || '';
  };
  const APP_ROOT = getAppRoot();
  const API_BASE = APP_ROOT + '/api/manage.php';

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${API_BASE}?action=get_data`)
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(err => console.error("Admin fetch error:", err));
    }
  }, [isLoggedIn, API_BASE]);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('admin_token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}?action=logout`);
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!isLoggedIn) return <Login onLoginSuccess={handleLoginSuccess} />;
  if (!userData) return <div className="loader-container"><div className="loader"></div></div>;

  return <Admin initialData={userData} onLogout={handleLogout} onSave={(newData) => setUserData(newData)} />;
}

function App() {
  const getAppRoot = () => {
    let path = window.location.pathname;
    const root = path.split('/admin')[0].split('/index.html')[0].replace(/\/$/, '');
    return root || '';
  };
  const basename = getAppRoot();

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
