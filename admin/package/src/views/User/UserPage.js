import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import axios from 'axios';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des utilisateurs
        const usersResponse = await axios.get('http://localhost:5000/api/admin/userinfo', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(usersResponse.data);

        // Récupération des fichiers
        const filesResponse = await axios.get('http://localhost:5000/api/admin/files', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFiles(filesResponse.data.files);

        console.log(filesResponse.data.files)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewFiles = (user) => {
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  if (loading) {
    return <Typography>Chargement des données...</Typography>;
  }

  if (error) {
    return <Typography color="error">Erreur : {error}</Typography>;
  }

  return (
    <Box>
      {!selectedUser ? (
        // Liste des utilisateurs
        <>
          <Typography variant="h4" gutterBottom>
            Liste des utilisateurs
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Nom
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography>{user.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewFiles(user)}
                    >
                      Voir les fichiers (
                      {files.filter((file) => file.user_id === user.id).length})
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        // Liste des fichiers d'un utilisateur sélectionné
        <>
          <Typography variant="h4" gutterBottom>
            Fichiers de {selectedUser.name}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleBackToUsers}
            sx={{ marginBottom: '16px' }}
          >
            Retour aux utilisateurs
          </Button>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Nom du fichier
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Taille
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Téléchargement
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files
                .filter((file) => file.user_id === selectedUser.id)
                .map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Typography>{file.file_name}</Typography>
                    </TableCell>
                    <TableCell>
                    <Typography>{(file.size / (1024 ** 3)).toFixed(2)} Go</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{file.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        href={file.url}
                        download={file.name}
                      >
                        Télécharger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </>
      )}
    </Box>
  );
};

export default UserPage;
