import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="narrow-page">
      <div className="page-heading">
        <h1>Giris</h1>
        <p>Randevu olusturmak ve paneli kullanmak icin giris yap.</p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        {error && <Notice type="error">{error}</Notice>}
        <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <FormField label="Sifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading}>
          {loading ? "Giris yapiliyor" : "Giris yap"}
        </Button>
      </form>
    </div>
  );
}
