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

// Rutas principales
app.get('/', (req, res) => {
  res.render('index', { title: 'Simulador de Inversiones' });
});

app.get('/api/investments', (req, res) => {
  // Carga datos de ejemplo desde un archivo JSON
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'investments.json')));
  res.json(data);
});

app.post('/api/simulate', (req, res) => {
  const { investments } = req.body;

  const results = investments.map((inv) => {
    const { type, initialAmount, monthlyContribution, duration, rate } = inv;
    let total = initialAmount;

    // Simulación de rendimiento promedio histórico
    for (let i = 0; i < duration * 12; i++) {
      total = (total + monthlyContribution) * (1 + rate / 12);
    }

    // Ajuste por inflación (asumiendo 2% anual)
    const inflationRate = 0.02;
    const adjustedTotal = total / Math.pow(1 + inflationRate, duration);

    // Simulación de Monte Carlo
    const monteCarloSimulations = 1000;
    const monteCarloResults = [];
    for (let i = 0; i < monteCarloSimulations; i++) {
      let mcTotal = initialAmount;
      for (let j = 0; j < duration * 12; j++) {
        const randomRate = rate + (Math.random() - 0.5) * 0.1; // Variación aleatoria
        mcTotal = (mcTotal + monthlyContribution) * (1 + randomRate / 12);
      }
      monteCarloResults.push(mcTotal);
    }

    // Cálculo de estadísticas de Monte Carlo
    const averageMonteCarlo = monteCarloResults.reduce((a, b) => a + b, 0) / monteCarloSimulations;

    return {
      type,
      initialAmount,
      total: total.toFixed(2),
      adjustedTotal: adjustedTotal.toFixed(2),
      monteCarloAverage: averageMonteCarlo.toFixed(2),
      rate,
    };
  });

  res.json(results);
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});