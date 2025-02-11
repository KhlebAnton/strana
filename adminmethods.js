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
    static GetUsers(callback) {
        MixarWebBackendAPI.getUsers()
        .then(users => {
            let users2 = []
            for (let i = users.length - 1; i >= 0; i--)
                users2.push(users[i])
            callback(users2)
            console.log(users2)
        })
            .catch(err => {
                console.log("[GetUsers]", err)
                callback(null)
            })
    }

    // создание  пользователя
    static CreateUser(name, surname, email, password, role) {
        MixarWebBackendAPI.createUser(name, surname, "", email, password, role)
            .then(user => {
                console.log("[CreateUser] ok");
                SuperAdmin.GetUsers(res => { initUsers(res)})
            })
            .catch(err => {
                console.log("[CreateUser] error:", err)
            })
    }

    static UpdateUser(id, name, surname, email, password, role) {
        MixarWebBackendAPI.updateUser(id, name, surname, "", email, password, role)
            .then(user => {
                console.log("[UpdateUser] ok");
                SuperAdmin.GetUsers(res => { initUsers(res)});
                hidePopupEdit();
            })
            .catch(err => console.log("[UpdateUser] error:", err))
    }

    // удаление пользователя
    static DeleteUser(id) {
        MixarWebBackendAPI.deleteUser(id)
            .then(user => {
                console.log("[DeleteUser] ok");
                btnDeleteUser.onclick = '';
                SuperAdmin.GetUsers(res => { initUsers(res)})
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