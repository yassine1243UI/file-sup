// frontend/Pages/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);  // Indicateur de chargement
  const navigate = useNavigate();

  // Fonction pour récupérer les fichiers de l'utilisateur
  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,  // Auth Token
        },
      });

      if (response.status === 200) {
        setFiles(response.data.files); // Mettre à jour la liste des fichiers
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers :", error);
      setMessage("Erreur lors de la récupération des fichiers.");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les fichiers à l'initialisation
  useEffect(() => {
    fetchFiles();
  }, []);

  // Gestion de la sélection de fichier
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Sélectionner le fichier
  };

  // Gestion du téléchargement
  const handleDownload = (fileId) => {
    const url = `http://localhost:5000/api/files/download/${fileId}`;
    window.open(url, "_blank"); // Ouvre le fichier dans un nouvel onglet
  };

  // Gestion de l'upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Veuillez sélectionner un fichier à télécharger.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);  // 'file' est le nom du champ de fichier dans le formulaire

    try {
      setLoading(true); // Afficher le message de chargement
      const response = await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Auth Token
        },
      });

      if (response.status === 200) {
        setMessage("Fichier téléchargé avec succès !");
        // Ajout du fichier à la liste des fichiers
        setFiles([...files, response.data]);
        // Récupérer à nouveau les fichiers après l'upload
        
      }
      fetchFiles();
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setMessage("Erreur lors de l'upload du fichier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Tableau de bord de l'utilisateur</h1>
      <h2>Vos fichiers</h2>

      {/* Formulaire d'upload de fichier */}
      <div>
        <h3>Uploader un fichier</h3>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? "Chargement..." : "Télécharger"}
          </button>
        </form>
      </div>

      {/* Affichage des messages */}
      {message && <p>{message}</p>}

      {/* Liste des fichiers */}
      {loading ? (
        <p>Chargement des fichiers...</p>
      ) : files.length > 0 ? (
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.name} - {file.size} bytes
              <button onClick={() => handleDownload(file.id)}>Télécharger</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun fichier trouvé</p>
      )}
    </div>
  );
};

export default Dashboard;
