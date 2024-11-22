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
  const [fileToUpload, setFileToUpload] = useState(null); 
  const [uploadMessage, setUploadMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');
  const [storageStats, setStorageStats] = useState(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,  // Add the JWT token
                }
            });

            if (response.status === 200) {
                setUserProfile(response.data.profile);  // Store the user profile in the state
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Error fetching user profile.');
        }
    };

    fetchUserProfile();  // Fetch the user profile when the component mounts
}, []);

useEffect(() => {
  const fetchStorageStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/storage-stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        setStorageStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching storage stats:", error);
      setMessage('Failed to fetch storage stats.');
    } finally {
      setLoading(false);
    }
  };

  fetchStorageStats();
}, []);
  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/files", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Erreur de récupération des statistiques", error);
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload) {
      setUploadMessage("Veuillez sélectionner un fichier à téléverser.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUploadMessage("Fichier téléversé avec succès !");
      setFiles((prevFiles) => [response.data.file, ...prevFiles]); // Ajouter le fichier téléversé
      setFileToUpload(null); // Réinitialiser le fichier
    } catch (error) {
      setUploadMessage("Erreur lors du téléversement du fichier.");
      console.error(error);
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
        <h2>Bonjour, {userName}</h2>
          <span>Dashboard de {userName}</span>
          {error && <p>{error}</p>}
            {userProfile ? (
                <div>
                    <p><strong>Name:</strong> {userProfile.name}</p>
                    <p><strong>Email:</strong> {userProfile.email}</p>
                    <p><strong>Phone:</strong> {userProfile.phone}</p>
                    <p><strong>Billing Address:</strong> {userProfile.billing_address}</p>
                </div>
            ) : (
                <p>Loading your profile...</p>
            )}
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

        {/* Bouton Téléverser */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="file"
            id="file-input"
            style={{ display: "none" }}
            onChange={(e) => setFileToUpload(e.target.files[0])}
          />
          <label htmlFor="file-input" className="upload-button">
            Sélectionner un fichier
          </label>
          <button
            className="upload-button"
            onClick={handleFileUpload}
          >
            Téléverser
          </button>
        </div>
      </div>

      {uploadMessage && <p>{uploadMessage}</p>}

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
          {loading ? (
        <p>Chargement des informations de stockage...</p>
      ) : storageStats ? (
        <div>
          <h2>Votre espace de stockage</h2>
          <p><strong>Total Storage:</strong> {storageStats.totalStorage} MB</p>
          <p><strong>Total Used:</strong> {storageStats.totalUsed} MB</p>
          <p><strong>Remaining Storage:</strong> {storageStats.remainingStorage} MB</p>
          <p><strong>Total Files:</strong> {storageStats.totalFiles}</p>
        </div>
      ) : (
        <p>{message}</p>
      )}
          <table>
            <tbody>
              <tr>
                <td>Espace utilisé</td>
                <td>
                  {stats.total_storage_mb.toFixed(2)} / {stats.total_storage_limit_mb.toFixed(2)} MB
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
      <div className="ad-section">
        <p>Besoin de plus d'espace ?</p>
        <button
          className="ad-button"
          onClick={() => navigate("/upgrade")}
        >
          Augmentez votre capacité de stockage !
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
