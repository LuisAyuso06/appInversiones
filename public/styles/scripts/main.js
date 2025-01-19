document.addEventListener('DOMContentLoaded', () => {
  const simulateButton = document.getElementById('simulate-btn');
  if (simulateButton) {
    simulateButton.addEventListener('click', async (e) => {
      e.preventDefault();

      // Obtener los valores de los campos
      const type = document.getElementById('investment-type').value;
      const initialAmount = parseFloat(document.getElementById('initial-amount').value);
      const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
      const contributionType = document.getElementById('contribution-type').value;
      const durationType = document.getElementById('duration-type').value;
      const duration = parseInt(document.getElementById('duration').value);
      const ratePercentage = parseFloat(document.getElementById('rate-percentage').value) / 100; // Convertir a decimal

      // Verificar que todos los campos son válidos
      if (isNaN(initialAmount) || isNaN(monthlyContribution) || isNaN(duration) || isNaN(ratePercentage)) {
        Swal.fire({
          icon: 'error',
          title: 'Campos inválidos',
          text: 'Por favor, ingresa valores válidos en todos los campos.',
        });
        return;
      }

      // Mostrar confirmación con SweetAlert
      const confirm = await Swal.fire({
        title: '¿Confirmar simulación?',
        text: '¿Estás seguro de realizar esta simulación?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
      });

      if (confirm.isConfirmed) {
        try {
          // Mostrar loader mientras se realiza la solicitud
          Swal.fire({
            title: 'Simulando...',
            text: 'Por favor espera mientras procesamos tu simulación.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Enviar la solicitud al servidor
          const response = await fetch('/simulate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              investmentType: type,
              initialAmount: initialAmount,
              monthlyContribution: monthlyContribution,
              contributionType: contributionType,
              durationType: durationType,
              duration: duration,
              rate: ratePercentage, // Enviar el porcentaje de rendimiento
              inflation: 0.02, // Mantener tasa de inflación constante, puede ser dinámico si se desea
            }),
          });

          const results = await response.json();

          // Mostrar los resultados con éxito
          Swal.fire({
            icon: 'success',
            title: 'Simulación completa',
            text: 'Los resultados se han generado correctamente.',
          });

          // Renderizar los resultados
          renderResults(results);
          // clearFormFields();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error en la simulación',
            text: 'Ocurrió un problema al procesar la solicitud.',
          });
        }
      }
    });
  }
});



 // Función para limpiar los campos del formulario
 function clearFormFields() {
  document.getElementById('investment-type').value = 'acciones'; // Valor predeterminado
  document.getElementById('initial-amount').value = '';
  document.getElementById('monthly-contribution').value = '';
  document.getElementById('duration').value = '';
}


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
