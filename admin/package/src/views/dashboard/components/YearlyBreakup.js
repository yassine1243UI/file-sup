import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';
import DashboardCard from '../../../components/shared/DashboardCard';

const YearlyBreakup = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#ecf2ff';
  const successlight = theme.palette.success.light;

  // Données statiques simulant une base de données
  const salesData = {
    year2022: 40000,  // Montant total des ventes pour 2022
    year2023: 44000,  // Montant total des ventes pour 2023
  };

  // Calcul du pourcentage de croissance
  const growthPercentage = ((salesData.year2023 - salesData.year2022) / salesData.year2022) * 100;

  // Données pour le graphique
  const seriescolumnchart = [salesData.year2022, salesData.year2023, salesData.others];
  const optionscolumnchart = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 155,
    },
    colors: [primary, primarylight, '#F9F9FD'],
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
    <DashboardCard title="Gain annuels ">
      <Grid container spacing={3}>
        {/* Colonne pour les informations textuelles */}
        <Grid item xs={7} sm={7}>
          <Typography variant="h3" fontWeight="700">
            ${salesData.year2023.toLocaleString()}
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                2022
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                2023
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* Colonne pour le graphique */}
        <Grid item xs={5} sm={5}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="donut"
            height="150px"
          />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default YearlyBreakup;
