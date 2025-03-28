// Kiểm tra mật khẩu
document.getElementById('password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const correctPassword = 'admin123'; // Mật khẩu cứng, bạn có thể thay đổi

    if (password === correctPassword) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
    } else {
        alert('Mật khẩu sai! Vui lòng thử lại.');
    }
});

// Hàm đăng xuất
function logout() {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('password').value = ''; // Xóa mật khẩu đã nhập
}