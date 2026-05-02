import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/axiosClient";
import { getMe, updateProfile } from "../api/userApi";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/user";

export function ProfilePage() {
  const { updateAuth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMe()
      .then((response) => {
        if (!response.data) {
          setError(response.message ?? "Profil bilgisi alinamadi.");
          return;
        }

        setUser(response.data);
        setFullName(response.data.fullName);
        setEmail(response.data.email);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await updateProfile({
        fullName: fullName.trim(),
        email: email.trim()
      });

      if (!response.data) {
        setError(response.message ?? "Profil guncellenemedi.");
        return;
      }

      setUser(response.data);
      updateAuth({
        fullName: response.data.fullName,
        email: response.data.email
      });
      setSuccess(response.message ?? "Profil guncellendi.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Profil</h1>
        <p>Hesap bilgilerini guncelle ve mevcut rolunu kontrol et.</p>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {success && <Notice type="success">{success}</Notice>}
      {user && (
        <div className="profile-grid">
          <form className="form-panel" onSubmit={handleSubmit}>
            <FormField
              label="Ad Soyad"
              name="fullName"
              value={fullName}
              maxLength={50}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={email}
              maxLength={150}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Profili Guncelle"}
            </Button>
          </form>

          <div className="detail-list">
            <div><span>Ad Soyad</span><strong>{user.fullName}</strong></div>
            <div><span>Email</span><strong>{user.email}</strong></div>
            <div><span>Rol</span><strong>{user.role}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
