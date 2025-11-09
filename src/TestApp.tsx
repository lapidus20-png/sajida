export default function TestApp() {
  console.log('TestApp rendering');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        color: '#333',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', color: '#667eea' }}>
          ✅ BuilderHub fonctionne!
        </h1>
        <p style={{ margin: '0 0 1.5rem 0', color: '#666' }}>
          L'application React se charge correctement.
        </p>
        <div style={{
          background: '#f0f0f0',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          textAlign: 'left'
        }}>
          <p><strong>✅ React:</strong> Chargé</p>
          <p><strong>✅ Vite:</strong> Configuré</p>
          <p><strong>✅ TypeScript:</strong> Actif</p>
          <p style={{ margin: 0 }}><strong>✅ Tailwind:</strong> Prêt</p>
        </div>
        <button
          onClick={() => {
            console.log('Button clicked');
            window.location.href = '/';
          }}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Charger l'application complète
        </button>
      </div>
    </div>
  );
}
