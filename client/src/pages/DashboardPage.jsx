import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { HiOutlineCube, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, catRes] = await Promise.all([
        api.get('/reports/summary').catch(() => ({ data: { data: { inventory: { totalItems: 0, available: 0, borrowed: 0, damaged: 0 }, borrowings: { totalBorrowings: 0, pendingBorrowings: 0 } } } })),
        api.get('/reports/category-distribution').catch(() => ({ data: { data: [] } }))
      ]);
      setSummary(sumRes.data.data);
      setCategoryData(catRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  const stats = summary ? [
    { label: 'Total Barang', value: summary.inventory.totalItems, icon: <HiOutlineCube />, color: 'blue' },
    { label: 'Tersedia', value: summary.inventory.available, icon: <HiOutlineCheckCircle />, color: 'green' },
    { label: 'Dipinjam', value: summary.inventory.borrowed, icon: <HiOutlineClock />, color: 'yellow' },
    { label: 'Rusak', value: summary.inventory.damaged, icon: <HiOutlineExclamationCircle />, color: 'red' },
  ] : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="page-container">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Ringkasan inventaris dan aktivitas terkini</p>
          </div>

          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <>
              <div className="stats-grid">
                {stats.map((s, i) => (
                  <div className="stat-card" key={i}>
                    <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                    <div className="stat-info">
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="charts-grid">
                <div className="glass-card chart-card">
                  <h3>Distribusi Kategori</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card chart-card">
                  <h3>Status Inventaris</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { name: 'Tersedia', jumlah: summary?.inventory.available || 0 },
                      { name: 'Dipinjam', jumlah: summary?.inventory.borrowed || 0 },
                      { name: 'Rusak', jumlah: summary?.inventory.damaged || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                      <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
