import React, { useState, useEffect } from 'react';
import DashboardCard from '../../../components/shared/DashboardCard';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import axios from 'axios';

const RecentTransactions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/userinfo', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <Typography>Chargement des données...</Typography>;
  }

  if (error) {
    return <Typography color="error">Erreur : {error}</Typography>;
  }

  // Calculs pourcentage total
  const totalStorageUsedBytes = users.reduce((sum, user) => sum + user.size, 0); // Total utilisé (octets)
  const totalCapacityBytes = users.reduce((sum, user) => {
    const totalStorageGB = parseInt(user.total_storage) / 1024; // Convertir Mo en Go
    const extraStorageGB = user.extra_storage || 0; // En Go
    return sum + (totalStorageGB + extraStorageGB) * 1024 ** 3; // Capacité totale en octets
  }, 0);

  const overallPercentageUsed = Math.min((totalStorageUsedBytes / totalCapacityBytes) * 100, 100); // Limité à 100 %

  return (
    <DashboardCard title="Aperçu global du stockage">
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Stockage total utilisé
        </Typography>
        <Typography variant="h2" color="primary.main" fontWeight="700">
          {(totalStorageUsedBytes / (1024 ** 3)).toFixed(2)} Go
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Capacité totale allouée : {(totalCapacityBytes / (1024 ** 3)).toFixed(2)} Go
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="600">
          Progression totale de l'utilisation
        </Typography>
        <LinearProgress
          variant="determinate"
          value={overallPercentageUsed}
          sx={{
            height: 10,
            borderRadius: 5,
            '& .MuiLinearProgress-bar': {
              backgroundColor: overallPercentageUsed > 75 ? 'error.main' : 'primary.main',
            },
          }}
        />
        <Typography variant="body2" textAlign="right" color="text.secondary">
          {overallPercentageUsed.toFixed(2)}% du stockage total utilisé
        </Typography>
      </Stack>
    </DashboardCard>
  );
};

export default RecentTransactions;
