// app.jsx — root App: navigation, layout, persistence
const { useState, useEffect, useRef } = React;

// localStorage persistence
const STORAGE_KEY = 'grada_state_v1';
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const FLOW = ['welcome', 'signup', 'login', 'home', 'community', 'league', 'chat', 'profile'];

function App() {
  const saved = loadState() || {};
  const [screen, setScreen] = useState(saved.screen || 'welcome');
  const [user, setUser] = useState(saved.user || null);
  const [toast, setToast] = useState('');
  const [direction, setDirection] = useState('forward');
  const prevScreen = useRef(screen);

  useEffect(() => {
    saveState({ screen, user });
  }, [screen, user]);

  function navigate(target, dir = 'forward') {
    setDirection(dir);
    prevScreen.current = screen;
    setScreen(target);
  }

  function handleAuth(u) {
    setUser(u);
    setToast(`¡Bienvenido, ${u.name.split(' ')[0]}!`);
    navigate('home');
  }

  function handleLogout() {
    setUser(null);
    setToast('Sesión cerrada');
    navigate('welcome', 'back');
  }

  // tab-level nav maps to one of the tab screens
  function tabNav(id) {
    // feed isn't built as its own screen — route to home
    const target = id === 'feed' ? 'home' : id;
    setDirection('forward');
    setScreen(target);
  }

  // Quick-jump dev nav (top of page, outside the phone)
  const NAV_LABELS = {
    welcome: '1 · Welcome',
    signup: '2 · Sign Up',
    login: '3 · Login',
    home: '4 · Home',
    community: '5 · Community',
    league: '6 · Liga',
    chat: '7 · Chat',
    profile: '8 · Profile',
  };

  // Render current screen
  let content;
  switch (screen) {
    case 'welcome':
      content = <WelcomeScreen onFinish={() => navigate('signup')} />;
      break;
    case 'signup':
      content = <SignupScreen onAuth={handleAuth} onGoToLogin={() => navigate('login')} />;
      break;
    case 'login':
      content = <LoginScreen onAuth={handleAuth} onGoToSignup={() => navigate('signup', 'back')} onBack={() => navigate('signup', 'back')} />;
      break;
    case 'home':
      content = <HomeScreen user={user} onNavigate={tabNav} active="home" />;
      break;
    case 'chat':
      content = <ChatScreen onNavigate={tabNav} active="chat" />;
      break;
    case 'community':
      content = <CommunityScreen onNavigate={tabNav} active="community" />;
      break;
    case 'league':
      content = <LeagueScreen user={user} onNavigate={tabNav} active="league" />;
      break;
    case 'profile':
      content = <ProfileScreen user={user} onNavigate={tabNav} active="profile" onLogout={handleLogout} />;
      break;
    default:
      content = <div style={{ color: '#fff', padding: 40 }}>Unknown screen: {screen}</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 40px',
      position: 'relative',
    }}>
      {/* Header / brand */}
      <div style={{
        width: '100%', maxWidth: 1100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px var(--accent-primary)',
            color: '#001008',
          }}><Icon.ball size={18} color="#001008" /></div>
          <div>
            <div style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontStyle: 'italic',
              fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1,
              color: '#fff',
            }}>GRADA</div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              letterSpacing: '0.2em', color: 'var(--accent-primary)',
              marginTop: 2, textShadow: '0 0 6px var(--accent-primary)',
            }}>// PROTOTIPO INTERACTIVO</div>
          </div>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
        }}>
          TAP-THROUGH · 7 PANTALLAS
        </div>
      </div>

      {/* Dev jump bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
        marginBottom: 24, maxWidth: 700,
      }}>
        {FLOW.map(s => {
          const active = s === screen;
          return (
            <button key={s} onClick={() => navigate(s)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: active ? 'rgba(204, 255, 0,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
              color: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.55)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: active ? '0 0 10px rgba(204, 255, 0,0.2)' : 'none',
            }}>{NAV_LABELS[s]}</button>
          );
        })}
      </div>

      {/* Phone */}
      <div data-screen-label={`0${FLOW.indexOf(screen) + 1} ${screen}`} style={{ position: 'relative' }}>
        <IOSDevice dark={true} width={390} height={844}>
          <div key={screen} style={{
            position: 'absolute', inset: 0,
            opacity: 1,
          }}>
            {content}
          </div>
          <Toast msg={toast} onClose={() => setToast('')} />
        </IOSDevice>
      </div>

      <div style={{
        marginTop: 24,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.08em',
        textAlign: 'center',
        maxWidth: 520,
      }}>
        Interactúa con los botones, formularios y tabs · Estado persistente en localStorage · Activa Tweaks arriba para cambiar colores y efectos
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
