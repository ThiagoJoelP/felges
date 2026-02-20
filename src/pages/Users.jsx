function Users() {
  const mockUsers = [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', role: 'Admin', status: 'Activo' },
    { id: 2, name: 'María García', email: 'maria@email.com', role: 'Editor', status: 'Activo' },
    { id: 3, name: 'Carlos López', email: 'carlos@email.com', role: 'Viewer', status: 'Inactivo' },
    { id: 4, name: 'Ana Martínez', email: 'ana@email.com', role: 'Editor', status: 'Activo' },
  ]

  return (
    <div className="users-page">
      <header className="page-header">
        <h2>Usuarios</h2>
        <button className="btn-primary">+ Nuevo Usuario</button>
      </header>

      <div className="card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="badge">{user.role}</span></td>
                <td><span className={`status ${user.status === 'Activo' ? 'active' : 'inactive'}`}>{user.status}</span></td>
                <td>
                  <button className="btn-sm">Editar</button>
                  <button className="btn-sm btn-danger">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users
