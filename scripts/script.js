// nav btns
const navBtns = document.querySelector('.header__nav').querySelectorAll('.header__nav_link');
navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        navBtns.forEach((btn) => btn.classList.remove('open_link'))
        btn.classList.add('open_link');
    });
})
function closeAllPages() {
    hideAllContractsPage();
    hideAllUsersPage();
    hideNewContractsPage();
}
// new-contracts
const inputNewContract = document.querySelector('.new-contracts__input')
const newContractsPage = document.querySelector('.new-contracts-page');

let idProject;
let nameProject;
let openProject;

function parsingProject() {
    openProject.parseContent(d => {
        console.log("[1]", d);
        nameProject = d.name === undefined ? `Новый договор ${idProject}` : d.name;
        inputNewContract.value = nameProject;
        let content = project.content;
        console.log(content);
        createFileRow(content);

    });
}
function showNewContractsPage(res) {
    idProject = res;
    closeAllPages()
    newContractsPage.style.display = '';
    User.GetProject(idProject, data => {
        header = data;
        User.GetProjectData(idProject, data => {
            scene = data
            project = new Scene(scene, header);
            openProject = project;
            updateProject();
            parsingProject();
        });
    });
    


};

function updateProject() {
    openProject.header.name = inputNewContract.value;
    User.UpdateProject(openProject, (res) => console.log('update proj', res))
}
function hideNewContractsPage() {
    newContractsPage.style.display = 'none';
};
// all-contracts
const allContractsPage = document.querySelector('.all-contracts-page');
function showAllContractsPage() {
    closeAllPages()
    allContractsPage.style.display = '';

};
function hideAllContractsPage() {
    allContractsPage.style.display = 'none';
};

// all-user
const btnUserPage = document.querySelector('.btn_open-users-page');
btnUserPage.addEventListener('click', () => {
    showAllUsersPage();
})
const allUsersPage = document.querySelector('.all-users-page');
function showAllUsersPage() {
    closeAllPages()
    allUsersPage.style.display = '';

    navBtns.forEach((btn) => btn.classList.remove('open_link'));
};
function hideAllUsersPage() {
    allUsersPage.style.display = 'none';
};


///delte user
const popupDelete = document.querySelector('.popup_delete');
const btnDeleteUser = document.getElementById('btn-delete-user')
function showPopupDelete(name, id) {
    popupDelete.style.display = '';
    document.getElementById('nameRole').textContent = name;
    console.log(id)
    btnDeleteUser.onclick = () => SuperAdmin.DeleteUser(id);
};
function hidePopupDelete() {
    popupDelete.style.display = 'none';
}

// edit user
const popupEdit = document.querySelector('.popup_edit');
const popupEditName = popupEdit.querySelector('input[name="name"]');
const popupEditEmail = popupEdit.querySelector('input[name="email"]');
const popupEditRoles = popupEdit.querySelectorAll('input[name="role"]');
const popupEditPassword = popupEdit.querySelector('input[name="password"]')

let userEditId;
function showPopupEdit(name, email, roleName, password, id) {
    userEditId = id;
    popupEdit.style.display = '';
    popupEditName.value = name;
    popupEditEmail.value = email;
    popupEditPassword.value = password;
    popupEditRoles.forEach((role) => {
        role.checked = false;
        if (roleName === '0' && role.getAttribute('data-role') === 'пользователь') {
            role.checked = true;
        } else if (roleName !== '0' && role.getAttribute('data-role') === 'администратор') {
            role.checked = true;
        }
    });


};
function hidePopupEdit() {
    popupEdit.style.display = 'none';
}

popupEdit.addEventListener('submit', (e) => {
    e.preventDefault();


    let name = popupEditName.value;
    let email = popupEditEmail.value;
    let password = popupEditPassword.value;
    let role;
    popupEditRoles.forEach((roleInput) => {
        if (roleInput.checked) {
            role = roleInput.getAttribute('data-role') === 'администратор' ? role = 1000 : role = 0;
        };

    });
    SuperAdmin.UpdateUser(userEditId, name, '', email, password, role);
});

///add user
const popupAdd = document.querySelector('.popup_new-account');
const formAddUser = document.getElementById('addUserForm');
const btnAddUser = document.querySelector('.btn-add-user');
function showPopupAdd() {
    popupAdd.style.display = '';
    btnAddUser.classList.add('open-popup')
};
function hidePopupAdd() {
    popupAdd.style.display = 'none';
    btnAddUser.classList.remove('open-popup')
};
btnAddUser.addEventListener('click', () => {
    showPopupAdd();
});



formAddUser.addEventListener('submit', (e) => {
    e.preventDefault();

    let name = document.getElementById('input-add-name').value;
    let surname = '';
    let email = document.getElementById('input-add-email').value;
    let password = document.getElementById('input-add-password').value;
    let role = document.getElementById('input-add-role').checked === true ? 1000 : 0;
    SuperAdmin.CreateUser(name, surname, email, password, role);
    hidePopupAdd();
    console.log('role-', role)
    popupAdd.querySelectorAll('input').forEach((e) => e.value = '');
});
// Toggle password visibility
const togglePassword = document.querySelector('.icon-toggle-password');
const passwordInput = document.getElementById('input-add-password');
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.closest('.label-input').classList.toggle('show-password');
});
