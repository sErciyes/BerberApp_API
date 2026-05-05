import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createBarber, deleteBarber, getBarbers, updateBarber } from "../api/barberApi";
import { getErrorMessage } from "../api/axiosClient";
import { getShops } from "../api/shopApi";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Notice } from "../components/Notice";
import type { Barber } from "../types/barber";
import type { Shop } from "../types/shop";

export function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [shopId, setShopId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadBarbers() {
    const response = await getBarbers();
    setBarbers(response.data ?? []);
  }

  useEffect(() => {
    loadBarbers().catch((err) => setError(getErrorMessage(err)));
    getShops()
      .then((response) => setShops(response.data ?? []))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  function resetForm() {
    setEditingId(null);
    setFullName("");
    setSpecialty("");
    setShopId("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        fullName,
        specialty,
        shopId: shopId ? Number(shopId) : null
      };

      if (editingId) {
        await updateBarber(editingId, payload);
        setMessage("Berber guncellendi.");
      } else {
        await createBarber(payload);
        setMessage("Berber eklendi.");
      }

      resetForm();
      await loadBarbers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteBarber(id);
      setMessage("Berber silindi.");
      await loadBarbers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Berber yonetimi</h1>
        <p>Admin rolundeki kullanicilar berber ekleyebilir, guncelleyebilir ve silebilir.</p>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <FormField label="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <FormField label="Uzmanlik" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
        <label className="field">
          <span>Dukkan</span>
          <select value={shopId} onChange={(e) => setShopId(e.target.value)}>
            <option value="">Dukkansiz</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">{editingId ? "Guncelle" : "Ekle"}</Button>
        {editingId && <Button type="button" variant="secondary" onClick={resetForm}>Vazgec</Button>}
      </form>

      {error && <Notice type="error">{error}</Notice>}
      {message && <Notice type="success">{message}</Notice>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Dukkan</th>
              <th>Uzmanlik</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((barber) => (
              <tr key={barber.id}>
                <td>{barber.fullName}</td>
                <td>{barber.shopName || "-"}</td>
                <td>{barber.specialty}</td>
                <td className="actions-cell">
                  <Button variant="secondary" onClick={() => {
                    setEditingId(barber.id);
                    setFullName(barber.fullName);
                    setSpecialty(barber.specialty);
                    setShopId(barber.shopId?.toString() ?? "");
                  }}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(barber.id)}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
