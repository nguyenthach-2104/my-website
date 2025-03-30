// Thiết lập ngày mặc định (đầu và cuối tháng hiện tại)
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('startDate').value = formatDate(firstDay);
    document.getElementById('endDate').value = formatDate(lastDay);

    fetchData();
});

// Định dạng ngày thành dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Chuyển định dạng ngày từ dd/mm/yyyy thành Date object
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Lấy dữ liệu từ Google Sheets
function fetchData() {
    window.handleSheetData = function(data) {
        // Lọc các sheet có định dạng CHỮCÁI-SỐ (DIAN-1, PKD-1,...)
        const teamSelect = document.getElementById('teamSelect');
        const teams = Object.keys(data).filter(sheetName => /^[A-Z]+-\d+$/.test(sheetName));
        teamSelect.innerHTML = teams.map(team => `<option value="${team}">${team}</option>`).join('');

        // Lưu dữ liệu toàn cục để lọc sau
        window.sheetData = data;

        // Lọc dữ liệu lần đầu
        filterData();
    };

    const script = document.createElement('script');
    script.src = 'https://script.google.com/macros/s/AKfycbw-3GpgV7OJ-RR-mxZLNj75rZhcYFJ1bR7oGPQOENqO0OVrW_2oIcUQFHXfpHykGnYg4Q/exec?callback=handleSheetData';
    script.onerror = function() {
        alert('Không thể tải dữ liệu từ Google Sheets.');
    };
    document.head.appendChild(script);
}

// Lọc dữ liệu và hiển thị bảng
function filterData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const selectedTeam = document.getElementById('teamSelect').value;

    if (!startDate || !endDate || !selectedTeam) {
        alert('Vui lòng chọn đầy đủ ngày và phòng!');
        return;
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (start > end) {
        alert('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!');
        return;
    }

    // Lấy dữ liệu từ sheet được chọn
    const data = window.sheetData[selectedTeam];
    if (!data) {
        alert('Không tìm thấy dữ liệu cho phòng ' + selectedTeam);
        return;
    }

    // Xử lý dữ liệu
    const summary = {};
    const rows = data.labels.map((_, i) => ({
        timestamp: data.labels[i], // Cột A: Dấu thời gian
        employee: data.values[i],  // Cột B: TÊN NHÂN VIÊN
        signDate: data.values[i + 13], // Cột O: NGÀY KÝ HĐ
        xhdDate: data.values[i + 14]  // Cột P: THÁNG XHD
    })).slice(1); // Bỏ hàng tiêu đề

    rows.forEach(row => {
        // Xử lý Dấu thời gian
        const timestampStr = row.timestamp.split(' ')[0]; // Lấy phần ngày: 15/04/2024
        const timestamp = parseDate(timestampStr);

        // Kiểm tra nếu Dấu thời gian nằm trong khoảng ngày cơ sở
        if (timestamp >= start && timestamp <= end) {
            const employee = row.employee;
            if (!summary[employee]) {
                summary[employee] = { potential: 0, signed: 0, xhd: 0 };
            }

            // Đếm KH TIỀM NĂNG
            summary[employee].potential++;

            // Đếm KÝ MỚI
            if (row.signDate) {
                const signDate = parseDate(row.signDate);
                if (signDate >= start && signDate <= end) {
                    summary[employee].signed++;
                }
            }

            // Đếm XHĐ
            if (row.xhdDate) {
                const xhdDate = parseDate(row.xhdDate);
                if (xhdDate >= start && xhdDate <= end) {
                    summary[employee].xhd++;
                }
            }
        }
    });

    // Hiển thị bảng
    const tbody = document.querySelector('#summaryTable tbody');
    tbody.innerHTML = '';
    Object.keys(summary).forEach(employee => {
        const row = summary[employee];
        tbody.innerHTML += `
            <tr>
                <td>${employee}</td>
                <td>${row.potential}</td>
                <td>${row.signed}</td>
                <td>${row.xhd}</td>
            </tr>
        `;
    });
}