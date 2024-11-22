import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineLogout, AiOutlineHome } from "react-icons/ai";
import "./Profile.css";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "Utilisateur inconnu",
    email: "Non disponible",
    usedStorage: 0,
    totalStorage: 0,
  });
  const [invoices, setInvoices] = useState([]); // Gestion des factures
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserInfo(response.data);
    } catch (err) {
      console.error("Erreur de récupération des informations utilisateur:", err);
      setError("Impossible de récupérer vos informations.");
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/invoices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvoices(response.data.invoices || []);
    } catch (err) {
      console.error("Erreur de récupération des factures:", err);
      setError("Impossible de récupérer vos factures.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchUserInfo();
    fetchInvoices();
  }, []);

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div>
          <h2>Profil de {userInfo?.name}</h2>
          <p>Email: {userInfo?.email}</p>
        </div>
        <div className="profile-icons">
          <button
            onClick={() => navigate("/dashboard")}
            className="icon-button"
            aria-label="Dashboard"
          >
            <AiOutlineHome />
          </button>
          <button
            onClick={handleLogout}
            className="icon-button logout-button"
            aria-label="Déconnexion"
          >
            <AiOutlineLogout />
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="profile-content">
        <div className="profile-storage">
          <h3>Stockage</h3>
          <p>
            <strong>Utilisé :</strong> {userInfo?.usedStorage} MB / {userInfo?.totalStorage} MB
          </p>
          <button
            className="upgrade-button"
            onClick={() => navigate("/upgrade")}
          >
            Augmenter mon stockage
          </button>
        </div>

        <div className="profile-invoices">
          <h3>Vos Factures</h3>
          {invoices.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td>€{parseFloat(invoice.amount).toFixed(2)}</td>
                    <td>
                      <button
                        className="download-button"
                        onClick={() =>
                          window.open(`http://localhost:5000/api/invoice/${invoice.id}`)
                        }
                      >
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Vous n'avez aucune facture.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
