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
  console.log(req);
  
  res.render('index', { title: 'Simulador de Inversiones' });
});

// Ruta para obtener datos de inversiones
app.get('/api/investments', (req, res) => {
  console.log(res, req)
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'investments.json')));
  res.json(data);
});

app.post('/simulate', (req, res) => {
  const { investmentType, initialAmount, monthlyContribution, duration, rate, inflation } = req.body;

  try {
    const results = calculateInvestmentSimulation(investmentType, initialAmount, monthlyContribution, duration, rate, inflation);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para simulación de rendimientos
function calculateInvestmentSimulation(investmentType, initialAmount, monthlyContribution, duration, rate, inflation) {
  // Asegurarse de que los valores sean números
  const initialAmountNum = parseFloat(initialAmount) || 1000;  // Valor por defecto 1000 si no se encuentra
  const monthlyContributionNum = parseFloat(monthlyContribution) || 100;  // Valor por defecto 100
  const durationNum = parseInt(duration, 10) || 10;  // Valor por defecto 10 años

  // Lógica de la simulación
  let total = initialAmountNum;
  let totalContributions = 0;

  const monthlyRate = rate / 12 || 0.05 / 12;  // Tasa por defecto del 5% anual
  const adjustedRate = inflation ? monthlyRate - inflation / 12 : monthlyRate;

  // Simulación de la inversión
  for (let i = 0; i < durationNum * 12; i++) {  // Supone que la duración es en años
    totalContributions += monthlyContributionNum;
    total = (total + monthlyContributionNum) * (1 + adjustedRate);  // Aplica el rendimiento mensual ajustado
  }

  // Calculando la tasa anualizada
  const annualizedRate = ((total / (initialAmountNum + totalContributions)) ** (1 / durationNum) - 1) * 100;

  // Retornar los resultados
  return {
    type: investmentType || 'acciones',  // Valor por defecto 'acciones' si no se encuentra
    initialAmount: initialAmountNum,
    totalContributions: totalContributions,
    total: total.toFixed(2),
    annualizedRate: annualizedRate.toFixed(2),
  };
}



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
