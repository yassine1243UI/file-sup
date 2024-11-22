import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineSearch,
  AiOutlineFile,
  AiOutlineCalendar,
  AiOutlineSortAscending,
} from "react-icons/ai";
import "./Dashboard.css";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    total_files: 0,
    total_storage_mb: 0,
    total_storage_limit_mb: 0,
  });
  const [filter, setFilter] = useState({
    format: "",
    search: "",
    sortBy: "uploaded_at",
    order: "ASC",
  });

  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: filter,
      });
      setFiles(response.data.files || []);
    } catch (error) {
      console.error("Erreur de récupération des fichiers", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Erreur de récupération des statistiques", error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [filter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h2>Bonjour, Utilisateur</h2>
          <span>Dashboard de l'utilisateur</span>
        </div>
        <div className="dashboard-icons">
          <button
            onClick={() => navigate("/profile")}
            className="icon-button"
            aria-label="Profil"
          >
            <AiOutlineUser />
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
      <div className="toolbar">
        <div className="filters">
          <div className="filter-item">
            <AiOutlineSearch className="filter-icon" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filter.search}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          <div className="filter-item">
            <AiOutlineFile className="filter-icon" />
            <select
              value={filter.format}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, format: e.target.value }))
              }
            >
              <option value="">Format</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div className="filter-item">
            <AiOutlineCalendar className="filter-icon" />
            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, sortBy: e.target.value }))
              }
            >
              <option value="uploaded_at">Trier par Date</option>
              <option value="size">Trier par Taille</option>
            </select>
          </div>

          <div className="filter-item">
            <AiOutlineSortAscending className="filter-icon" />
            <select
              value={filter.order}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, order: e.target.value }))
              }
            >
              <option value="ASC">Croissant</option>
              <option value="DESC">Décroissant</option>
            </select>
          </div>
        </div>

        <button className="upload-button">Téléverser</button>
      </div>

      <div className="tables-container">
        <div className="table">
          <h3 className="table-title">Vos fichiers</h3>
          {files.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Taille</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.size} bytes</td>
                    <td className="actions-cell">
                      <button>Télécharger</button>
                      <button>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun fichier trouvé.</p>
          )}
        </div>

        <div className="table">
          <h3 className="table-title">Statistiques</h3>
          <table>
            <tbody>
              <tr>
                <td>Espace utilisé</td>
                <td>
                  {stats.total_storage_mb.toFixed(2)} /{" "}
                  {stats.total_storage_limit_mb.toFixed(2)} MB
                </td>
              </tr>
              <tr>
                <td>Nombre de fichiers</td>
                <td>{stats.total_files}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
