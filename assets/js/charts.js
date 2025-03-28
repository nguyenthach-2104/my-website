function drawChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels, // Từ Google Sheets
            datasets: [{
                label: 'Doanh thu',
                data: data.values, // Từ Google Sheets
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        }
    });
}