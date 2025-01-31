document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', (e) => {
        errorMessage.style.display = 'none'
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email === 'login@mail.ru' && password === '123') {
            // Успешный вход
            window.location.href = './admin.html'
            
        } else {
            // Неверные данные
            errorMessage.style.display = 'block'
            errorMessage.textContent = 'Неверный email или пароль. Для восстановления доступа обратитесь к администратору';
        }
    });
});