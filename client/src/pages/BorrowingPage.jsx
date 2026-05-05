import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api from '../services/api';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';
import { LuPackageSearch, LuCalendarClock, LuTarget, LuStickyNote } from 'react-icons/lu';

const BorrowingPage = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  const canManage = ['petugas', 'admin'].includes(user?.role);
  const [borrowings, setBorrowings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ item: '', returnDate: '', purpose: '', notes: '' });

  useEffect(() => { fetchBorrowings(); }, []);

  const fetchBorrowings = async () => {
    try {
      const endpoint = isStaff ? '/borrowings/my' : '/borrowings';
      const res = await api.get(endpoint);
      setBorrowings(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  const openRequest = async () => {
    try {
      const res = await api.get('/items', { params: { status: 'Tersedia', limit: 100 } });
      setItems(res.data.data);
      setForm({ item: '', returnDate: '', purpose: '', notes: '' });
      setModalOpen(true);
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/borrowings', form);
      setModalOpen(false);
      fetchBorrowings();
      toast.success('Peminjaman berhasil diajukan');
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal mengajukan peminjaman'); }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/borrowings/${id}/${action}`);
      fetchBorrowings();
      toast.success(`Aksi ${action} berhasil`);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal melakukan aksi'); }
  };

  const statusClass = (s) => s.toLowerCase();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Peminjaman" />
        <div className="page-container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Peminjaman Barang</h1>
              <p>{isStaff ? 'Riwayat peminjaman Anda' : 'Kelola semua permintaan peminjaman'}</p>
            </div>
            <button className="btn btn-primary" onClick={openRequest}><HiOutlinePlus /> Ajukan Peminjaman</button>
          </div>

          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Barang</th>
                    {canManage && <th>Peminjam</th>}
                    <th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Tujuan</th><th>Status</th>
                    {canManage && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {borrowings.length === 0 ? (
                    <tr><td colSpan={canManage ? 7 : 5} style={{ textAlign: 'center', padding: '40px' }}>Tidak ada data peminjaman</td></tr>
                  ) : borrowings.map(b => (
                    <tr key={b._id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.item?.name || '-'}<br /><small style={{ color: 'var(--text-muted)' }}>{b.item?.code}</small></td>
                      {canManage && <td>{b.borrower?.name}<br /><small style={{ color: 'var(--text-muted)' }}>{b.borrower?.department}</small></td>}
                      <td>{formatDate(b.borrowDate)}</td>
                      <td>{formatDate(b.returnDate)}{b.actualReturnDate && <><br /><small style={{ color: 'var(--accent-green)' }}>Dikembalikan: {formatDate(b.actualReturnDate)}</small></>}</td>
                      <td style={{ maxWidth: '200px' }}>{b.purpose}</td>
                      <td><span className={`badge ${statusClass(b.status)}`}><span className="badge-dot" />{b.status}</span></td>
                      {canManage && (
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {b.status === 'Menunggu' && (
                              <>
                                <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' }} onClick={() => handleAction(b._id, 'approve')} title="Setujui"><HiOutlineCheck /></button>
                                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' }} onClick={() => handleAction(b._id, 'reject')} title="Tolak"><HiOutlineX /></button>
                              </>
                            )}
                            {b.status === 'Disetujui' && (
                              <button className="btn btn-sm" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }} onClick={() => handleAction(b._id, 'return')} title="Kembalikan"><HiOutlineRefresh /> Kembali</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajukan Peminjaman" footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="btn btn-primary" form="borrowForm">Ajukan</button></>}>
            <form id="borrowForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><LuPackageSearch style={{ color: '#3b82f6' }} /> Pilih Barang *</label>
                <select className="form-select" value={form.item} onChange={e => setForm({...form, item: e.target.value})} required>
                  <option value="">-- Pilih barang --</option>
                  {items.map(i => <option key={i._id} value={i._id}>{i.name} ({i.code})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label"><LuCalendarClock style={{ color: '#f59e0b' }} /> Tanggal Pengembalian *</label><input className="form-input" type="date" value={form.returnDate} onChange={e => setForm({...form, returnDate: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label"><LuTarget style={{ color: '#10b981' }} /> Tujuan Peminjaman *</label><textarea className="form-textarea" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label"><LuStickyNote style={{ color: '#64748b' }} /> Catatan</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default BorrowingPage;
