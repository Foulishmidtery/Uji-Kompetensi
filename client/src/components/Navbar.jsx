import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineDesktopComputer, HiOutlineMenu } from 'react-icons/hi';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const { mode, setMode } = useTheme();

  const toggleMobileSidebar = () => {
    document.body.classList.toggle('mobile-sidebar-open');
  };

  return (
    <header className="navbar">
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-menu-btn" onClick={toggleMobileSidebar} title="Menu">
          <HiOutlineMenu />
        </button>
        <div className="navbar-title">{title}</div>
      </div>
      <div className="navbar-right">
        <div className="theme-toggle" title={`Mode: ${mode}`}>
          <button
            className={mode === 'light' ? 'active' : ''}
            onClick={() => setMode('light')}
            title="Light Mode"
          >
            <HiOutlineSun />
          </button>
          <button
            className={mode === 'dark' ? 'active' : ''}
            onClick={() => setMode('dark')}
            title="Dark Mode"
          >
            <HiOutlineMoon />
          </button>
          <button
            className={mode === 'system' ? 'active' : ''}
            onClick={() => setMode('system')}
            title="System Mode"
          >
            <HiOutlineDesktopComputer />
          </button>
        </div>
        <span className="user-greeting">Selamat datang, <strong>{user?.name}</strong></span>
      </div>
    </header>
  );
};

export default Navbar;
