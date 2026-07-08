import React, { useState, useEffect } from 'react';
import {
    Save,
    Plus,
    Trash2,
    ArrowLeft,
    LogOut,
    User,
    CreditCard,
    Package,
    ExternalLink,
    ClipboardList,
    CheckCircle,
    MessageCircle,
    Upload,
    Mail,
    QrCode
} from 'lucide-react';
import { motion } from 'framer-motion';

function Admin({ initialData, onLogout, onSave }) {
    const [data, setData] = useState(initialData);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeAdminTab, setActiveAdminTab] = useState('profile');
    const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');
    const [orderFilterMonth, setOrderFilterMonth] = useState('');

    // Dynamic API Base URL
    const API_BASE = window.location.pathname.startsWith('/katalog/dist')
        ? '/katalog/dist/api/manage.php'
        : '/api/manage.php';

    const handleUpload = async (file, callback) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${API_BASE}?action=upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.status === 'success') {
                callback(result.url);
            } else {
                alert('Upload gagal: ' + result.message);
            }
        } catch (err) {
            alert('Terjadi kesalahan saat upload');
        }
    };

    useEffect(() => {
        if (activeAdminTab === 'orders') {
            fetchOrders();
        }
    }, [activeAdminTab]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE}?action=get_orders`, {
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Gagal fetch orders, status:', response.status);
                setOrders([]);
                return;
            }
            const text = await response.text();
            try {
                const result = JSON.parse(text);
                setOrders(Array.isArray(result) ? result : []);
            } catch (e) {
                console.error('Response bukan JSON:', text.substring(0, 100));
                setOrders([]);
            }
        } catch (err) {
            console.error("Gagal mengambil data pesanan", err);
            setOrders([]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}?action=save_data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('Perubahan berhasil disimpan!');
                onSave(data);
            }
        } catch (err) {
            alert('Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const approveOrder = async (orderId) => {
        if (!confirm('Tandai pesanan ini sudah lunas?')) return;
        try {
            const response = await fetch(`${API_BASE}?action=approve_order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId })
            });
            const result = await response.json();
            if (result.status === 'success') {
                fetchOrders();
            }
        } catch (err) {
            alert('Gagal menyetujui pesanan');
        }
    };

    const deleteOrder = async (orderId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen?')) return;
        try {
            const response = await fetch(`${API_BASE}?action=delete_order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId })
            });
            const result = await response.json();
            if (result.status === 'success') {
                fetchOrders();
            } else {
                alert('Gagal menghapus pesanan');
            }
        } catch (err) {
            alert('Terjadi kesalahan saat menghapus pesanan');
        }
    };

    const sendEmailOrder = async (orderId) => {
        if (!confirm('Kirim email akses produk ke pembeli sekarang?')) return;
        try {
            const response = await fetch(`${API_BASE}?action=send_email_order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('Email berhasil dikirim!');
            } else {
                alert('Gagal mengirim email: ' + (result.message || 'Error tidak diketahui'));
            }
        } catch (err) {
            alert('Terjadi kesalahan saat mengirim email');
        }
    };

    const updateProduct = (id, field, value) => {
        setData({
            ...data,
            products: data.products.map(p => p.id === id ? { ...p, [field]: value } : p)
        });
    };

    const addProduct = () => {
        const newId = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
        setData({
            ...data,
            products: [...data.products, {
                id: newId,
                name: 'Produk Baru',
                price: 0,
                image: '',
                images: [],
                youtubeUrl: '',
                driveUrl: '',
                description: ''
            }]
        });
    };

    const removeProduct = (id) => {
        setData({
            ...data,
            products: data.products.filter(p => p.id !== id)
        });
    };

    const updatePayment = (field, value) => {
        setData({
            ...data,
            paymentSettings: { ...data.paymentSettings, [field]: value }
        });
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ fontSize: '1.5rem' }}>Admin Panel</h1>
                    <a href="./" target="_blank" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.9rem' }}>
                        <ExternalLink size={14} /> Lihat Situs
                    </a>
                </div>
                <button className="glass-card" onClick={onLogout} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <div className="admin-tab-container" style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <button onClick={() => setActiveAdminTab('profile')} className={`glass-card admin-tab ${activeAdminTab === 'profile' ? 'active' : ''}`}>
                    <User size={18} /> Profil
                </button>
                <button onClick={() => setActiveAdminTab('orders')} className={`glass-card admin-tab ${activeAdminTab === 'orders' ? 'active' : ''}`}>
                    <ClipboardList size={18} /> Pesanan
                </button>
                <button onClick={() => setActiveAdminTab('links')} className={`glass-card admin-tab ${activeAdminTab === 'links' ? 'active' : ''}`}>
                    <Plus size={18} /> Link Bio
                </button>
                <button onClick={() => setActiveAdminTab('products')} className={`glass-card admin-tab ${activeAdminTab === 'products' ? 'active' : ''}`}>
                    <Package size={18} /> Katalog
                </button>
                <button onClick={() => setActiveAdminTab('payment')} className={`glass-card admin-tab ${activeAdminTab === 'payment' ? 'active' : ''}`}>
                    <CreditCard size={18} /> Bayar
                </button>
                <button onClick={() => setActiveAdminTab('notifications')} className={`glass-card admin-tab ${activeAdminTab === 'notifications' ? 'active' : ''}`}>
                    <Mail size={18} /> Notif
                </button>
            </div>

            <div className="admin-content-area">
                {activeAdminTab === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Pengaturan Profil</h2>
                        <div className="admin-stack-mobile">
                            <div>
                                <label className="admin-label">Nama Lengkap</label>
                                <input className="admin-input" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="admin-label">Foto Profil</label>
                                <div className="admin-row responsive" style={{ gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--card-border)', flexShrink: 0 }}>
                                        <img src={data.avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Avatar'} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                        <input className="admin-input" value={data.avatar} placeholder="URL Foto Profil" onChange={e => setData({ ...data, avatar: e.target.value })} />
                                        <label className="btn-primary" style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            <Upload size={18} />
                                            <input type="file" hidden onChange={e => {
                                                if (e.target.files[0]) handleUpload(e.target.files[0], (url) => setData({ ...data, avatar: url }));
                                            }} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Bio / Deskripsi Singkat</label>
                                <textarea className="admin-input" value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} rows={3} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeAdminTab === 'orders' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>Riwayat Pesanan</h2>
                            <button className="refresh-btn" onClick={fetchOrders}>
                                <ClipboardList size={16} /> Refresh Data
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label className="admin-label" style={{ fontSize: '0.75rem' }}>Status</label>
                                <select className="admin-input" style={{ padding: '8px' }} value={orderFilterStatus} onChange={e => setOrderFilterStatus(e.target.value)}>
                                    <option value="ALL">Semua Status</option>
                                    <option value="PENDING">Belum Bayar (Baru)</option>
                                    <option value="PAID">Sudah Lunas</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label className="admin-label" style={{ fontSize: '0.75rem' }}>Periode Bulan</label>
                                <input type="month" className="admin-input" style={{ padding: '8px' }} value={orderFilterMonth} onChange={e => setOrderFilterMonth(e.target.value)} />
                            </div>
                            <button className="glass-card" style={{ alignSelf: 'flex-end', padding: '8px 12px', color: 'var(--text-muted)' }} onClick={() => { setOrderFilterStatus('ALL'); setOrderFilterMonth(''); }}>
                                Reset
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(() => {
                                const filtered = orders.filter(order => {
                                    const matchStatus = orderFilterStatus === 'ALL' || order.status === orderFilterStatus;
                                    const matchMonth = !orderFilterMonth || (order.created_at && order.created_at.startsWith(orderFilterMonth));
                                    return matchStatus && matchMonth;
                                });

                                if (filtered.length === 0) return <p className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada pesanan yang sesuai filter.</p>;

                                return filtered.map(order => (
                                    <div key={order.id} className="glass-card" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem' }}>{order.id}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{order.created_at}</span>
                                            </div>
                                            <span style={{
                                                fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', height: 'fit-content',
                                                background: order.status === 'PAID' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                                color: order.status === 'PAID' ? '#22c55e' : '#eab308'
                                            }}>{order.status === 'PAID' ? 'Lunas' : 'Menunggu'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{order.customer}</div>
                                            <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <MessageCircle size={14} /> {order.whatsapp}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)' }}>Produk: {order.product_name}</div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>{order.method} | Rp {order.amount.toLocaleString()}</div>
                                        </div>
                                        {order.status === 'PENDING' ? (
                                            <div className="admin-row responsive" style={{ gap: '8px' }}>
                                                <button className="btn-primary" style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #25d366, #128c7e)' }} onClick={() => approveOrder(order.id)}>
                                                    <CheckCircle size={16} /> Verifikasi (Lunas)
                                                </button>
                                                <button className="glass-card" style={{ flex: 1, padding: '10px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }} onClick={() => window.open(`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '62')}`, '_blank')}>
                                                    Hubungi WA
                                                </button>
                                                <button className="delete-btn" style={{ flex: 'none', padding: '10px' }} onClick={() => deleteOrder(order.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="admin-row responsive" style={{ gap: '8px' }}>
                                                <button className="glass-card" style={{ flex: 1, padding: '10px', color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.3)' }} onClick={() => window.open(order.wa_link, '_blank')}>
                                                    <MessageCircle size={16} /> WA Lunas
                                                </button>
                                                <button className="glass-card" style={{ flex: 1, padding: '10px', color: '#eab308', borderColor: 'rgba(234, 179, 8, 0.3)' }} onClick={() => sendEmailOrder(order.id)}>
                                                    <Mail size={16} /> Kirim Email
                                                </button>
                                                <button className="delete-btn" style={{ flex: 'none', padding: '10px' }} onClick={() => deleteOrder(order.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    </motion.div>
                )}

                {activeAdminTab === 'links' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>Kelola Link Bio</h2>
                            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => {
                                const newId = data.links.length > 0 ? Math.max(...data.links.map(l => l.id)) + 1 : 1;
                                setData({ ...data, links: [...data.links, { id: newId, title: 'Link Baru', url: '#' }] });
                            }}>
                                <Plus size={18} /> Tambah Link
                            </button>
                        </div>
                        <div className="admin-stack-mobile">
                            {data.links?.map(link => (
                                <div key={link.id} className="glass-card" style={{ padding: '16px' }}>
                                    <div className="admin-row responsive" style={{ gap: '12px' }}>
                                        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                                            <input className="admin-input" style={{ flex: 1 }} placeholder="Judul" value={link.title} onChange={e => setData({ ...data, links: data.links.map(l => l.id === link.id ? { ...l, title: e.target.value } : l) })} />
                                            <input className="admin-input" style={{ flex: 2 }} placeholder="URL" value={link.url} onChange={e => setData({ ...data, links: data.links.map(l => l.id === link.id ? { ...l, url: e.target.value } : l) })} />
                                        </div>
                                        <button onClick={() => setData({ ...data, links: data.links.filter(l => l.id !== link.id) })} className="delete-btn" style={{ width: '100%', maxWidth: 'fit-content' }}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeAdminTab === 'products' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>Kelola Katalog Produk</h2>
                            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={addProduct}>
                                <Plus size={18} /> Tambah Produk
                            </button>
                        </div>
                        <div className="admin-stack-mobile">
                            {data.products.map(product => (
                                <div key={product.id} className="glass-card" style={{ padding: '20px' }}>
                                    <div className="admin-row responsive admin-product-card" style={{ gap: '20px', alignItems: 'flex-start' }}>
                                        <div className="admin-product-image-preview" style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--card-border)', flexShrink: 0 }}>
                                            <img src={product.image} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=Produk'} />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                                            <input className="admin-input" placeholder="Judul Produk" value={product.name} onChange={e => updateProduct(product.id, 'name', e.target.value)} />
                                            <div className="admin-grid-2 responsive">
                                                <input className="admin-input" type="number" placeholder="Harga" value={product.price} onChange={e => updateProduct(product.id, 'price', parseInt(e.target.value) || 0)} />
                                                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                                    <input className="admin-input" placeholder="URL Gambar" value={product.image} onChange={e => updateProduct(product.id, 'image', e.target.value)} />
                                                    <label className="btn-primary" style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                        <Upload size={18} />
                                                        <input type="file" hidden onChange={e => {
                                                            if (e.target.files[0]) handleUpload(e.target.files[0], (url) => updateProduct(product.id, 'image', url));
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="admin-grid-2 responsive">
                                                <input className="admin-input" placeholder="Google Drive Link" value={product.driveUrl} onChange={e => updateProduct(product.id, 'driveUrl', e.target.value)} />
                                                <input className="admin-input" placeholder="YouTube Video URL" value={product.youtubeUrl || ''} onChange={e => updateProduct(product.id, 'youtubeUrl', e.target.value)} />
                                            </div>

                                            <div>
                                                <label className="admin-label">Gambar Tambahan (Opsional)</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {(product.images || []).map((img, idx) => (
                                                        <div key={idx} className="admin-row" style={{ gap: '8px' }}>
                                                            {img && <img src={img} alt={`preview-${idx}`} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />}
                                                            <input className="admin-input" style={{ fontSize: '0.8rem', padding: '8px' }} value={img} onChange={e => {
                                                                const newImages = [...(product.images || [])];
                                                                newImages[idx] = e.target.value;
                                                                updateProduct(product.id, 'images', newImages);
                                                            }} />
                                                            <label className="btn-primary" style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', flexShrink: 0 }}>
                                                                <Upload size={14} />
                                                                <input type="file" hidden accept="image/*" onChange={e => {
                                                                    if (e.target.files[0]) handleUpload(e.target.files[0], (url) => {
                                                                        const newImages = [...(product.images || [])];
                                                                        newImages[idx] = url;
                                                                        updateProduct(product.id, 'images', newImages);
                                                                    });
                                                                }} />
                                                            </label>
                                                            <button className="delete-btn" style={{ padding: '10px', flexShrink: 0 }} onClick={() => {
                                                                const newImages = (product.images || []).filter((_, i) => i !== idx);
                                                                updateProduct(product.id, 'images', newImages);
                                                            }}><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <label className="btn-primary" style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', width: 'fit-content', color: 'var(--text-main)' }}>
                                                        <Plus size={14} /> Tambah Gambar
                                                        <input type="file" hidden accept="image/*" onChange={e => {
                                                            if (e.target.files[0]) handleUpload(e.target.files[0], (url) => {
                                                                updateProduct(product.id, 'images', [...(product.images || []), url]);
                                                            });
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>

                                            <textarea className="admin-input" placeholder="Deskripsi Produk" value={product.description} onChange={e => updateProduct(product.id, 'description', e.target.value)} rows={2} />
                                        </div>
                                        <button onClick={() => removeProduct(product.id)} className="delete-btn" style={{ position: 'relative', alignSelf: 'flex-start' }}><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeAdminTab === 'payment' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-main)' }}>Konfigurasi Pembayaran</h2>
                        <div className="admin-stack-mobile">
                            <div>
                                <label className="admin-label" style={{ color: 'var(--text-main)' }}>Detail Rekening Bank</label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Contoh: BCA 1234567890 a/n Nama</p>
                                <input className="admin-input" value={data.paymentSettings.bank} onChange={e => updatePayment('bank', e.target.value)} />
                            </div>
                            <div>
                                <label className="admin-label" style={{ color: 'var(--text-main)' }}>QRIS Payment</label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Upload gambar QRIS Anda</p>
                                <div className="admin-row responsive" style={{ gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--card-border)', flexShrink: 0 }}>
                                        <img src={data.paymentSettings.qrisUrl} alt="QRIS Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => e.target.src = 'https://via.placeholder.com/120?text=QRIS'} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {data.paymentSettings.qrisUrl ? data.paymentSettings.qrisUrl.split('/').pop() : 'Belum ada gambar QRIS'}
                                        </p>
                                        <label className="btn-primary" style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', color: 'var(--text-main)' }}>
                                            <Upload size={18} /> Upload QRIS Baru
                                            <input type="file" hidden accept="image/*" onChange={e => {
                                                if (e.target.files[0]) handleUpload(e.target.files[0], (url) => updatePayment('qrisUrl', url));
                                            }} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="admin-label" style={{ color: 'var(--text-main)' }}>PayPal URL / Username</label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Contoh: https://paypal.me/username</p>
                                <input className="admin-input" value={data.paymentSettings.paypalUrl || ''} onChange={e => updatePayment('paypalUrl', e.target.value)} />
                            </div>
                            <div style={{ padding: '12px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Menerima pembayaran melalui <strong>Transfer Bank</strong>, <strong>QRIS</strong>, dan <strong>PayPal</strong>. Opsi yang tidak diisi akan otomatis disembunyikan jika kosong, namun Setidaknya Bank atau QRIS harus diisi.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeAdminTab === 'notifications' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-main)' }}>Pengaturan Notifikasi</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ padding: '16px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Konfigurasi Email (SMTP)</h3>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={data.notificationSettings?.emailEnabled} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), emailEnabled: e.target.checked } })} />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Aktifkan Notif Email</span>
                                    </label>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label className="admin-label">Email Penerima Notifikasi (Admin)</label>
                                    <input className="admin-input" placeholder="email.admin@gmail.com" value={data.notificationSettings?.adminEmail || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), adminEmail: e.target.value } })} />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Email ini akan menerima notifikasi otomatis ketika ada pesanan baru.</p>
                                </div>
                                <div className="admin-grid-2 responsive">
                                    <div>
                                        <label className="admin-label">SMTP Host</label>
                                        <input className="admin-input" placeholder="smtp.gmail.com" value={data.notificationSettings?.smtpHost || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), smtpHost: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="admin-label">SMTP Port</label>
                                        <input className="admin-input" placeholder="587" value={data.notificationSettings?.smtpPort || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), smtpPort: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="admin-label">SMTP User</label>
                                        <input className="admin-input" placeholder="email@gmail.com" value={data.notificationSettings?.smtpUser || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), smtpUser: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="admin-label">SMTP Password</label>
                                        <input className="admin-input" type="password" placeholder="App Password" value={data.notificationSettings?.smtpPass || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), smtpPass: e.target.value } })} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '12px' }}>Tip: Gunakan "App Password" jika menggunakan Gmail.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageCircle size={18} /> Template Notifikasi
                                </h3>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 'bold' }}>ℹ️ Informasi Tag Otomatis:</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{"{customer}"}</code>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>: Nama Pembeli</span>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{"{product_name}"}</code>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>: Nama Produk</span>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{"{drive_link}"}</code>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>: Link Produk/Akses</span>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{"{admin_name}"}</code>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>: Nama Anda (Admin)</span>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>*Pastikan menulis tag persis seperti di atas (termasuk kurung kurawal).</p>
                                </div>
                                <div>
                                    <label className="admin-label">Pesan WhatsApp (Setelah Verifikasi)</label>
                                    <textarea className="admin-input" rows={4} placeholder="Halo {customer}, terima kasih telah membeli {product_name}..." value={data.notificationSettings?.waTemplate || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), waTemplate: e.target.value } })} />
                                </div>
                                <div>
                                    <label className="admin-label">Subject Email Notifikasi</label>
                                    <input className="admin-input" placeholder="Akses Produk: {product_name}" value={data.notificationSettings?.emailSubject || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), emailSubject: e.target.value } })} />
                                </div>
                                <div>
                                    <label className="admin-label">Isi Email Notifikasi</label>
                                    <textarea className="admin-input" rows={6} placeholder="Halo {customer}, berikut link akses untuk {product_name}: {drive_link}" value={data.notificationSettings?.emailTemplate || ''} onChange={e => setData({ ...data, notificationSettings: { ...(data.notificationSettings || {}), emailTemplate: e.target.value } })} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            <div style={{ height: '100px' }}></div>
            <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '800px', padding: '0 20px', zIndex: 100 }}>
                <button className="btn-primary" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)' }} onClick={handleSave} disabled={loading}>
                    <Save size={20} /> {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </button>
            </div>

            <style>{`
                .admin-tab { flex: 1; min-width: 100px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid var(--card-border); cursor: pointer; color: var(--text-muted); transition: all 0.3s ease; white-space: nowrap; border-radius: 12px; }
                .admin-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
                .admin-label { display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-main); font-weight: 500; }
                .admin-input { width: 100%; padding: 12px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; color: var(--text-main); font-family: inherit; transition: all 0.2s; -webkit-appearance: none; }
                .admin-input:focus { outline: none; border-color: var(--primary); background: var(--glass-bg); box-shadow: 0 0 0 2px var(--primary-glow); }
                .admin-input::placeholder { color: var(--text-muted); opacity: 0.7; }
                select.admin-input option { background: var(--card-bg); color: var(--text-main); }
                .refresh-btn { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
                .refresh-btn:hover { background: rgba(99, 102, 241, 0.2); border-color: var(--primary); color: white; transform: translateY(-1px); }
                .delete-btn { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .delete-btn:hover { background: rgba(239, 68, 68, 0.2); transform: scale(1.05); }
                .admin-tab-container::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}

export default Admin;
