function Settings() {
  return (
    <div className="settings-page">
      <header className="page-header">
        <h2>Configuración</h2>
      </header>

      <div className="settings-grid">
        <div className="card">
          <h3>🔥 Firebase</h3>
          <p>Configurá tu conexión a Firebase editando <code>src/firebase/config.js</code> o usando variables de entorno en Vercel.</p>
          <div className="env-list">
            <code>VITE_FIREBASE_API_KEY</code>
            <code>VITE_FIREBASE_AUTH_DOMAIN</code>
            <code>VITE_FIREBASE_PROJECT_ID</code>
            <code>VITE_FIREBASE_STORAGE_BUCKET</code>
            <code>VITE_FIREBASE_MESSAGING_SENDER_ID</code>
            <code>VITE_FIREBASE_APP_ID</code>
          </div>
        </div>

        <div className="card">
          <h3>⚡ General</h3>
          <div className="setting-item">
            <label>Nombre de la App</label>
            <input type="text" defaultValue="Felges" />
          </div>
          <div className="setting-item">
            <label>Tema</label>
            <select defaultValue="dark">
              <option value="dark">Oscuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
