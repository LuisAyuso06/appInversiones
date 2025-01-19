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

  console.log({investmentType, initialAmount, monthlyContribution, duration, rate, inflation});
  
  try {
    const results = calculateInvestmentSimulation(investmentType, initialAmount, monthlyContribution, duration, rate, inflation);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

function calculateInvestmentSimulation(investmentType, initialAmount, monthlyContribution, contributionType, durationType, duration, rate, inflation) {
  // Asegurarse de que los valores sean números
  const initialAmountNum = parseFloat(initialAmount) || 1000;  // Valor por defecto 1000 si no se encuentra
  const monthlyContributionNum = parseFloat(monthlyContribution) || 100;  // Valor por defecto 100
  const durationNum = parseInt(duration, 10) || 10;  // Valor por defecto 10 años

  // Ajustar la duración según el tipo
  let durationInMonths;
  if (durationType == 'meses') {
    durationInMonths = durationNum;
  } else if (durationType == 'anios') {
    durationInMonths = durationNum * 12;
  } else if (durationType == 'decadas') {
    durationInMonths = durationNum * 12 * 10;
  } else {
    durationInMonths = durationNum * 12; // Asumir años si no se especifica
  }

  // Lógica de la simulación
  let total = initialAmountNum;
  let totalContributions = 0;

  const monthlyRate = rate / 12 || 0.05 / 12;  // Tasa por defecto del 5% anual
  const adjustedRate = inflation ? monthlyRate - inflation / 12 : monthlyRate;

  // Ajustar la frecuencia de las contribuciones según el tipo
  let contributionFrequency;
  if (contributionType == 'mensual') {
    contributionFrequency = 1;  // Mensual
  } else if (contributionType == 'trimestral') {
    contributionFrequency = 3;  // Trimestral
  } else if (contributionType == 'anual') {
    contributionFrequency = 12;  // Anual
  } else {
    contributionFrequency = 1;  // Asumir mensual si no se especifica
  }

  // Simulación de la inversión
  for (let i = 0; i < durationInMonths; i++) {
    // Añadir contribuciones según el tipo (mensual, trimestral, anual)
    if (i % contributionFrequency === 0) {
      totalContributions += monthlyContributionNum;
      total = (total + monthlyContributionNum) * (1 + adjustedRate);  // Aplica el rendimiento mensual ajustado
    }
  }

  // Calculando la tasa anualizada
  const annualizedRate = ((total / (initialAmountNum + totalContributions)) ** (1 / (durationInMonths / 12)) - 1) * 100;

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


