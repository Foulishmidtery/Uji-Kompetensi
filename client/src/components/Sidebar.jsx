import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineCube, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineClock, HiOutlineUsers, HiOutlineLogout } from 'react-icons/hi';
import { LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <HiOutlineViewGrid />, roles: ['staff', 'petugas', 'admin'] },
    { path: '/inventory', label: 'Inventaris', icon: <HiOutlineCube />, roles: ['staff', 'petugas', 'admin'] },
    { path: '/borrowings', label: 'Peminjaman', icon: <HiOutlineClipboardList />, roles: ['staff', 'petugas', 'admin'] },
    { path: '/reports', label: 'Laporan', icon: <HiOutlineChartBar />, roles: ['admin'] },
    { path: '/activity-log', label: 'Log Aktivitas', icon: <HiOutlineClock />, roles: ['admin'] },
    { path: '/users', label: 'Kelola User', icon: <HiOutlineUsers />, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const closeMobileSidebar = () => {
    document.body.classList.remove('mobile-sidebar-open');
  };

  return (
    <>
      <div className="mobile-overlay" onClick={closeMobileSidebar}></div>
      <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">IT</div>
        <h2>InvenTrack</h2>
        <button 
          className="sidebar-toggle-top" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
        >
          {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNav.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={() => { closeMobileSidebar(); logout(); }} title="Logout">
          <HiOutlineLogout />
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
