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
      setSuccess(response.data?.message ?? response.message ?? "Kayit basarili. Email dogrulama gerekli.");
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
      setSuccess(response.data?.message ?? response.message ?? "Email dogrulandi. Giris yapabilirsin.");
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
      setSuccess(response.data?.message ?? response.message ?? "Dogrulama maili tekrar gonderildi.");
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
      setSuccess(response.data?.message ?? response.message ?? "Telefon dogrulama kodu gonderildi.");
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
      setSuccess(response.data?.message ?? response.message ?? "Telefon numarasi dogrulandi.");
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
        <h1>Berber randevulari icin sade bir kontrol merkezi.</h1>
        <p>
          Kullanici randevu alir, berber kendi mesajlarini yanitlar. Admin rol yonetimi API uzerinden kontrollu yapilir.
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
            <span>Yonetim</span>
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
          <p>Kullanici veya berber hesabi olustur.</p>
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
              Kullanici
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
            <FormField label="Uzmanlik" value={specialty} placeholder="Sakal tras, sac kesim" onChange={(e) => setSpecialty(e.target.value)} />
          )}
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
          <Button type="button" variant="ghost" disabled={loading || !email} onClick={handleResend}>
            Dogrulama Mailini Tekrar Gonder
          </Button>
          <p className="form-note">
            Hesabin var mi? <Link to="/login">Giris yap</Link>
          </p>
        </form>

        <form className="auth-form auth-followup" onSubmit={handleVerifyPhone}>
          {phoneCode && (
            <div className="token-box">
              <span>Development SMS kodu</span>
              <strong>{phoneCode}</strong>
            </div>
          )}
          <FormField label="Telefon dogrulama kodu" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} minLength={6} maxLength={6} required />
          <Button type="submit" variant="secondary" disabled={loading || !phoneNumber}>
            Telefonu Dogrula
          </Button>
          <Button type="button" variant="ghost" disabled={loading || !phoneNumber} onClick={handleRequestPhoneCode}>
            SMS Kodunu Tekrar Gonder
          </Button>
        </form>
      </section>
    </div>
  );
}
