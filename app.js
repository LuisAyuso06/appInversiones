// Archivo principal del backend: app.js

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configuración del motor de vistas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Simulador de Inversiones' });
});

// Ruta para obtener datos de inversiones
app.get('/api/investments', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'investments.json')));
  res.json(data);
});

// Ruta para simulación de rendimientos
app.post('/api/simulate', (req, res) => {
  const { investments } = req.body;

  const results = investments.map((inv) => {
    const { type, initialAmount, monthlyContribution, duration, rate, inflation } = inv;
    let total = initialAmount;
    let totalContributions = 0;
    const monthlyRate = rate / 12;
    const adjustedRate = inflation ? monthlyRate - inflation / 12 : monthlyRate;

    for (let i = 0; i < duration * 12; i++) {
      totalContributions += monthlyContribution;
      total = (total + monthlyContribution) * (1 + adjustedRate);
    }

    const annualizedRate = ((total / (initialAmount + totalContributions)) ** (1 / duration) - 1) * 100;

    return {
      type,
      initialAmount,
      totalContributions,
      total: total.toFixed(2),
      annualizedRate: annualizedRate.toFixed(2),
      adjustedRate: adjustedRate.toFixed(4),
    };
  });

  res.json(results);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// console.log('Datos recibidos para simulación:', investments);
// console.log({
//   type,
//   initialAmount,
//   monthlyContribution,
//   duration,
//   rate: 0.07,
//   inflation: 0.02,
// });
