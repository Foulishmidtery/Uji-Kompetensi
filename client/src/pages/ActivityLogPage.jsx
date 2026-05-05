import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { HiOutlineLogin, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';

const iconMap = {
  LOGIN: { icon: <HiOutlineLogin />, bg: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' },
  CREATE_ITEM: { icon: <HiOutlinePlus />, bg: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' },
  UPDATE_ITEM: { icon: <HiOutlinePencil />, bg: 'rgba(245,158,11,0.15)', color: 'var(--accent-yellow)' },
  DELETE_ITEM: { icon: <HiOutlineTrash />, bg: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' },
  REQUEST_BORROW: { icon: <HiOutlinePlus />, bg: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' },
  APPROVE_BORROW: { icon: <HiOutlineCheck />, bg: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' },
  REJECT_BORROW: { icon: <HiOutlineX />, bg: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' },
  RETURN_ITEM: { icon: <HiOutlineRefresh />, bg: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)' },
  CREATE_USER: { icon: <HiOutlinePlus />, bg: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' },
  UPDATE_USER: { icon: <HiOutlinePencil />, bg: 'rgba(245,158,11,0.15)', color: 'var(--accent-yellow)' },
  DELETE_USER: { icon: <HiOutlineTrash />, bg: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' },
};

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/users/logs/activity', { params: { page: pagination.current, limit } });
        setLogs(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      } catch { } finally { setLoading(false); }
    };
    fetchLogs();
  }, [pagination.current, limit]);

  const formatTime = (t) => new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Log Aktivitas" />
        <div className="page-container">
          <div className="page-header"><h1>Log Aktivitas</h1><p>Pantau semua aktivitas pengguna di sistem</p></div>
          {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
            <div className="glass-card">
              {logs.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><h3>Belum ada aktivitas</h3></div>
              ) : logs.map(log => {
                const style = iconMap[log.action] || iconMap.LOGIN;
                return (
                  <div className="log-item" key={log._id}>
                    <div className="log-icon" style={{ background: style.bg, color: style.color }}>{style.icon}</div>
                    <div className="log-content">
                      <div className="log-action">{log.user?.name || 'System'} <span className={`badge ${log.user?.role || 'staff'}`} style={{marginLeft:'8px'}}>{log.user?.role}</span></div>
                      <div className="log-target">{log.target}</div>
                      <div className="log-time">{formatTime(log.timestamp)}</div>
                    </div>
                  </div>
                );
              })}

              <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                <div className="limit-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tampilkan:</span>
                  <select className="form-select" style={{ width: '80px', padding: '6px 30px 6px 12px' }} value={limit} onChange={e => { setLimit(e.target.value); setPagination(p => ({...p, current: 1})); }}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                {pagination.pages > 1 && (
                  <div className="pagination" style={{ marginTop: 0 }}>
                    <button className="page-btn" disabled={pagination.current === 1} onClick={() => setPagination(p => ({...p, current: p.current - 1}))}>Prev</button>
                    <span className="page-info">Halaman {pagination.current} dari {pagination.pages}</span>
                    <button className="page-btn" disabled={pagination.current === pagination.pages} onClick={() => setPagination(p => ({...p, current: p.current + 1}))}>Next</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;
