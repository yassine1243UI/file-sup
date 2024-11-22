import React from 'react';
import { Select, MenuItem, Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';
import axios from 'axios';

const StorageOverview = () => {
  const [month, setMonth] = React.useState(1);
  const [chartData, setChartData] = React.useState({ series: [], categories: [] });
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Récupérer les données du stockage par utilisateur
  React.useEffect(() => {
    // Exemple d'appel API pour récupérer les données d'utilisation du stockage
    axios.get('http://localhost:5000/api/admin/userinfo', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,

        }
    })
      .then(response => {
        const data = response.data;

        // Transformation des données pour le graphique
        const categories = data.map(item => item.name); // Utilisateurs
        
        const series = [{
          name: 'Total Storage',
          data: data.map(item => item.total_storage) // Utilisation du stockage
        }];
        

        setChartData({ series, categories });
      })
      .catch(error => console.error('Erreur lors de la récupération des données', error));
  }, []);

  // Options du graphique
  const optionsStorageChart = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: true },
      height: 370,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: '60%',
        columnWidth: '42%',
        borderRadius: [6],
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    yaxis: { tickAmount: 4 },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
  };

  // Gérer la sélection du mois
  const handleChange = (event) => {
    setMonth(event.target.value);
  };

  return (
    <DashboardCard title="Aperçu de l'utilisation du stockage" action={
      <Select
        labelId="month-dd"
        id="month-dd"
        value={month}
        size="small"
        onChange={handleChange}
      >
        <MenuItem value={1}>Mars 2023</MenuItem>
        <MenuItem value={2}>Avril 2023</MenuItem>
        <MenuItem value={3}>Mai 2023</MenuItem>
      </Select>
    }>
      <Box sx={{ width: '100%', padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h5" align="center" sx={{ marginBottom: 2 }}>
            Utilisation du stockage par utilisateur
          </Typography>
          <Chart
            options={optionsStorageChart}
            series={chartData.series}
            type="bar"
            height="370px"
          />
        </Paper>
      </Box>
    </DashboardCard>
  );
};

export default StorageOverview;
