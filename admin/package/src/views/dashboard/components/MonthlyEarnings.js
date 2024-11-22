import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Fab } from '@mui/material';
import { IconArrowDownRight, IconCurrencyDollar, IconArrowUpRight } from '@tabler/icons-react';
import DashboardCard from '../../../components/shared/DashboardCard';
import axios from 'axios';

const MonthlyEarnings = () => {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

  // État pour stocker les données dynamiques
  const [earningsData, setEarningsData] = useState({
    currentMonth: 0,
    lastMonth: 0,
    trendData: [],
  });

  // Appel API pour récupérer les utilisateurs créés ce mois-ci et le calcul des gains
  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/monthlyUser', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Envoi du jeton d'authentification
      },
    })
      .then(response => {
        const totalUsers = response.data.totalUsers;

        // Calcul des gains (supposons 20€ par utilisateur)
        const currentMonthEarnings = totalUsers * 20;

        // Supposons qu'il y a une logique pour obtenir les gains du mois précédent
        const lastMonthEarnings = 20; // Remplacer par une logique dynamique si nécessaire

        // Mise à jour des données d'état
        setEarningsData({
          currentMonth: currentMonthEarnings,
          lastMonth: lastMonthEarnings,
        });
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données :', error);
      });
  }, []);

  // Calcul du pourcentage de croissance
  const growthPercentage = ((earningsData.currentMonth - earningsData.lastMonth) / earningsData.lastMonth) * 100;

  // Configuration du graphique
  const optionscolumnchart = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 60,
      sparkline: { enabled: true },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };

  const seriescolumnchart = [
    {
      name: '',
      color: secondary,
      data: earningsData.trendData,
    },
  ];

  return (
    <DashboardCard
      title="Gains mensuels"
      action={
        <Fab color="secondary" size="medium" sx={{ color: '#ffffff' }}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }

    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          ${earningsData.currentMonth.toLocaleString()}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight="600">
            {growthPercentage.toFixed(1)}%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            mois précédent
          </Typography>

          {/* Icône pour l'augmentation ou la diminution */}
          <Stack direction="row" spacing={0.5}>
            {growthPercentage >= 0 ? (
              <IconArrowUpRight size={16} color="#28a745" />
            ) : (
              <IconArrowDownRight size={16} color="#e74c3c" />
            )}
          </Stack>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
