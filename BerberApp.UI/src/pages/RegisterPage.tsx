import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, LockKeyhole, Scissors } from "lucide-react";
import { register, verifyEmail } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await register({ fullName, email, password });
      setSuccess(response.data?.message ?? response.message ?? "Kayit basarili. Email dogrulama gerekli.");
      setVerificationToken(response.data?.developmentToken ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyEmail({ email, token: verificationToken });
      setSuccess(response.data?.message ?? response.message ?? "Email dogrulandi. Giris yapabilirsin.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-kicker">
          <Scissors size={17} />
          Yeni hesap
        </div>
        <h1>Berber randevulari icin sade bir kontrol merkezi.</h1>
        <p>
          Kayit olan kullanicilar User rolunde baslar. Admin rol yonetimi API uzerinden kontrollu yapilir.
        </p>

        <div className="auth-metrics">
          <div>
            <strong>User</strong>
            <span>Varsayilan</span>
          </div>
          <div>
            <strong>Admin</strong>
            <span>Yonetim</span>
          </div>
          <div>
            <strong>BCrypt</strong>
            <span>Sifreleme</span>
          </div>
        </div>

        <div className="auth-feature">
          <LockKeyhole size={18} />
          Sifreler BCrypt ile hashlenir, response icinde asla donmez
        </div>
        <div className="auth-feature">
          <CalendarClock size={18} />
          Randevu kurallari backend tarafinda merkezi olarak korunur
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Baslayalim</span>
          <h2>Kayit ol</h2>
          <p>Yeni kullanici hesabi olustur.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <Notice type="error">{error}</Notice>}
          {success && <Notice type="success">{success}</Notice>}
          <FormField label="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormField label="Sifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <Button type="submit" disabled={loading}>
            {loading ? "Kayit yapiliyor" : "Kayit ol"}
          </Button>
          {verificationToken && (
            <div className="token-box">
              <span>Development dogrulama tokeni</span>
              <strong>{verificationToken}</strong>
            </div>
          )}
        </form>

        <form className="auth-form auth-followup" onSubmit={handleVerify}>
          <FormField label="Email dogrulama tokeni" value={verificationToken} onChange={(e) => setVerificationToken(e.target.value)} required />
          <Button type="submit" variant="secondary" disabled={loading || !email}>
            Email dogrula
          </Button>
          <p className="form-note">
            Hesabin var mi? <Link to="/login">Giris yap</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
