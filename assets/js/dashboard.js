// @ts-nocheck
// Thiết lập ngày mặc định (đầu và cuối tháng hiện tại)
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('startDate').value = formatDate(firstDay);
    document.getElementById('endDate').value = formatDate(lastDay);

    // Khởi tạo Flatpickr cho các ô nhập ngày
    flatpickr("#startDate", {
        dateFormat: "d/m/Y",
        allowInput: true,
        locale: "vn",
        monthSelectorType: "static",
        onChange: function(selectedDates, dateStr) {
            document.getElementById('startDate').value = dateStr;
        }
    });

    flatpickr("#endDate", {
        dateFormat: "d/m/Y",
        allowInput: true,
        locale: "vn",
        monthSelectorType: "static",
        onChange: function(selectedDates, dateStr) {
            document.getElementById('endDate').value = dateStr;
        }
    });

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

// Chuyển định dạng ngày từ ISO hoặc dd/mm/yyyy thành Date object
function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Lấy dữ liệu từ Google Sheets
function fetchData() {
    window.handleSheetData = function(data) {
        console.log('Dữ liệu nhận được:', data);
        const teamSelect = document.getElementById('teamSelect');
        const teams = Object.keys(data).filter(sheetName => /^[A-Z]+-\d+$/.test(sheetName));
        if (teams.length === 0) {
            console.error('Không tìm thấy sheet nào có định dạng CHỮCÁI-SỐ');
            alert('Không tìm thấy sheet nào có định dạng CHỮCÁI-SỐ');
            return;
        }
        // Thêm tùy chọn Tổng vào dropdown
        teams.unshift('Tổng');
        teamSelect.innerHTML = teams.map(team => `<option value="${team}">${team}</option>`).join('');

        window.sheetData = data;
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

    let data;
    if (selectedTeam === 'Tổng') {
        // Tổng hợp dữ liệu từ tất cả các phòng
        const allRows = [];
        const teams = Object.keys(window.sheetData).filter(sheetName => /^[A-Z]+-\d+$/.test(sheetName));
        teams.forEach(team => {
            const teamData = window.sheetData[team];
            const numRows = teamData.col0.length;
            for (let i = 1; i < numRows; i++) {
                allRows.push({
                    timestamp: teamData.col0[i],
                    employee: teamData.col1[i],
                    province: teamData.col4[i],
                    vehicleType: teamData.col6[i],
                    status: teamData.col9[i],
                    source: teamData.col10[i],
                    customerType: teamData.col11[i],
                    signDate: teamData.col14[i],
                    xhdDate: teamData.col15[i],
                    note: teamData.col15[i]
                });
            }
        });

        // Tạo dữ liệu tổng hợp dưới dạng tương tự dữ liệu của một sheet
        data = {
            col0: ['Dấu thời gian', ...allRows.map(row => row.timestamp)],
            col1: ['TÊN NHÂN VIÊN', ...allRows.map(row => row.employee)],
            col4: ['TỈNH', ...allRows.map(row => row.province)],
            col6: ['LOẠI XE', ...allRows.map(row => row.vehicleType)],
            col9: ['TRẠNG THÁI', ...allRows.map(row => row.status)],
            col10: ['NGUỒN', ...allRows.map(row => row.source)],
            col11: ['PHÂN LOẠI KH', ...allRows.map(row => row.customerType)],
            col14: ['NGÀY KÝ HĐ', ...allRows.map(row => row.signDate)],
            col15: ['THÁNG XHD', ...allRows.map(row => row.xhdDate)]
        };
    } else {
        data = window.sheetData[selectedTeam];
        if (!data) {
            alert('Không tìm thấy dữ liệu cho phòng ' + selectedTeam);
            return;
        }
    }

    // Xử lý dữ liệu cho Section I
    const summary = {};
    const numRows = data.col0.length;

    const rows = [];
    for (let i = 1; i < numRows; i++) {
        const row = {
            timestamp: data.col0[i],
            employee: data.col1[i],
            province: data.col4[i],
            vehicleType: data.col6[i],
            status: data.col9[i],
            source: data.col10[i],
            customerType: data.col11[i],
            signDate: data.col14[i],
            xhdDate: data.col15[i],
            note: data.col15[i]
        };
        rows.push(row);
    }

    rows.forEach(row => {
        const timestamp = parseDate(row.timestamp);
        if (!timestamp) return;

        if (timestamp >= start && timestamp <= end) {
            const employee = row.employee;
            if (!employee) return;

            if (!summary[employee]) {
                summary[employee] = { potential: 0, signed: 0, xhd: 0 };
            }

            summary[employee].potential++;

            const signDate = parseDate(row.signDate);
            if (signDate && signDate >= start && signDate <= end) {
                summary[employee].signed++;
            }

            const xhdDate = parseDate(row.xhdDate);
            if (xhdDate && xhdDate >= start && xhdDate <= end) {
                summary[employee].xhd++;
            }
        }
    });

    const tbody = document.querySelector('#summaryTable tbody');
    tbody.innerHTML = '';

    let totalPotential = 0, totalSigned = 0, totalXhd = 0;
    let stt = 1;

    if (Object.keys(summary).length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Không có dữ liệu trong khoảng thời gian này.</td></tr>';
    } else {
        Object.keys(summary).forEach(employee => {
            const row = summary[employee];
            tbody.innerHTML += `
                <tr>
                    <td>${stt++}</td>
                    <td>${employee}</td>
                    <td>${row.potential}</td>
                    <td>${row.signed}</td>
                    <td>${row.xhd}</td>
                </tr>
            `;
            totalPotential += Number(row.potential) || 0;
            totalSigned += Number(row.signed) || 0;
            totalXhd += Number(row.xhd) || 0;
        });

        tbody.innerHTML += `
            <tr class="total-row">
                <td colspan="2">Tổng</td>
                <td>${totalPotential}</td>
                <td>${totalSigned}</td>
                <td>${totalXhd}</td>
            </tr>
        `;
    }

    updateRegionTable(data, start, end);
    updateVehicleTypeTable(data, start, end);
}

function updateRegionTable(data, start, end) {
    const regionSummary = {};
    const numRows = data.col0.length;

    const rows = [];
    for (let i = 1; i < numRows; i++) {
        const row = {
            timestamp: data.col0[i],
            province: data.col4[i],
            signDate: data.col14[i],
            xhdDate: data.col15[i]
        };
        rows.push(row);
    }

    rows.forEach(row => {
        const timestamp = parseDate(row.timestamp);
        if (!timestamp) return;

        if (timestamp >= start && timestamp <= end) {
            const province = row.province;
            if (!province) return;

            if (!regionSummary[province]) {
                regionSummary[province] = { potential: 0, signed: 0, xhd: 0 };
            }

            regionSummary[province].potential++;

            const signDate = parseDate(row.signDate);
            if (signDate && signDate >= start && signDate <= end) {
                regionSummary[province].signed++;
            }

            const xhdDate = parseDate(row.xhdDate);
            if (xhdDate && xhdDate >= start && xhdDate <= end) {
                regionSummary[province].xhd++;
            }
        }
    });

    const mainRegions = {};
    const otherRegions = {};
    Object.keys(regionSummary).forEach(province => {
        const stats = regionSummary[province];
        if (stats.signed > 0 || stats.xhd > 0) {
            mainRegions[province] = stats;
        } else {
            otherRegions[province] = stats;
        }
    });

    const tbody = document.querySelector('#regionTable tbody');
    tbody.innerHTML = '';

    let totalPotential = 0, totalSigned = 0, totalXhd = 0;
    let stt = 1;

    const mainRegionData = [];
    Object.keys(mainRegions).forEach(province => {
        const stats = mainRegions[province];
        const signRate = stats.potential > 0 ? ((stats.signed / stats.potential) * 100).toFixed(2) : 0;
        mainRegionData.push({ province, potential: stats.potential, signed: stats.signed, xhd: stats.xhd });
        tbody.innerHTML += `
            <tr>
                <td>${stt++}</td>
                <td>${province}</td>
                <td>${stats.potential}</td>
                <td>${stats.signed}</td>
                <td>${stats.xhd}</td>
                <td>${signRate}%</td>
            </tr>
        `;
        totalPotential += Number(stats.potential) || 0;
        totalSigned += Number(stats.signed) || 0;
        totalXhd += Number(stats.xhd) || 0;
    });

    const otherRegionCount = Object.keys(otherRegions).length;
    let otherRegionPotential = 0;
    Object.values(otherRegions).forEach(stats => {
        otherRegionPotential += stats.potential;
    });

    if (otherRegionCount > 0) {
        mainRegionData.push({ province: `${otherRegionCount} tỉnh khác`, potential: otherRegionPotential, signed: 0, xhd: 0 });
        tbody.innerHTML += `
            <tr class="toggle-row" onclick="toggleDetails(this)">
                <td>${stt++}</td>
                <td>${otherRegionCount} tỉnh khác</td>
                <td>${otherRegionPotential}</td>
                <td>0</td>
                <td>0</td>
                <td>0%</td>
            </tr>
            <tr class="detail-row">
                <td colspan="6">
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>TỈNH</th>
                                <th>KH TIỀM NĂNG</th>
                                <th>KÝ</th>
                                <th>XUẤT</th>
                                <th>TỈ LỆ KÝ MỚI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(otherRegions).map((province, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${province}</td>
                                    <td>${otherRegions[province].potential}</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </td>
            </tr>
        `;
        totalPotential += Number(otherRegionPotential) || 0;
    }

    const totalSignRate = totalPotential > 0 ? ((totalSigned / totalPotential) * 100).toFixed(2) : 0;
    tbody.innerHTML += `
        <tr class="total-row">
            <td colspan="2">Tổng</td>
            <td>${totalPotential}</td>
            <td>${totalSigned}</td>
            <td>${totalXhd}</td>
            <td>${totalSignRate}%</td>
        </tr>
    `;

    const ctx = document.getElementById('regionChart').getContext('2d');
    if (window.regionChart && typeof window.regionChart.destroy === 'function') {
        window.regionChart.destroy();
    }

    const totalPotentialForChart = mainRegionData.reduce((sum, data) => sum + (Number(data.potential) || 0), 0);
    const isPotentialEmpty = totalPotentialForChart === 0;

    ctx.canvas.style.display = 'block';
    ctx.canvas.style.opacity = isPotentialEmpty ? '0.3' : '1';

    window.regionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: mainRegionData.map(data => data.province),
            datasets: [{
                label: 'Tỉ trọng KH TIỀM NĂNG',
                data: mainRegionData.map(data => data.potential),
                backgroundColor: isPotentialEmpty ? ['#D3D3D3'] : [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9',
                    '#92A8D1', '#955251', '#B565A7', '#009B77', '#DD4124',
                    '#D65076', '#45B8AC', '#EFC050', '#5B5EA6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tỉ trọng KH TIỀM NĂNG giữa các khu vực'
                },
                datalabels: {
                    color: '#000',
                    formatter: (value, context) => {
                        return value > 0 ? value : '';
                    },
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function updateVehicleTypeTable(data, start, end) {
    const vehicleTypeSummary = {};
    const numRows = data.col0.length;

    const rows = [];
    for (let i = 1; i < numRows; i++) {
        const row = {
            timestamp: data.col0[i],
            vehicleType: data.col6[i],
            signDate: data.col14[i],
            xhdDate: data.col15[i]
        };
        rows.push(row);
    }

    rows.forEach(row => {
        const timestamp = parseDate(row.timestamp);
        if (!timestamp) return;

        if (timestamp >= start && timestamp <= end) {
            const vehicleType = row.vehicleType;
            if (!vehicleType) return;

            if (!vehicleTypeSummary[vehicleType]) {
                vehicleTypeSummary[vehicleType] = { potential: 0, signed: 0, xhd: 0 };
            }

            vehicleTypeSummary[vehicleType].potential++;

            const signDate = parseDate(row.signDate);
            if (signDate && signDate >= start && signDate <= end) {
                vehicleTypeSummary[vehicleType].signed++;
            }

            const xhdDate = parseDate(row.xhdDate);
            if (xhdDate && xhdDate >= start && xhdDate <= end) {
                vehicleTypeSummary[vehicleType].xhd++;
            }
        }
    });

    const mainVehicleTypes = {};
    const otherVehicleTypes = {};
    Object.keys(vehicleTypeSummary).forEach(vehicleType => {
        const stats = vehicleTypeSummary[vehicleType];
        if (stats.signed > 0 || stats.xhd > 0) {
            mainVehicleTypes[vehicleType] = stats;
        } else {
            otherVehicleTypes[vehicleType] = stats;
        }
    });

    const tbody = document.querySelector('#vehicleTypeTable tbody');
    tbody.innerHTML = '';

    let totalPotential = 0, totalSigned = 0, totalXhd = 0;
    let stt = 1;

    const mainVehicleTypeData = [];
    Object.keys(mainVehicleTypes).forEach(vehicleType => {
        const stats = mainVehicleTypes[vehicleType];
        const signRate = stats.potential > 0 ? ((stats.signed / stats.potential) * 100).toFixed(2) : 0;
        mainVehicleTypeData.push({ 
            vehicleType, 
            potential: stats.potential, 
            signed: stats.signed, 
            xhd: stats.xhd 
        });
        tbody.innerHTML += `
            <tr>
                <td>${stt++}</td>
                <td>${vehicleType}</td>
                <td>${stats.potential}</td>
                <td>${stats.signed}</td>
                <td>${stats.xhd}</td>
                <td>${signRate}%</td>
            </tr>
        `;
        totalPotential += Number(stats.potential) || 0;
        totalSigned += Number(stats.signed) || 0;
        totalXhd += Number(stats.xhd) || 0;
    });

    const otherVehicleTypeCount = Object.keys(otherVehicleTypes).length;
    let otherVehicleTypePotential = 0;
    Object.values(otherVehicleTypes).forEach(stats => {
        otherVehicleTypePotential += stats.potential;
    });

    if (otherVehicleTypeCount > 0) {
        mainVehicleTypeData.push({ 
            vehicleType: `${otherVehicleTypeCount} loại xe khác`, 
            potential: otherVehicleTypePotential, 
            signed: 0, 
            xhd: 0 
        });
        tbody.innerHTML += `
            <tr class="toggle-row" onclick="toggleDetails(this)">
                <td>${stt++}</td>
                <td>${otherVehicleTypeCount} loại xe khác</td>
                <td>${otherVehicleTypePotential}</td>
                <td>0</td>
                <td>0</td>
                <td>0%</td>
            </tr>
            <tr class="detail-row">
                <td colspan="6">
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>LOẠI XE</th>
                                <th>KH TIỀM NĂNG</th>
                                <th>KÝ</th>
                                <th>XUẤT</th>
                                <th>TỈ LỆ KÝ MỚI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(otherVehicleTypes).map((vehicleType, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${vehicleType}</td>
                                    <td>${otherVehicleTypes[vehicleType].potential}</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </td>
            </tr>
        `;
        totalPotential += Number(otherVehicleTypePotential) || 0;
    }

    const totalSignRate = totalPotential > 0 ? ((totalSigned / totalPotential) * 100).toFixed(2) : 0;
    tbody.innerHTML += `
        <tr class="total-row">
            <td colspan="2">Tổng</td>
            <td>${totalPotential}</td>
            <td>${totalSigned}</td>
            <td>${totalXhd}</td>
            <td>${totalSignRate}%</td>
        </tr>
    `;

    // Vẽ biểu đồ tỉ trọng KÝ HĐ
    const ctxSigned = document.getElementById('vehicleTypeChartSigned').getContext('2d');
    if (window.vehicleTypeChartSigned && typeof window.vehicleTypeChartSigned.destroy === 'function') {
        window.vehicleTypeChartSigned.destroy();
    }

    const totalSignedForChart = mainVehicleTypeData.reduce((sum, data) => sum + (Number(data.signed) || 0), 0);
    const isSignedEmpty = totalSignedForChart === 0;

    const signedData = mainVehicleTypeData.map(data => Number(data.signed) || 0);
    const signedLabels = mainVehicleTypeData.map(data => data.vehicleType);

    ctxSigned.canvas.style.display = 'block';
    ctxSigned.canvas.style.opacity = isSignedEmpty ? '0.3' : '1';

    window.vehicleTypeChartSigned = new Chart(ctxSigned, {
        type: 'pie',
        data: {
            labels: signedLabels,
            datasets: [{
                label: 'Tỉ trọng KÝ HĐ',
                data: signedData,
                backgroundColor: isSignedEmpty ? ['#D3D3D3'] : [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9',
                    '#92A8D1', '#955251', '#B565A7', '#009B77', '#DD4124',
                    '#D65076', '#45B8AC', '#EFC050', '#5B5EA6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tỉ trọng KÝ HĐ giữa các loại xe'
                },
                datalabels: {
                    color: '#000',
                    formatter: (value, context) => {
                        return value > 0 ? value : '';
                    },
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Vẽ biểu đồ tỉ trọng XHĐ
    const ctxXhd = document.getElementById('vehicleTypeChartXhd').getContext('2d');
    if (window.vehicleTypeChartXhd && typeof window.vehicleTypeChartXhd.destroy === 'function') {
        window.vehicleTypeChartXhd.destroy();
    }

    const totalXhdForChart = mainVehicleTypeData.reduce((sum, data) => sum + (Number(data.xhd) || 0), 0);
    const isXhdEmpty = totalXhdForChart === 0;

    const xhdData = mainVehicleTypeData.map(data => Number(data.xhd) || 0);
    const xhdLabels = mainVehicleTypeData.map(data => data.vehicleType);

    ctxXhd.canvas.style.display = 'block';
    ctxXhd.canvas.style.opacity = isXhdEmpty ? '0.3' : '1';

    window.vehicleTypeChartXhd = new Chart(ctxXhd, {
        type: 'pie',
        data: {
            labels: xhdLabels,
            datasets: [{
                label: 'Tỉ trọng XHĐ',
                data: xhdData,
                backgroundColor: isXhdEmpty ? ['#D3D3D3'] : [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9',
                    '#92A8D1', '#955251', '#B565A7', '#009B77', '#DD4124',
                    '#D65076', '#45B8AC', '#EFC050', '#5B5EA6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tỉ trọng XHĐ giữa các loại xe'
                },
                datalabels: {
                    color: '#000',
                    formatter: (value, context) => {
                        return value > 0 ? value : '';
                    },
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Hàm mở rộng/thu gọn chi tiết các tỉnh khác
function toggleDetails(row) {
    const detailRow = row.nextElementSibling;
    if (detailRow.style.display === 'table-row') {
        detailRow.style.display = 'none';
    } else {
        detailRow.style.display = 'table-row';
    }
}