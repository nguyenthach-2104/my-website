// Thiết lập ngày mặc định (đầu và cuối tháng hiện tại)
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('startDate').value = formatDate(firstDay);
    document.getElementById('endDate').value = formatDate(lastDay);

    // Khởi tạo Flatpickr cho các ô nhập ngày
    flatpickr("#startDate", {
        dateFormat: "d/m/Y", // Định dạng hiển thị: dd/mm/yyyy
        allowInput: true, // Cho phép nhập thủ công
        locale: "vn", // Sử dụng ngôn ngữ tiếng Việt
        monthSelectorType: "static", // Hiển thị tháng dạng tĩnh (không dropdown)
        onChange: function(selectedDates, dateStr) {
            document.getElementById('startDate').value = dateStr;
        }
    });

    flatpickr("#endDate", {
        dateFormat: "d/m/Y", // Định dạng hiển thị: dd/mm/yyyy
        allowInput: true, // Cho phép nhập thủ công
        locale: "vn", // Sử dụng ngôn ngữ tiếng Việt
        monthSelectorType: "static", // Hiển thị tháng dạng tĩnh (không dropdown)
        onChange: function(selectedDates, dateStr) {
            document.getElementById('endDate').value = dateStr;
        }
    });

    // Tùy chỉnh tên tháng
    flatpickr.l10ns.vn.months.longhand = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    flatpickr.l10ns.vn.months.shorthand = [
        "Th 1", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6",
        "Th 7", "Th 8", "Th 9", "Th 10", "Th 11", "Th 12"
    ];

    fetchData();
});

// Định dạng ngày thành dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Chuyển định dạng ngày từ ISO (2024-04-15T01:21:59.279Z) hoặc dd/mm/yyyy thành Date object
function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('T')) { // Định dạng ISO
        const date = new Date(dateStr);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Lấy dữ liệu từ Google Sheets
function fetchData() {
    window.handleSheetData = function(data) {
        console.log('Dữ liệu nhận được:', data); // Debug dữ liệu
        // Lọc các sheet có định dạng CHỮCÁI-SỐ (DIAN-1, PKD-1,...)
        const teamSelect = document.getElementById('teamSelect');
        const teams = Object.keys(data).filter(sheetName => /^[A-Z]+-\d+$/.test(sheetName));
        if (teams.length === 0) {
            console.error('Không tìm thấy sheet nào có định dạng CHỮCÁI-SỐ');
            alert('Không tìm thấy sheet nào có định dạng CHỮCÁI-SỐ');
            return;
        }
        teamSelect.innerHTML = teams.map(team => `<option value="${team}">${team}</option>`).join('');

        // Lưu dữ liệu toàn cục để lọc sau
        window.sheetData = data;

        // Lọc dữ liệu lần đầu
        filterData();
    };

    const script = document.createElement('script');
    script.src = 'https://script.google.com/macros/s/AKfycbyW6b_IgUwlHCApiefupfycc4sv6kf5fUoetoRh5lOPenhMQbrzEOI7TGew2EHQJPheXw/exec?callback=handleSheetData';
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
    const numRows = data.col0.length;

    // Tạo mảng dữ liệu theo hàng
    const rows = [];
    for (let i = 1; i < numRows; i++) { // Bỏ hàng tiêu đề
        const row = {
            timestamp: data.col0[i], // Cột A: Dấu thời gian
            employee: data.col1[i], // Cột B: TÊN NHÂN VIÊN
            province: data.col4[i], // Cột E: TỈNH
            vehicleType: data.col6[i], // Cột G: LOẠI XE
            status: data.col9[i], // Cột J: TRẠNG THÁI
            source: data.col10[i], // Cột K: NGUỒN
            customerType: data.col11[i], // Cột L: PHÂN LOẠI KH
            signDate: data.col14[i], // Cột O: NGÀY KÝ HĐ
            xhdDate: data.col15[i], // Cột P: THÁNG XHD
            note: data.col15[i] // Cột P: GHI CHÚ
        };
        rows.push(row);
    }

    // Lọc và tính toán
    rows.forEach(row => {
        const timestamp = parseDate(row.timestamp);
        if (!timestamp) return;

        // Kiểm tra nếu Dấu thời gian nằm trong khoảng ngày cơ sở
        if (timestamp >= start && timestamp <= end) {
            const employee = row.employee;
            if (!employee) return;

            if (!summary[employee]) {
                summary[employee] = { potential: 0, signed: 0, xhd: 0 };
            }

            // Đếm KH TIỀM NĂNG
            summary[employee].potential++;

            // Đếm KÝ MỚI
            const signDate = parseDate(row.signDate);
            if (signDate && signDate >= start && signDate <= end) {
                summary[employee].signed++;
            }

            // Đếm XHĐ
            const xhdDate = parseDate(row.xhdDate);
            if (xhdDate && xhdDate >= start && xhdDate <= end) {
                summary[employee].xhd++;
            }
        }
    });

    // Hiển thị bảng
    const tbody = document.querySelector('#summaryTable tbody');
    tbody.innerHTML = '';
    if (Object.keys(summary).length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Không có dữ liệu trong khoảng thời gian này.</td></tr>';
    } else {
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
}