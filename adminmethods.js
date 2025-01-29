class SuperAdmin {
    // авторизация суперюзера - админка аккаунтов
    static Auth() {
        MixarWebBackendAPI.authenticateUser("VtLhldJ9bgQIQBUl74e1YcN9Vmivxn2w", "NNhTT84xIrk06mh8ui8EyNEYtLBfd6kJ")
            .then(data => {
                console.log("[Auth] ok");
                User.GetProjects();
                SuperAdmin.GetUsers();
            }
            )
            .catch(err => {
                console.log("[Auth] error:", err);
                errorMessage.style.display = 'block'
                errorMessage.textContent = 'Неверный email или пароль. Для восстановления доступа обратитесь к администратору';
            })
    }

    // получение списка аккаунтов
    // в структуре юзера поле deleted отвечает за флаг удалённого аккаунта
    static GetUsers() {
        MixarWebBackendAPI.getUsers()
            .then(users => {
                console.log("[GetUsers]", users);
                initUsers(users)
            })
            .catch(err => {
                console.log("[GetUsers]", err)
            })
    }

    // создание обычного пользователя
    static CreateUser(name, surname, email, password) {
        MixarWebBackendAPI.createUser(name, surname, "", email, password, 0)
            .then(user => {
                console.log("[CreateUser] ok");
                SuperAdmin.GetUsers();
            })
            .catch(err => {
                console.log("[CreateUser] error:", err)
            })
    }

    // удаление пользователя
    static DeleteUser(id) {
        MixarWebBackendAPI.deleteUser(id)
            .then(user => {
                console.log("[DeleteUser] ok");
                btnDeleteUser.onclick = '';
                SuperAdmin.GetUsers();
                hidePopupDelete();
            })
            .catch(err => {
                console.log("[DeleteUser] error:", err)
            })
    }

    // восстановление пользователя
    static RestoreUser(id) {
        MixarWebBackendAPI.restoreUser(id)
            .then(user => {
                console.log("[RestoreUser] ok")
            })
            .catch(err => {
                console.log("[RestoreUser] error:", err)
            })
    }
}