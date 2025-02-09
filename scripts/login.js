document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (e) => {
        errorMessage.style.display = 'none'
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        User.Auth(email, password, result => {
            if (result === true) {
                window.location.href = './admin.html'
            } else {
                // Неверные данные
                errorMessage.style.display = 'block'
                errorMessage.textContent = 'Неверный email или пароль. Для восстановления доступа обратитесь к администратору';
            }
        })
    });
});