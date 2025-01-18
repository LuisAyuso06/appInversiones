document.addEventListener('DOMContentLoaded', () => {
  // Asegúrate de que el botón existe en el DOM antes de agregar el event listener
  const simulateButton = document.getElementById('simulate-btn');
  if (simulateButton) {
    simulateButton.addEventListener('click', async (e) => {
      // Prevenir el comportamiento predeterminado de un botón de formulario (si aplica)
      e.preventDefault();

      // Obtener los valores de los campos
      const type = document.getElementById('investment-type').value;
      const initialAmount = parseFloat(document.getElementById('initial-amount').value);
      const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
      const duration = parseInt(document.getElementById('duration').value);

      // Verificar que todos los campos son válidos antes de continuar
      if (isNaN(initialAmount) || isNaN(monthlyContribution) || isNaN(duration)) {
        alert('Por favor, ingresa valores válidos en todos los campos.');
        return;
      }

      // Enviar la solicitud al servidor
      const response = await fetch('/simulate', {
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

      // Manejar la respuesta
      const results = await response.json();
      console.log(results);
      
      // Renderizar los resultados
      renderResults(results);
    });
  }
});

function renderResults(results) {
  // Mostrar gráfico
  const ctx = document.getElementById('investment-chart').getContext('2d');
  const labels = [results.type];  // Solo un tipo de inversión en este caso
  const data = [parseFloat(results.total)];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Valor Final de la Inversión',
        data: data,
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

  // Mostrar resultados en la tabla
  const tableBody = document.querySelector('#results-table tbody');
  tableBody.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos datos

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${results.type}</td>
    <td>${results.initialAmount}</td>
    <td>${results.totalContributions}</td>
    <td>${(parseFloat(results.total) - results.initialAmount - results.totalContributions).toFixed(2)}</td>
    <td>${results.total}</td>
    <td>${results.annualizedRate}%</td>
  `;
  tableBody.appendChild(row);
}
