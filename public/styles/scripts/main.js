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
        { type, initialAmount, monthlyContribution, duration, rate: 0.07, inflation: 0.02 },
      ],
    }),
  });

  const results = await response.json();
  renderResults(results);
});

function renderResults(results) {
  const ctx = document.getElementById('investment-chart').getContext('2d');
  const labels = results.map((r) => r.type);
  const data = results.map((r) => r.total);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Valor Final de la Inversión',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const tableBody = document.querySelector('#results-table tbody');
  tableBody.innerHTML = '';
  results.forEach((r) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${r.type}</td>
      <td>${r.initialAmount}</td>
      <td>${r.totalContributions}</td>
      <td>${(r.total - r.initialAmount - r.totalContributions).toFixed(2)}</td>
      <td>${r.total}</td>
      <td>${r.annualizedRate}%</td>
    `;
    tableBody.appendChild(row);
  });
}
