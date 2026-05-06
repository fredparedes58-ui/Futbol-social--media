// home.jsx — TikTok-style vertical feed with multi-post swipe + dynamic overlays

const FEED_POSTS = [
  {
    id: 1,
    author: 'Juan P.', team: 'C.F. Estrellas',
    avatarBg: '#1e3ca8',
    caption: 'Golazo de chilena en la final',
    highlight: 'Golazo',
    hashtags: '#GRADA · #Cracks · #Gol',
    likes: 1200, comments: 340,
    bg: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&q=85&auto=format&fit=crop',
    action: 'bicycle',
  },
  {
    id: 2,
    author: 'Lucas F.', team: 'Atlético Nova',
    avatarBg: '#8a1e3c',
    caption: 'Entrenamiento de pretemporada',
    highlight: 'Summer training',
    hashtags: '#Prepara · #Equipo · #Pretemporada',
    likes: 876, comments: 142,
    bg: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=85&auto=format&fit=crop',
    action: 'team',
  },
  {
    id: 3,
    author: 'Sofía T.', team: 'Rayo Urbano',
    avatarBg: '#0a3a3a',
    caption: 'Asistencia decisiva en el derbi',
    highlight: 'Asistencia',
    hashtags: '#Derbi · #Asistencia · #Cracks',
    likes: 2100, comments: 520,
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&q=85&auto=format&fit=crop',
    action: 'pitch',
  },
];

function HomeScreen({ user, onNavigate, active }) {
  const [idx, setIdx] = React.useState(0);
  const [likes, setLikes] = React.useState(FEED_POSTS.map(p => p.likes));
  const [liked, setLiked] = React.useState(FEED_POSTS.map(() => false));
  const [saved, setSaved] = React.useState(FEED_POSTS.map(() => false));
  const [following, setFollowing] = React.useState(FEED_POSTS.map(() => false));
  const [burstKey, setBurstKey] = React.useState(0);

  function nextPost() {
    setIdx(i => Math.min(i + 1, FEED_POSTS.length - 1));
  }
  function prevPost() {
    setIdx(i => Math.max(i - 1, 0));
  }

  // Wheel + touch swipe
  const touchStart = React.useRef(null);
  React.useEffect(() => {
    function handleWheel(e) {
      if (Math.abs(e.deltaY) < 30) return;
      if (e.deltaY > 0) nextPost(); else prevPost();
    }
    const el = document.getElementById('feed-container');
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: true });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  function toggleLike(i) {
    setLiked(s => s.map((v, j) => j === i ? !v : v));
    setLikes(s => s.map((v, j) => j === i ? v + (liked[i] ? -1 : 1) : v));
    if (!liked[i]) setBurstKey(k => k + 1);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0F0D0A', overflow: 'hidden' }}>
      {/* Feed container — vertical slider */}
      <div
        id="feed-container"
        onTouchStart={e => touchStart.current = e.touches[0].clientY}
        onTouchEnd={e => {
          if (touchStart.current == null) return;
          const dy = e.changedTouches[0].clientY - touchStart.current;
          if (dy < -40) nextPost();
          else if (dy > 40) prevPost();
          touchStart.current = null;
        }}
        style={{
          position: 'absolute', inset: 0,
          transition: 'transform 0.5s cubic-bezier(.2,.85,.25,1)',
        }}
      >
        {FEED_POSTS.map((post, i) => (
          <FeedPost
            key={post.id}
            post={post}
            active={i === idx}
            offset={i - idx}
            liked={liked[i]}
            likes={likes[i]}
            saved={saved[i]}
            following={following[i]}
            burstKey={burstKey}
            onToggleLike={() => toggleLike(i)}
            onToggleSave={() => setSaved(s => s.map((v, j) => j === i ? !v : v))}
            onToggleFollow={() => setFollowing(s => s.map((v, j) => j === i ? !v : v))}
          />
        ))}
      </div>

      {/* Progress dots — right side */}
      <div style={{
        position: 'absolute', top: '50%', right: 6, zIndex: 60,
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {FEED_POSTS.map((_, i) => (
          <div key={i} style={{
            width: 3, height: i === idx ? 22 : 6, borderRadius: 2,
            background: i === idx ? '#CCFF00' : 'rgba(255,255,255,0.3)',
            boxShadow: i === idx ? '0 0 6px #CCFF00' : 'none',
            transition: 'all 0.3s',
          }}/>
        ))}
      </div>

      {/* Top header — brand + notifications */}
      <div style={{
        position: 'absolute', top: 52, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 16px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15,
        }}>
          <div style={{ color: '#fff' }}>Para ti</div>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Siguiendo</div>
        </div>
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <Icon.bell size={16} color="#fff"/>
          <div style={{
            position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%',
            background: '#ff5577', boxShadow: '0 0 6px #ff5577',
            animation: 'pulse-glow 1.6s ease-in-out infinite',
          }}/>
        </button>
      </div>

      <TabBar active={active} onNavigate={onNavigate} />
    </div>
  );
}

function FeedPost({ post, active, offset, liked, likes, saved, following, burstKey, onToggleLike, onToggleSave, onToggleFollow }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateY(${offset * 100}%)`,
      transition: 'transform 0.5s cubic-bezier(.2,.85,.25,1)',
      zIndex: active ? 2 : 1,
    }}>
      {/* Photo — full-bleed */}
      <img src={post.bg} alt="" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        transform: active ? 'scale(1)' : 'scale(1.08)',
        transition: 'transform 0.8s',
        filter: 'contrast(1.1) saturate(1.15)',
      }}/>
      {/* Gradients */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 240,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent)',
      }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 360,
        background: 'linear-gradient(180deg, transparent, rgba(15,13,10,0.95) 75%, #0F0D0A 100%)',
      }}/>

      {/* Floating orange sparks */}
      {active && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[[12,28,2.5,3.2],[22,52,1.8,2.4],[78,36,2.2,2.8],[88,66,1.5,3.6],[35,18,2,2.2]].map(([x,y,s,d], i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${x}%`, top: `${y}%`,
              width: s, height: s, borderRadius: '50%',
              background: '#FFB800',
              boxShadow: '0 0 8px #FFB800, 0 0 16px #FFB800aa',
              animation: `twinkle ${d}s ease-in-out ${i*0.3}s infinite`,
            }}/>
          ))}
        </div>
      )}

      {/* Author pill */}
      <div style={{ position: 'absolute', top: 100, left: 14, zIndex: 5 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px 6px 6px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.12)',
          animation: active ? 'slide-up-fade 0.5s cubic-bezier(.2,.8,.2,1) 0.1s both' : 'none',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
          }}>
            <AvatarPhoto size={32} bg={post.avatarBg} seed={post.author}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.1 }}>{post.author}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1, fontFamily: 'Space Grotesk' }}>{post.team}</div>
          </div>
          <button onClick={onToggleFollow} style={{
            padding: '5px 12px', borderRadius: 999,
            background: following ? 'transparent' : '#CCFF00',
            border: following ? '1px solid rgba(255,255,255,0.3)' : 'none',
            color: following ? 'rgba(255,255,255,0.85)' : '#fff',
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
            cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 4,
          }}>{following ? 'Siguiendo' : 'Seguir'}</button>
        </div>
      </div>

      {/* Top-right stat chips */}
      <div style={{
        position: 'absolute', top: 104, right: 14, zIndex: 5,
        display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
      }}>
        <FloatingChip
          icon={<Icon.flame size={12} color="#FFB800"/>}
          value="10" label="días"
          color="#FFB800"
          style={{ padding: '5px 10px', animationDelay: '0s' }}
        />
        <FloatingChip
          icon={<Icon.star size={11} color="#FFB800"/>}
          label="Star Player"
          color="#FFB800"
          style={{ padding: '5px 10px', animationDelay: '0.3s' }}
        />
      </div>

      {/* Right action rail */}
      <div style={{
        position: 'absolute', right: 12, top: '42%', zIndex: 5,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <ActionBtn
          icon={<Icon.heart size={22} color={liked ? '#FF5B3A' : '#fff'} filled={liked}/>}
          label={likes > 999 ? `${(likes/1000).toFixed(1)}k` : likes}
          onClick={onToggleLike}
          animate={liked}
          ring={liked}
        />
        <ActionBtn icon={<Icon.chat size={22} color="#fff"/>} label={post.comments}/>
        <ActionBtn icon={<Icon.share size={20} color="#fff"/>}/>
        <ActionBtn
          icon={<Icon.bookmark size={20} color={saved ? '#FFB800' : '#fff'} filled={saved}/>}
          onClick={onToggleSave}
        />
        {/* Spinning music-disc style button */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #333, #111)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          animation: 'spin-slow 6s linear infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '8px auto 0',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#CCFF00',
            boxShadow: '0 0 6px #CCFF00',
          }}/>
        </div>
      </div>

      {/* Heart burst overlay */}
      {liked && active && (
        <div key={burstKey} style={{
          position: 'absolute', right: 30, top: '42%',
          pointerEvents: 'none', zIndex: 6,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              width: 40, height: 40,
              borderRadius: '50%',
              border: '2px solid #FF5B3A',
              animation: `pulse-ring 1.2s ease-out ${i * 0.15}s`,
              opacity: 0,
            }}/>
          ))}
        </div>
      )}

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 88, left: 14, right: 80, zIndex: 5,
      }}>
        <div style={{
          fontFamily: 'Archivo, sans-serif', fontWeight: 700,
          fontSize: 18, lineHeight: 1.25, color: '#fff',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          letterSpacing: '-0.01em',
          animation: active ? 'slide-up-fade 0.5s cubic-bezier(.2,.8,.2,1) 0.2s both' : 'none',
        }}>
          <span style={{ color: '#CCFF00' }}>¡{post.highlight}</span> {post.caption.replace(post.highlight, '').trim()}
        </div>
        <div style={{
          marginTop: 6,
          fontFamily: 'Space Grotesk', fontSize: 13,
          color: 'rgba(255,255,255,0.75)',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          animation: active ? 'slide-up-fade 0.5s cubic-bezier(.2,.8,.2,1) 0.3s both' : 'none',
        }}>{post.hashtags}</div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, animate, ring }) {
  const [press, setPress] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseDown={() => setPress(true)}
        onMouseUp={() => setPress(false)}
        onMouseLeave={() => setPress(false)}
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transform: press ? 'scale(0.9)' : 'none',
          animation: animate ? 'heartbeat 0.6s ease' : 'none',
          transition: 'transform 0.1s',
          position: 'relative',
        }}>
        {icon}
      </button>
      {label !== undefined && (
        <div style={{
          marginTop: 4,
          fontFamily: 'Space Grotesk', fontWeight: 700,
          fontSize: 11, color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}>{label}</div>
      )}
    </div>
  );
}

window.HomeScreen = HomeScreen;
