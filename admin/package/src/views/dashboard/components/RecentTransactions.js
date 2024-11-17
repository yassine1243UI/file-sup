import React from 'react';
import DashboardCard from '../../../components/shared/DashboardCard';
import { Link } from 'react-router-dom';
import { Box, Typography, LinearProgress, Stack, Button } from '@mui/material';
import User from '../../utilities/UserPage'

const RecentTransactions = () => {
  const totalStorage = 100; // En Go
  const pricePerUnit = 20; // En €
  const percentageUsed = 75; // En %

  return (
    <DashboardCard title="Aperçu du stockage et des ventes">
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Stockage total vendu
        </Typography>
        <Typography variant="h2" color="primary.main" fontWeight="700">
          {totalStorage} Go
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chaque gigaoctet vendu pour <strong>{pricePerUnit} €</strong>
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="600">
          Progression de l'utilisation
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentageUsed}
          sx={{
            height: 10,
            borderRadius: 5,
            '& .MuiLinearProgress-bar': {
              backgroundColor: percentageUsed > 50 ? 'primary.main' : 'warning.main',
            },
          }}
        />
        <Typography variant="body2" textAlign="right" color="text.secondary">
          {percentageUsed}% du stockage utilisé
        </Typography>
      </Stack>

      <Box textAlign="center">
        <Button variant="contained" color="primary" component={Link} to='/ui/user-page'>
          Voir les détails
        </Button>
      </Box>
    </DashboardCard>
  );
};

export default RecentTransactions;
