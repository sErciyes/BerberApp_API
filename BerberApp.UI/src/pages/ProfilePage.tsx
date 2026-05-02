import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/axiosClient";
import { getMe } from "../api/userApi";
import { Notice } from "../components/Notice";
import type { User } from "../types/user";

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((response) => setUser(response.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="narrow-page">
      <div className="page-heading">
        <h1>Profil</h1>
        <p>Token ile gelen kullanici bilgisini API'den dogrula.</p>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {user && (
        <div className="detail-list">
          <div><span>Ad Soyad</span><strong>{user.fullName}</strong></div>
          <div><span>Email</span><strong>{user.email}</strong></div>
          <div><span>Rol</span><strong>{user.role}</strong></div>
        </div>
      )}
    </div>
  );
}
