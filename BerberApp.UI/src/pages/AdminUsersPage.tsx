import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/axiosClient";
import { getUsers, updateUserRole } from "../api/userApi";
import { Notice } from "../components/Notice";
import type { User } from "../types/user";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    const response = await getUsers();
    setUsers(response.data ?? []);
  }

  useEffect(() => {
    loadUsers().catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleRoleChange(user: User, role: "User" | "Admin") {
    setError("");
    setMessage("");

    try {
      await updateUserRole(user.id, role);
      setMessage(`${user.email} rolü güncellendi.`);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Kullanıcı yönetimi</h1>
        <p>Kullanıcı rollerini User veya Admin olarak güncelle.</p>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user, e.target.value as "User" | "Admin")}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
