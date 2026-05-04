import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, KeyRound, MailCheck, Phone, ShieldCheck, UserRound } from "lucide-react";
import { confirmPasswordChange, requestPasswordChange, requestPhoneVerification, verifyPhone } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { getMe, updateProfile } from "../api/userApi";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/user";

export function ProfilePage() {
  const { updateAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "verification" | "security">("profile");
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeToken, setPasswordChangeToken] = useState(() => searchParams.get("passwordChangeToken") ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [phoneMessage, setPhoneMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPhoneSaving, setIsPhoneSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("passwordChangeToken");

    if (tokenFromUrl) {
      setPasswordChangeToken(tokenFromUrl);
      setPasswordMessage("Mail linkindeki onay tokeni forma yerlestirildi. Sifre degisikligini tamamlamak icin onayla.");
      setActiveTab("security");
    }

    getMe()
      .then((response) => {
        if (!response.data) {
          setError(response.message ?? "Profil bilgisi alinamadi.");
          return;
        }

        setUser(response.data);
        setFullName(response.data.fullName);
        setEmail(response.data.email);
        setPhoneNumber(response.data.phoneNumber ?? "");
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
        email: email.trim(),
        phoneNumber: phoneNumber.trim()
      });

      if (!response.data) {
        setError(response.message ?? "Profil guncellenemedi.");
        return;
      }

      setUser(response.data);
      updateAuth({
        fullName: response.data.fullName,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber
      });
      setSuccess(response.message ?? "Profil guncellendi.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestPhoneCode() {
    setError("");
    setPhoneMessage("");
    setIsPhoneSaving(true);

    try {
      const response = await requestPhoneVerification({ phoneNumber });
      setPhoneMessage(response.data?.message ?? response.message ?? "Telefon dogrulama kodu gonderildi.");
      setPhoneCode(response.data?.developmentToken ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPhoneSaving(false);
    }
  }

  async function handleVerifyPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPhoneMessage("");
    setIsPhoneSaving(true);

    try {
      const response = await verifyPhone({ phoneNumber, code: phoneCode });
      setPhoneMessage(response.data?.message ?? response.message ?? "Telefon numarasi dogrulandi.");
      setPhoneCode("");
      const me = await getMe();
      if (me.data) {
        setUser(me.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPhoneSaving(false);
    }
  }

  async function handlePasswordChangeRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPasswordMessage("");
    setIsPasswordSaving(true);

    try {
      const response = await requestPasswordChange({ currentPassword, newPassword });
      setPasswordMessage(response.data?.message ?? response.message ?? "Onay maili gonderildi.");
      setPasswordChangeToken(response.data?.developmentToken ?? "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPasswordSaving(false);
    }
  }

  async function handlePasswordChangeConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPasswordMessage("");
    setIsPasswordSaving(true);

    try {
      const response = await confirmPasswordChange({ token: passwordChangeToken });
      setPasswordMessage(response.data?.message ?? response.message ?? "Sifre guncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordChangeToken("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPasswordSaving(false);
    }
  }

  const verificationScore = user
    ? Number(user.emailConfirmed) + Number(user.phoneNumberConfirmed)
    : 0;

  return (
    <div className="center-page">
      <div className="account-hero">
        <div className="account-avatar">
          <UserRound size={26} />
        </div>
        <div>
          <span className="muted">Hesap merkezi</span>
          <h1>Profil</h1>
          <p>Kimlik, dogrulama ve guvenlik ayarlarini tek yerden yonet.</p>
        </div>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {success && <Notice type="success">{success}</Notice>}
      {phoneMessage && <Notice type="success">{phoneMessage}</Notice>}
      {passwordMessage && <Notice type="success">{passwordMessage}</Notice>}
      {user && (
        <div className="account-shell">
          <div className="account-summary">
            <div className="summary-card">
              <span>Rol</span>
              <strong>{user.role}</strong>
            </div>
            <div className="summary-card">
              <span>Dogrulama</span>
              <strong>{verificationScore}/2</strong>
            </div>
            <div className="summary-card">
              <span>Telefon</span>
              <strong>{user.phoneNumberConfirmed ? "Aktif" : "Bekliyor"}</strong>
            </div>
          </div>

          <div className="account-tabs" role="tablist" aria-label="Profil bolumleri">
            <button className={activeTab === "profile" ? "active" : ""} type="button" onClick={() => setActiveTab("profile")}>
              <UserRound size={17} />
              Profil Bilgileri
            </button>
            <button className={activeTab === "verification" ? "active" : ""} type="button" onClick={() => setActiveTab("verification")}>
              <ShieldCheck size={17} />
              Dogrulamalar
            </button>
            <button className={activeTab === "security" ? "active" : ""} type="button" onClick={() => setActiveTab("security")}>
              <KeyRound size={17} />
              Guvenlik
            </button>
          </div>

          {activeTab === "profile" && (
            <div className="account-section">
              <form className="form-panel" onSubmit={handleSubmit}>
                <div className="section-heading">
                  <h2>Temel Bilgiler</h2>
                  <p>Randevu ve bildirimlerde kullanilacak hesap bilgileri.</p>
                </div>
                <FormField label="Ad Soyad" name="fullName" value={fullName} maxLength={50} onChange={(event) => setFullName(event.target.value)} required />
                <FormField label="Email" name="email" type="email" value={email} maxLength={150} onChange={(event) => setEmail(event.target.value)} required />
                <FormField label="Telefon" name="phoneNumber" value={phoneNumber} maxLength={20} placeholder="05xx xxx xx xx" onChange={(event) => setPhoneNumber(event.target.value)} required />
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Kaydediliyor..." : "Profili Guncelle"}
                </Button>
              </form>

              <div className="detail-list">
                <div><span>Ad Soyad</span><strong>{user.fullName}</strong></div>
                <div><span>Email</span><strong>{user.email}</strong></div>
                <div><span>Telefon</span><strong>{user.phoneNumber || "-"}</strong></div>
                <div><span>Rol</span><strong>{user.role}</strong></div>
              </div>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="account-section">
              <div className="verification-list">
                <div className="verification-item">
                  <MailCheck size={22} />
                  <div>
                    <strong>Email dogrulama</strong>
                    <span>{user.email}</span>
                  </div>
                  <span className={user.emailConfirmed ? "status-chip success" : "status-chip warning"}>
                    {user.emailConfirmed ? "Dogrulandi" : "Bekliyor"}
                  </span>
                </div>
                <div className="verification-item">
                  <Phone size={22} />
                  <div>
                    <strong>Telefon dogrulama</strong>
                    <span>{user.phoneNumber || "Telefon eklenmedi"}</span>
                  </div>
                  <span className={user.phoneNumberConfirmed ? "status-chip success" : "status-chip warning"}>
                    {user.phoneNumberConfirmed ? "Dogrulandi" : "Bekliyor"}
                  </span>
                </div>
              </div>

              <form className="form-panel" onSubmit={handleVerifyPhone}>
                <div className="section-heading">
                  <h2>Telefon Onayi</h2>
                  <p>Development ortaminda SMS kodu ekranda gosterilir, production icin SMS provider baglanabilir.</p>
                </div>
                {phoneCode && (
                  <div className="token-box">
                    <span>Development SMS kodu</span>
                    <strong>{phoneCode}</strong>
                  </div>
                )}
                <FormField label="Telefon Dogrulama Kodu" value={phoneCode} minLength={6} maxLength={6} onChange={(event) => setPhoneCode(event.target.value)} required />
                <Button type="submit" variant="secondary" disabled={isPhoneSaving || !phoneNumber}>
                  Telefonu Dogrula
                </Button>
                <Button type="button" variant="ghost" disabled={isPhoneSaving || !phoneNumber} onClick={handleRequestPhoneCode}>
                  SMS Kodu Gonder
                </Button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="account-section">
              <form className="form-panel" onSubmit={handlePasswordChangeRequest}>
                <div className="section-heading">
                  <h2>Sifre Degisikligi</h2>
                  <p>Yeni sifre, email onay linki tamamlanana kadar aktif olmaz.</p>
                </div>
                <FormField label="Mevcut Sifre" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                <FormField label="Yeni Sifre" type="password" value={newPassword} minLength={6} onChange={(event) => setNewPassword(event.target.value)} required />
                <Button type="submit" variant="secondary" disabled={isPasswordSaving}>
                  Mail Onayi Iste
                </Button>
              </form>

              {(passwordChangeToken || currentPassword || newPassword) && (
                <form className="form-panel" onSubmit={handlePasswordChangeConfirm}>
                  <div className="section-heading">
                    <h2>Mail Onayi</h2>
                    <p>Maildeki onay linki buraya tokeni otomatik yerlestirir.</p>
                  </div>
                  {passwordChangeToken && (
                    <div className="token-box">
                      <span>Mail linkinden gelen onay tokeni</span>
                      <strong>{passwordChangeToken}</strong>
                    </div>
                  )}
                  <FormField label="Mail Onay Tokeni" value={passwordChangeToken} onChange={(event) => setPasswordChangeToken(event.target.value)} required />
                  <Button type="submit" disabled={isPasswordSaving || !passwordChangeToken}>
                    Sifre Degisikligini Onayla
                  </Button>
                </form>
              )}

              <div className="security-note">
                <CheckCircle2 size={20} />
                <span>Sifreler BCrypt ile hashlenir, tokenlar veritabaninda hashli saklanir.</span>
              </div>
            </div>
          )}
          </div>
      )}
    </div>
  );
}
