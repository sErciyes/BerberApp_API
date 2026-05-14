import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";
import { login } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login({ emailOrPhone, password });

      if (response.data) {
        signIn(response.data);
        navigate("/barbers");
      }
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
          <Sparkles size={17} />
          BerberApp Panel
        </div>
        <h1>Randevu operasyonunu tek ekrandan yönet.</h1>
        <p>
          Kullanıcı randevuları, berber takibi ve admin onay akışı sade bir SaaS panelinde buluşur.
        </p>

        <div className="auth-metrics">
          <div>
            <strong>09:00</strong>
            <span>Başlangıç</span>
          </div>
          <div>
            <strong>30 dk</strong>
            <span>Slot</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>Güvenlik</span>
          </div>
        </div>

        <div className="auth-feature">
          <ShieldCheck size={18} />
          Admin ve User rolleriyle ayrılmış temiz yetki akışı
        </div>
        <div className="auth-feature">
          <CalendarCheck size={18} />
          Çakışma kontrolü olan randevu oluşturma deneyimi
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Hoş geldin</span>
          <h2>Giriş yap</h2>
          <p>Devam etmek için hesabını kullan.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <Notice type="error">{error}</Notice>}
          <FormField label="Email veya Telefon" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
          <FormField label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor" : "Giriş yap"}
          </Button>
          <p className="form-note auth-link-row">
            <Link to="/forgot-password">Şifremi unuttum</Link>
            <Link to="/register">Kayıt ol</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
