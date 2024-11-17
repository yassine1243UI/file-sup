import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';

const SalesOverview = () => {
    const [month, setMonth] = React.useState(1);
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // Génération de données aléatoires
    const generateRandomData = () => {
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 500) + 100);
    };

    // Données pour chaque mois
    const dataByMonth = {
        1: {
            gains: generateRandomData(),
            depenses: generateRandomData(),
        },
        2: {
            gains: generateRandomData(),
            depenses: generateRandomData(),
        },
        3: {
            gains: generateRandomData(),
            depenses: generateRandomData(),
        },
    };

    // Mettre à jour la série en fonction du mois sélectionné
    const seriescolumnchart = [
        {
            name: 'Gains ',
            data: dataByMonth[month].gains,
        },
        {
            name: 'Dépense ',
            data: dataByMonth[month].depenses ,
        },
    ];

    const handleChange = (event) => {
        setMonth(event.target.value);
    };

    // Options du graphique
    const optionscolumnchart = {
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
            categories: ['16/08', '17/08', '18/08', '19/08', '20/08', '21/08', '22/08', '23/08'],
            axisBorder: { show: false },
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
    };

    return (
        <DashboardCard title="Aperçu des ventes" action={
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
            <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height="370px"
            />
        </DashboardCard>
    );
};

export default SalesOverview;
