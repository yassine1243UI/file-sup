import React, { useState } from 'react';
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

// Simulated database for users
const users = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password123',
    files: [1, 2],
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    password: 'securepassword',
    files: [3],
  },
];

// Simulated database for files
const files = [
  {
    id: 1,
    userId: 1,
    name: 'Document1.pdf',
    size: '2MB',
    uploadDate: '2023-01-15',
    type: 'PDF',
    url: '/downloads/Document1.pdf',
  },
  {
    id: 2,
    userId: 1,
    name: 'Photo.png',
    size: '3.5MB',
    uploadDate: '2023-02-20',
    type: 'Image',
    url: '/downloads/Photo.png',
  },
  {
    id: 3,
    userId: 2,
    name: 'Report.docx',
    size: '1.8MB',
    uploadDate: '2023-03-10',
    type: 'Document',
    url: '/downloads/Report.docx',
  },
];

const TypographyPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleViewFiles = (user) => {
    setSelectedUser(user); // Définit l'utilisateur sélectionné
  };

  const handleBackToUsers = () => {
    setSelectedUser(null); // Réinitialise la sélection pour revenir à la liste des utilisateurs
  };

  return (
    <Box>
      {!selectedUser ? (
        // Affichage des utilisateurs
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
                      Voir les fichiers ({user.files.length})
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        // Affichage des fichiers de l'utilisateur sélectionné
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
                .filter((file) => file.userId === selectedUser.id)
                .map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Typography>{file.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{file.size}</Typography>
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

export default TypographyPage;
