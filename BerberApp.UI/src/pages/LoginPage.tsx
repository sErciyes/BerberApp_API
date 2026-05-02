import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login({ email, password });

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
        <h1>Randevu operasyonunu tek ekrandan yonet.</h1>
        <p>
          Kullanici randevulari, berber takibi ve admin onay akisi sade bir SaaS panelinde bulusur.
        </p>

        <div className="auth-metrics">
          <div>
            <strong>09:00</strong>
            <span>Baslangic</span>
          </div>
          <div>
            <strong>30 dk</strong>
            <span>Slot</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>Guvenlik</span>
          </div>
        </div>

        <div className="auth-feature">
          <ShieldCheck size={18} />
          Admin ve User rolleriyle ayrilmis temiz yetki akisi
        </div>
        <div className="auth-feature">
          <CalendarCheck size={18} />
          Cakisma kontrolu olan randevu olusturma deneyimi
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Hos geldin</span>
          <h2>Giris yap</h2>
          <p>Devam etmek icin hesabini kullan.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <Notice type="error">{error}</Notice>}
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormField label="Sifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={loading}>
            {loading ? "Giris yapiliyor" : "Giris yap"}
          </Button>
        </form>
      </section>
    </div>
  );
}
