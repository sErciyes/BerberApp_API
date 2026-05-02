import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { getErrorMessage } from "../api/axiosClient";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({ fullName, email, password });
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="narrow-page">
      <div className="page-heading">
        <h1>Kayit</h1>
        <p>Yeni kullanici hesabi olustur.</p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        {error && <Notice type="error">{error}</Notice>}
        <FormField label="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormField label="Sifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        <Button type="submit" disabled={loading}>
          {loading ? "Kayit yapiliyor" : "Kayit ol"}
        </Button>
        <p className="form-note">
          Hesabin var mi? <Link to="/login">Giris yap</Link>
        </p>
      </form>
    </div>
  );
}
