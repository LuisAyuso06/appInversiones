document.getElementById('investment-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const type = document.getElementById('investment-type').value;
  const initialAmount = parseFloat(document.getElementById('initial-amount').value);
  const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
  const duration = parseInt(document.getElementById('duration').value);

  const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      investments: [
        { type, initialAmount, monthlyContribution, duration, rate: 0.07 },
      ],
    }),
  });

  const results = await response.json();

  const resultContainer = document.createElement('div');
  resultContainer.innerHTML = `
    <h3>Resultados de la Simulación</h3>
    <p>Inversión: ${results[0].type}</p>
    <p>Monto Inicial: $${results[0].initialAmount}</p>
    <p>Total sin ajustar: $${results[0].total}</p>
    <p>Total ajustado por inflación: $${results[0].adjustedTotal}</p>
    <p>Promedio Monte Carlo: $${results[0].monteCarloAverage}</p>
  `;

  document.body.appendChild(resultContainer);
});

  
