import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

  return (
    <div>
      <div className="page-heading">
        <h1>Profil</h1>
        <p>Hesap bilgilerini guncelle ve mevcut rolunu kontrol et.</p>
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {success && <Notice type="success">{success}</Notice>}
      {phoneMessage && <Notice type="success">{phoneMessage}</Notice>}
      {passwordMessage && <Notice type="success">{passwordMessage}</Notice>}
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
            <FormField
              label="Telefon"
              name="phoneNumber"
              value={phoneNumber}
              maxLength={20}
              placeholder="05xx xxx xx xx"
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Profili Guncelle"}
            </Button>
          </form>

          <div className="profile-stack">
            <div className="detail-list">
              <div><span>Ad Soyad</span><strong>{user.fullName}</strong></div>
              <div><span>Email</span><strong>{user.email}</strong></div>
              <div><span>Email Durumu</span><strong>{user.emailConfirmed ? "Dogrulandi" : "Bekliyor"}</strong></div>
              <div><span>Telefon</span><strong>{user.phoneNumber || "-"}</strong></div>
              <div><span>Telefon Durumu</span><strong>{user.phoneNumberConfirmed ? "Dogrulandi" : "Bekliyor"}</strong></div>
              <div><span>Rol</span><strong>{user.role}</strong></div>
            </div>

            <form className="form-panel" onSubmit={handleVerifyPhone}>
              {phoneCode && (
                <div className="token-box">
                  <span>Development SMS kodu</span>
                  <strong>{phoneCode}</strong>
                </div>
              )}
              <FormField
                label="Telefon Dogrulama Kodu"
                value={phoneCode}
                minLength={6}
                maxLength={6}
                onChange={(event) => setPhoneCode(event.target.value)}
                required
              />
              <Button type="submit" variant="secondary" disabled={isPhoneSaving || !phoneNumber}>
                Telefonu Dogrula
              </Button>
              <Button type="button" variant="ghost" disabled={isPhoneSaving || !phoneNumber} onClick={handleRequestPhoneCode}>
                SMS Kodu Gonder
              </Button>
            </form>

            <form className="form-panel" onSubmit={handlePasswordChangeRequest}>
              <FormField
                label="Mevcut Sifre"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
              <FormField
                label="Yeni Sifre"
                type="password"
                value={newPassword}
                minLength={6}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <Button type="submit" variant="secondary" disabled={isPasswordSaving}>
                Mail Onayi Iste
              </Button>
            </form>

            {(passwordChangeToken || currentPassword || newPassword) && (
              <form className="form-panel" onSubmit={handlePasswordChangeConfirm}>
                {passwordChangeToken && (
                  <div className="token-box">
                    <span>Mail linkinden gelen onay tokeni</span>
                    <strong>{passwordChangeToken}</strong>
                  </div>
                )}
                <FormField
                  label="Mail Onay Tokeni"
                  value={passwordChangeToken}
                  onChange={(event) => setPasswordChangeToken(event.target.value)}
                  required
                />
                <Button type="submit" disabled={isPasswordSaving || !passwordChangeToken}>
                  Sifre Degisikligini Onayla
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
