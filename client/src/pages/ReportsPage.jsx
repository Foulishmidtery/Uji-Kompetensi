import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LuFileDown, LuFileSpreadsheet } from 'react-icons/lu';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trends, setTrends] = useState([]);
  const [borrowStats, setBorrowStats] = useState({ statusStats: [], topItems: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, c, t, b] = await Promise.all([
          api.get('/reports/summary'), api.get('/reports/category-distribution'),
          api.get('/reports/monthly-trends'), api.get('/reports/borrowing-stats')
        ]);
        setSummary(s.data.data); setCategoryData(c.data.data); setTrends(t.data.data); setBorrowStats(b.data.data);
      } catch { } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const tooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' };

  const handleExportPDF = () => {
    if (!summary) return;
    const columns = ['Metrik', 'Jumlah'];
    const data = [
      ['Total Barang Inventaris', summary.inventory.totalItems],
      ['Barang Tersedia', summary.inventory.available],
      ['Barang Dipinjam', summary.inventory.borrowed],
      ['Barang Rusak', summary.inventory.damaged],
      ['Total Peminjaman', summary.borrowings.totalBorrowings],
      ['Menunggu Persetujuan', summary.borrowings.pendingBorrowings],
      ['Sedang Dipinjam', summary.borrowings.activeBorrowings],
      ['Sudah Dikembalikan', summary.borrowings.returnedBorrowings]
    ];
    exportToPDF('Ringkasan Data Inventaris & Peminjaman', columns, data, 'Laporan_Ringkasan_InvenTrack');
  };

  const handleExportExcel = () => {
    if (!summary) return;
    const data = [
      { Metrik: 'Total Barang Inventaris', Jumlah: summary.inventory.totalItems },
      { Metrik: 'Barang Tersedia', Jumlah: summary.inventory.available },
      { Metrik: 'Barang Dipinjam', Jumlah: summary.inventory.borrowed },
      { Metrik: 'Barang Rusak', Jumlah: summary.inventory.damaged },
      { Metrik: 'Total Peminjaman', Jumlah: summary.borrowings.totalBorrowings },
      { Metrik: 'Menunggu Persetujuan', Jumlah: summary.borrowings.pendingBorrowings },
      { Metrik: 'Sedang Dipinjam', Jumlah: summary.borrowings.activeBorrowings },
      { Metrik: 'Sudah Dikembalikan', Jumlah: summary.borrowings.returnedBorrowings }
    ];
    exportToExcel(data, 'Laporan_Ringkasan_InvenTrack');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Laporan" />
        <div className="page-container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1>Laporan & Analisis</h1>
              <p>Grafik dan rekap data inventaris</p>
            </div>
            {summary && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost" onClick={handleExportPDF}><LuFileDown className="text-red-500" style={{ color: '#ef4444' }} /> Ekspor PDF</button>
                <button className="btn btn-ghost" onClick={handleExportExcel}><LuFileSpreadsheet className="text-green-500" style={{ color: '#10b981' }} /> Ekspor Excel</button>
              </div>
            )}
          </div>

          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <>
              <div className="charts-grid">
                <div className="glass-card chart-card">
                  <h3>Distribusi Kategori Barang</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={3} dataKey="value" label={({name,value})=>`${name}: ${value}`}>{categoryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip contentStyle={tooltipStyle}/><Legend /></PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card chart-card">
                  <h3>Tren Peminjaman Bulanan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis dataKey="month" stroke="#64748b" fontSize={12}/><YAxis stroke="#64748b" fontSize={12}/><Tooltip contentStyle={tooltipStyle}/><Legend /><Line type="monotone" dataKey="peminjaman" stroke="#3b82f6" strokeWidth={2} dot={{ fill:'#3b82f6' }}/><Line type="monotone" dataKey="pengembalian" stroke="#10b981" strokeWidth={2} dot={{ fill:'#10b981' }}/></LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card chart-card">
                  <h3>Status Peminjaman</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart><Pie data={borrowStats.statusStats} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>{borrowStats.statusStats.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip contentStyle={tooltipStyle}/><Legend /></PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card chart-card">
                  <h3>Barang Paling Sering Dipinjam</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={borrowStats.topItems} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis type="number" stroke="#64748b" fontSize={12}/><YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={120}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="count" fill="#8b5cf6" radius={[0,6,6,0]}/></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {summary && (
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600 }}>Ringkasan Data</h3>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead><tr><th>Metrik</th><th>Jumlah</th></tr></thead>
                      <tbody>
                        <tr><td>Total Barang Inventaris</td><td style={{fontWeight:600}}>{summary.inventory.totalItems}</td></tr>
                        <tr><td>Barang Tersedia</td><td style={{fontWeight:600,color:'var(--accent-green)'}}>{summary.inventory.available}</td></tr>
                        <tr><td>Barang Dipinjam</td><td style={{fontWeight:600,color:'var(--accent-yellow)'}}>{summary.inventory.borrowed}</td></tr>
                        <tr><td>Barang Rusak</td><td style={{fontWeight:600,color:'var(--accent-red)'}}>{summary.inventory.damaged}</td></tr>
                        <tr><td>Total Peminjaman</td><td style={{fontWeight:600}}>{summary.borrowings.totalBorrowings}</td></tr>
                        <tr><td>Menunggu Persetujuan</td><td style={{fontWeight:600,color:'var(--accent-yellow)'}}>{summary.borrowings.pendingBorrowings}</td></tr>
                        <tr><td>Sedang Dipinjam</td><td style={{fontWeight:600,color:'var(--accent-blue)'}}>{summary.borrowings.activeBorrowings}</td></tr>
                        <tr><td>Sudah Dikembalikan</td><td style={{fontWeight:600,color:'var(--accent-green)'}}>{summary.borrowings.returnedBorrowings}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
