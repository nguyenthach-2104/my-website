if (!localStorage.getItem('loggedIn')) {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
}

// Kết nối Google Sheets qua Google Apps Script
fetch('YOUR_GOOGLE_APPS_SCRIPT_URL')
    .then(response => response.json())
    .then(data => {
        // Xử lý dữ liệu từ Google Sheets
        console.log(data);
        drawChart(data); // Vẽ biểu đồ
    });