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
      setSuccess(response.data?.message ?? response.message ?? "Şifre sıfırlama maili gönderildi.");
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
      setSuccess(response.data?.message ?? response.message ?? "Şifre güncellendi. Yeni şifrenle giriş yapabilirsin.");
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
          Şifre yenileme
        </div>
        <h1>Hesap güvenliğini mail onayı ile koru.</h1>
        <p>
          Şifre sıfırlama tokeni kullanıcının doğrulanmış email adresine gönderilir ve kısa süre içinde kullanılmalıdır.
        </p>

        <div className="auth-metrics">
          <div>
            <strong>30 dk</strong>
            <span>Token süresi</span>
          </div>
          <div>
            <strong>BCrypt</strong>
            <span>Hash</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>Giriş Yap</span>
          </div>
        </div>

        <div className="auth-feature">
          <MailCheck size={18} />
          Email doğrulanmadıysa şifre sıfırlama başlatılmaz
        </div>
        <div className="auth-feature">
          <ShieldCheck size={18} />
          Tokenlar veritabanında hashli saklanır
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Hesap kurtarma</span>
          <h2>Şifremi unuttum</h2>
          <p>Email adresine gelen token ile yeni şifre belirle.</p>
        </div>

        {error && <Notice type="error">{error}</Notice>}
        {success && <Notice type="success">{success}</Notice>}

        <form className="auth-form" onSubmit={handleRequest}>
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="secondary" disabled={loading}>
            Sıfırlama Maili Gönder
          </Button>
          {token && (
            <div className="token-box">
              <span>Development şifre sıfırlama tokeni</span>
              <strong>{token}</strong>
            </div>
          )}
        </form>

        <form className="auth-form auth-followup" onSubmit={handleReset}>
          <FormField label="Token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <FormField label="Yeni Şifre" type="password" value={newPassword} minLength={6} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" disabled={loading || !email}>
            Şifreyi Güncelle
          </Button>
          <p className="form-note">
            Şifreni hatırladın mı? <Link to="/login">Giriş yap</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
