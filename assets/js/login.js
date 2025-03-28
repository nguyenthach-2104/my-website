document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Giả lập đăng nhập (có thể thay bằng API Google Apps Script)
    if (username === 'admin' && password === '12345') {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'dashboard.html';
    } else {
        alert('Sai thông tin đăng nhập!');
    }
});