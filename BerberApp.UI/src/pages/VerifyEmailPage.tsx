import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { verifyEmail } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { Notice } from "../components/Notice";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = searchParams.get("email") ?? "";
    const token = searchParams.get("token") ?? "";

    if (!email || !token) {
      setError("Email dogrulama linki eksik veya hatali.");
      setLoading(false);
      return;
    }

    verifyEmail({ email, token })
      .then((response) => {
        setSuccess(response.data?.message ?? response.message ?? "Email dogrulandi. Giris yapabilirsin.");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-kicker">
          <MailCheck size={17} />
          Email dogrulama
        </div>
        <h1>Hesabini tek tikla aktiflestir.</h1>
        <p>Mailindeki dogrulama linki BerberApp API tarafindan kontrol edilir ve hesap girise acilir.</p>

        <div className="auth-metrics">
          <div>
            <strong>24 saat</strong>
            <span>Link suresi</span>
          </div>
          <div>
            <strong>Hash</strong>
            <span>Token saklama</span>
          </div>
          <div>
            <strong>JWT</strong>
            <span>Sonraki adim</span>
          </div>
        </div>

        <div className="auth-feature">
          <ShieldCheck size={18} />
          Dogrulama tokeni veritabaninda hashli tutulur
        </div>
        <div className="auth-feature">
          <Sparkles size={18} />
          Kod kopyalamadan modern hesap aktivasyonu
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Hesap aktivasyonu</span>
          <h2>{loading ? "Dogrulaniyor" : "Dogrulama sonucu"}</h2>
          <p>Link bilgileri backend tarafinda kontrol ediliyor.</p>
        </div>

        {loading && <Notice>Mail dogrulama islemi yapiliyor...</Notice>}
        {error && <Notice type="error">{error}</Notice>}
        {success && <Notice type="success">{success}</Notice>}

        <p className="form-note">
          <Link to="/login">Giris ekranina don</Link>
        </p>
      </section>
    </div>
  );
}
