import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { forgotPassword, resetPassword } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [token, setToken] = useState(() => searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword({ email });
      setSuccess(response.data?.message ?? response.message ?? "Sifre sifirlama maili gonderildi.");
      setToken(response.data?.developmentToken ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resetPassword({ email, token, newPassword });
      setSuccess(response.data?.message ?? response.message ?? "Sifre guncellendi. Yeni sifrenle giris yapabilirsin.");
      setToken("");
      setNewPassword("");
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
          <KeyRound size={17} />
          Sifre yenileme
        </div>
        <h1>Hesap guvenligini mail onayi ile koru.</h1>
        <p>
          Sifre sifirlama tokeni kullanicinin dogrulanmis email adresine gonderilir ve kisa sure icinde kullanilmalidir.
        </p>

        <div className="auth-metrics">
          <div>
            <strong>30 dk</strong>
            <span>Token suresi</span>
          </div>
          <div>
            <strong>BCrypt</strong>
            <span>Hash</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>Login</span>
          </div>
        </div>

        <div className="auth-feature">
          <MailCheck size={18} />
          Email dogrulanmadiysa sifre sifirlama baslatilmaz
        </div>
        <div className="auth-feature">
          <ShieldCheck size={18} />
          Tokenlar veritabaninda hashli saklanir
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Hesap kurtarma</span>
          <h2>Sifremi unuttum</h2>
          <p>Email adresine gelen token ile yeni sifre belirle.</p>
        </div>

        {error && <Notice type="error">{error}</Notice>}
        {success && <Notice type="success">{success}</Notice>}

        <form className="auth-form" onSubmit={handleRequest}>
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="secondary" disabled={loading}>
            Sifirlama Maili Gonder
          </Button>
          {token && (
            <div className="token-box">
              <span>Development sifre sifirlama tokeni</span>
              <strong>{token}</strong>
            </div>
          )}
        </form>

        <form className="auth-form auth-followup" onSubmit={handleReset}>
          <FormField label="Token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <FormField label="Yeni Sifre" type="password" value={newPassword} minLength={6} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" disabled={loading || !email}>
            Sifreyi Guncelle
          </Button>
          <p className="form-note">
            Sifreni hatirladin mi? <Link to="/login">Giris yap</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
