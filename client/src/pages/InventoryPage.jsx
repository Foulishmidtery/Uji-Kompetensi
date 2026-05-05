import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import { LuPackage, LuTags, LuBookmark, LuActivity, LuCircleCheck, LuMapPin, LuLayers, LuFileText, LuFileDown, LuFileSpreadsheet, LuQrCode, LuPrinter } from 'react-icons/lu';
import { QRCodeCanvas } from 'qrcode.react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const categories = ['Komputer', 'Laptop', 'Proyektor', 'Meja', 'Kursi', 'Printer', 'Telepon', 'Scanner', 'AC', 'Lainnya'];
const statuses = ['Tersedia', 'Dipinjam', 'Rusak'];
const conditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

const emptyForm = { name: '', category: 'Komputer', brand: '', condition: 'Baik', status: 'Tersedia', location: '', quantity: 1, description: '' };

const InventoryPage = () => {
  const { user } = useAuth();
  const canEdit = ['petugas', 'admin'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [qrModal, setQrModal] = useState({ open: false, item: null });

  useEffect(() => { fetchItems(); }, [search, filterCat, filterStatus, pagination.current, limit]);

  const fetchItems = async () => {
    try {
      const params = { page: pagination.current, limit };
      if (search) params.search = search;
      if (filterCat) params.category = filterCat;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/items', { params });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch { } finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item._id);
    setForm({ name: item.name, category: item.category, brand: item.brand || '', condition: item.condition, status: item.status, location: item.location || '', quantity: item.quantity, description: item.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/items/${editing}`, form);
        toast.success('Barang berhasil diperbarui');
      } else {
        await api.post('/items', form);
        toast.success('Barang berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan barang'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;
    try { await api.delete(`/items/${id}`); toast.success('Barang dihapus'); fetchItems(); } catch (err) { toast.error('Gagal menghapus barang'); }
  };

  const handleExportPDF = () => {
    const columns = ['Kode', 'Nama', 'Kategori', 'Merek', 'Kondisi', 'Status', 'Lokasi', 'Jumlah'];
    const data = items.map(i => [i.code, i.name, i.category, i.brand || '-', i.condition, i.status, i.location || '-', i.quantity]);
    exportToPDF('Daftar Barang Inventaris', columns, data, 'Data_Inventaris_InvenTrack');
  };

  const handleExportExcel = () => {
    const data = items.map(i => ({ Kode: i.code, Nama: i.name, Kategori: i.category, Merek: i.brand, Kondisi: i.condition, Status: i.status, Lokasi: i.location, Jumlah: i.quantity }));
    exportToExcel(data, 'Data_Inventaris_InvenTrack');
  };

  const statusClass = (s) => s.toLowerCase().replace(' ', '');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Inventaris Barang" />
        <div className="page-container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1>Inventaris Barang</h1>
              <p>Kelola semua barang inventaris kantor</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" onClick={handleExportPDF} title="Ekspor halaman ini ke PDF"><LuFileDown style={{ color: '#ef4444' }} /> Ekspor PDF</button>
              <button className="btn btn-ghost" onClick={handleExportExcel} title="Ekspor halaman ini ke Excel"><LuFileSpreadsheet style={{ color: '#10b981' }} /> Ekspor Excel</button>
              {canEdit && <button className="btn btn-primary" onClick={openAdd}><HiOutlinePlus /> Tambah Barang</button>}
            </div>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <HiOutlineSearch className="search-icon" />
              <input className="form-input" placeholder="Cari barang..." value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({...p, current: 1})); }} />
            </div>
            <div className="filter-group">
              <select className="form-select" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPagination(p => ({...p, current: 1})); }}>
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="form-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({...p, current: 1})); }}>
                <option value="">Semua Status</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Merek</th><th>Kondisi</th><th>Status</th><th>Lokasi</th><th>Qty</th>
                      {canEdit && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={canEdit ? 9 : 8} style={{ textAlign: 'center', padding: '40px' }}>Tidak ada data barang</td></tr>
                    ) : items.map(item => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{item.code}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.brand || '-'}</td>
                        <td>{item.condition}</td>
                        <td><span className={`badge ${statusClass(item.status)}`}><span className="badge-dot" />{item.status}</span></td>
                        <td>{item.location || '-'}</td>
                        <td>{item.quantity}</td>
                        {canEdit && (
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setQrModal({ open: true, item })} title="Tampilkan QR Code"><LuQrCode /></button>
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(item)} title="Edit"><HiOutlinePencil /></button>
                              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(item._id)} title="Hapus" style={{ color: 'var(--accent-red)' }}><HiOutlineTrash /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <div className="limit-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tampilkan:</span>
                  <select className="form-select" style={{ width: '80px', padding: '6px 30px 6px 12px' }} value={limit} onChange={e => { setLimit(e.target.value); setPagination(p => ({...p, current: 1})); }}>
                    <option value="5">5</option>
                    <option value="15">15</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={pagination.current === 1} onClick={() => setPagination(p => ({...p, current: p.current - 1}))}>Prev</button>
                    <span className="page-info">Halaman {pagination.current} dari {pagination.pages}</span>
                    <button className="page-btn" disabled={pagination.current === pagination.pages} onClick={() => setPagination(p => ({...p, current: p.current + 1}))}>Next</button>
                  </div>
                )}
              </div>
            </>
          )}

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Barang' : 'Tambah Barang'} footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="btn btn-primary" form="itemForm">{editing ? 'Simpan' : 'Tambah'}</button></>}>
            <form id="itemForm" onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label"><LuPackage style={{ color: '#3b82f6' }} /> Nama Barang *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label"><LuTags style={{ color: '#8b5cf6' }} /> Kategori *</label><select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label"><LuBookmark style={{ color: '#10b981' }} /> Merek</label><input className="form-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label"><LuActivity style={{ color: '#f59e0b' }} /> Kondisi</label><select className="form-select" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>{conditions.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label"><LuCircleCheck style={{ color: '#06b6d4' }} /> Status</label><select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label"><LuMapPin style={{ color: '#ef4444' }} /> Lokasi</label><input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                <div className="form-group"><label className="form-label"><LuLayers style={{ color: '#ec4899' }} /> Jumlah</label><input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 0})} /></div>
              </div>
              <div className="form-group"><label className="form-label"><LuFileText style={{ color: '#64748b' }} /> Deskripsi</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            </form>
          </Modal>

          <Modal isOpen={qrModal.open} onClose={() => setQrModal({ open: false, item: null })} title="QR Code Barang" footer={<><button className="btn btn-ghost" onClick={() => setQrModal({ open: false, item: null })}>Tutup</button><button className="btn btn-primary" onClick={() => window.print()}><LuPrinter /> Cetak QR</button></>}>
            {qrModal.item && (
              <div className="qr-print-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
                  <QRCodeCanvas value={JSON.stringify({ id: qrModal.item._id, code: qrModal.item.code, name: qrModal.item.name })} size={200} level="H" includeMargin />
                </div>
                <h3 style={{ marginTop: '20px', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>{qrModal.item.code}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{qrModal.item.name}</p>
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }} className="no-print">
                  Pastikan pengaturan cetak hanya menargetkan elemen ini (menggunakan CSS print media).
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
