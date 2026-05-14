import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, LockKeyhole, Scissors } from "lucide-react";
import { register, requestPhoneVerification, resendEmailVerification, verifyEmail, verifyPhone } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"User" | "Barber">("User");
  const [specialty, setSpecialty] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await register({ fullName, email, phoneNumber, password, accountType, specialty });
      setSuccess(response.data?.message ?? response.message ?? "Kayıt başarılı. Email doğrulama gerekli.");
      setPhoneCode(response.data?.developmentToken ?? "");
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
      setSuccess(response.data?.message ?? response.message ?? "Email doğrulandı. Giriş yapabilirsin.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resendEmailVerification({ email });
      setSuccess(response.data?.message ?? response.message ?? "Doğrulama maili tekrar gönderildi.");
      setVerificationToken(response.data?.developmentToken ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestPhoneCode() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await requestPhoneVerification({ phoneNumber });
      setSuccess(response.data?.message ?? response.message ?? "Telefon doğrulama kodu gönderildi.");
      setPhoneCode(response.data?.developmentToken ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPhone(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyPhone({ phoneNumber, code: phoneCode });
      setSuccess(response.data?.message ?? response.message ?? "Telefon numarası doğrulandı.");
      setPhoneCode("");
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
        <h1>Berber randevuları için sade bir kontrol merkezi.</h1>
        <p>
          Kullanıcı randevu alır, berber kendi mesajlarını yanıtlar. Admin rol yönetimi API üzerinden kontrollü yapılır.
        </p>

        <div className="auth-metrics">
          <div>
            <strong>User</strong>
            <span>Randevu</span>
          </div>
          <div>
            <strong>Barber</strong>
            <span>Mesaj</span>
          </div>
          <div>
            <strong>Admin</strong>
            <span>Yönetim</span>
          </div>
        </div>

        <div className="auth-feature">
          <LockKeyhole size={18} />
          Şifreler BCrypt ile hashlenir, response içinde asla dönmez
        </div>
        <div className="auth-feature">
          <CalendarClock size={18} />
          Randevu kuralları backend tarafında merkezi olarak korunur
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>Başlayalım</span>
          <h2>Kayıt ol</h2>
          <p>Kullanıcı veya berber hesabı oluştur.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <Notice type="error">{error}</Notice>}
          {success && <Notice type="success">{success}</Notice>}
          <div className="segmented-control" aria-label="Hesap tipi">
            <button
              className={accountType === "User" ? "active" : ""}
              type="button"
              onClick={() => setAccountType("User")}
            >
              Kullanıcı
            </button>
            <button
              className={accountType === "Barber" ? "active" : ""}
              type="button"
              onClick={() => setAccountType("Barber")}
            >
              Berber
            </button>
          </div>
          <FormField label="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormField label="Telefon" value={phoneNumber} placeholder="05xx xxx xx xx" onChange={(e) => setPhoneNumber(e.target.value)} required />
          {accountType === "Barber" && (
            <FormField label="Uzmanlık" value={specialty} placeholder="Sakal tıraş, saç kesim" onChange={(e) => setSpecialty(e.target.value)} />
          )}
          <FormField label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <Button type="submit" disabled={loading}>
            {loading ? "Kayıt yapılıyor" : "Kayıt ol"}
          </Button>
          {verificationToken && (
            <div className="token-box">
              <span>Development doğrulama tokeni</span>
              <strong>{verificationToken}</strong>
            </div>
          )}
        </form>

        <form className="auth-form auth-followup" onSubmit={handleVerify}>
          <FormField label="Email doğrulama tokeni" value={verificationToken} onChange={(e) => setVerificationToken(e.target.value)} required />
          <Button type="submit" variant="secondary" disabled={loading || !email}>
            Email doğrula
          </Button>
          <Button type="button" variant="ghost" disabled={loading || !email} onClick={handleResend}>
            Doğrulama Mailini Tekrar Gönder
          </Button>
          <p className="form-note">
            Hesabın var mı? <Link to="/login">Giriş yap</Link>
          </p>
        </form>

        <form className="auth-form auth-followup" onSubmit={handleVerifyPhone}>
          {phoneCode && (
            <div className="token-box">
              <span>Development SMS kodu</span>
              <strong>{phoneCode}</strong>
            </div>
          )}
          <FormField label="Telefon doğrulama kodu" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} minLength={6} maxLength={6} required />
          <Button type="submit" variant="secondary" disabled={loading || !phoneNumber}>
            Telefonu Doğrula
          </Button>
          <Button type="button" variant="ghost" disabled={loading || !phoneNumber} onClick={handleRequestPhoneCode}>
            SMS Kodunu Tekrar Gönder
          </Button>
        </form>
      </section>
    </div>
  );
}
