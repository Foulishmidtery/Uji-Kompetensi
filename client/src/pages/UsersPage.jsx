import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import api from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { LuUser, LuMail, LuKey, LuShieldCheck, LuBuilding } from 'react-icons/lu';

const roles = ['staff', 'petugas', 'admin'];
const emptyForm = { name: '', email: '', password: '', role: 'staff', department: '' };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { try { const res = await api.get('/users'); setUsers(res.data.data); } catch {} finally { setLoading(false); } };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => { setEditing(u._id); setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.put(`/users/${editing}`, data);
        toast.success('User berhasil diperbarui');
      } else {
        await api.post('/auth/register', form);
        toast.success('User berhasil ditambahkan');
      }
      setModalOpen(false); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan user'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User dihapus'); fetchUsers(); } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus user'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Kelola User" />
        <div className="page-container">
          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div><h1>Kelola User</h1><p>Manajemen pengguna dan hak akses</p></div>
            <button className="btn btn-primary" onClick={openAdd}><HiOutlinePlus /> Tambah User</button>
          </div>
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Departemen</th><th>Terdaftar</th><th>Aksi</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                      <td>{u.department || '-'}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(u)}><HiOutlinePencil /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" style={{ color:'var(--accent-red)' }} onClick={() => handleDelete(u._id)}><HiOutlineTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Tambah User'} footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="btn btn-primary" form="userForm">{editing ? 'Simpan' : 'Tambah'}</button></>}>
            <form id="userForm" onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label"><LuUser style={{ color: '#3b82f6' }} /> Nama *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label"><LuMail style={{ color: '#f59e0b' }} /> Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label"><LuKey style={{ color: '#ef4444' }} /> Password {editing ? '(kosongkan jika tidak diubah)' : '*'}</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} {...(!editing && { required: true })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label"><LuShieldCheck style={{ color: '#10b981' }} /> Role</label><select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div className="form-group"><label className="form-label"><LuBuilding style={{ color: '#8b5cf6' }} /> Departemen</label><input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
