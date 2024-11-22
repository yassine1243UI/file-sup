import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';
import DashboardCard from '../../../components/shared/DashboardCard';
import axios from 'axios';

const YearlyBreakup = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#ecf2ff';
  const successlight = theme.palette.success.light;

  // État pour stocker les données dynamiques
  const [earningsData, setEarningsData] = useState({
    currentYear: 0,
    lastYear: 0,
  });

  // Fonction pour obtenir l'année en cours
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/userinfo', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(response => {
        // Récupérer les utilisateurs de l'année en cours
        const usersThisYear = response.data.filter(user => new Date(user.created_at).getFullYear() === currentYear);
        
        // Calculer les gains de l'année en cours (supposons 20€ par utilisateur)
        const currentYearEarnings = usersThisYear.length * 20;

        // Récupérer les utilisateurs de l'année précédente
        const usersLastYear = response.data.filter(user => new Date(user.created_at).getFullYear() === currentYear - 1);
        
        // Calculer les gains de l'année précédente
        const lastYearEarnings = usersLastYear.length * 20;

        // Mise à jour des données d'état
        setEarningsData({
          currentYear: currentYearEarnings,
          lastYear: lastYearEarnings,
        });
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données :', error);
      });
  }, []);

  // Calcul du pourcentage de croissance
  const growthPercentage = earningsData.lastYear !== 0
    ? ((earningsData.currentYear - earningsData.lastYear) / earningsData.lastYear) * 100
    : 0;

  // Données pour le graphique (gain de l'année précédente et de l'année en cours)
  const seriescolumnchart = [earningsData.lastYear, earningsData.currentYear];

  // Configuration du graphique
  const optionscolumnchart = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 155,
    },
    colors: [primary, primarylight],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 991,
        options: { chart: { width: 120 } },
      },
    ],
  };

  return (
    <DashboardCard title="Gain annuel">
      <Grid container spacing={3}>
        {/* Colonne pour les informations textuelles */}
        <Grid item xs={7} sm={7}>
          <Typography variant="h3" fontWeight="700">
            ${earningsData.currentYear.toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
              <IconArrowUpLeft width={20} color="#39B69A" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {growthPercentage.toFixed(1)}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              année précédente
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            {/* <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {currentYear - 1}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: 'none' } }}></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {currentYear}
              </Typography>
            </Stack> */}
          </Stack>
        </Grid>
        {/* Colonne pour le graphique
        <Grid item xs={5} sm={5}>
          <Chart options={optionscolumnchart} series={seriescolumnchart} type="donut" height="150px" />
        </Grid> */}
      </Grid>
    </DashboardCard>
  );
};

export default YearlyBreakup;
