// Kiểm tra mật khẩu
document.getElementById('password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const correctPassword = 'admin123'; // Mật khẩu cứng

    if (password === correctPassword) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        fetchData(); // Gọi hàm lấy dữ liệu sau khi đăng nhập
    } else {
        alert('Mật khẩu sai! Vui lòng thử lại.');
    }
});

// Hàm đăng xuất
function logout() {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('password').value = '';
}

// Lấy dữ liệu từ Google Sheets
function fetchData() {
    // Tạo hàm callback toàn cục để nhận dữ liệu từ JSONP
    window.handleSheetData = function(data) {
        drawChart(data);
    };

    // Tạo thẻ script để gọi JSONP
    var script = document.createElement('script');
    script.src = 'https://script.google.com/macros/s/AKfycbyzU8kZor6ppLmcZtzayTlIzl1dsW4fyhCIxSkbZDexQQHmAp72f54CoVt2VFdUBv-F7w/exec?callback=handleSheetData';
    script.onerror = function() {
        alert('Không thể tải dữ liệu từ Google Sheets.');
    };
    document.head.appendChild(script);
}

function drawChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels.slice(1), // Bỏ tiêu đề "Month"
            datasets: [{
                label: 'Doanh thu',
                data: data.values.slice(1).map(Number), // Bỏ tiêu đề "Revenue" và ép kiểu thành số
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Doanh thu (triệu)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value; // Hiển thị giá trị gốc
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tháng'
                    }
                }
            }
        }
    });
}