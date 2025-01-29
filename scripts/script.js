// nav btns
const navBtns = document.querySelector('.header__nav').querySelectorAll('.header__nav_link');
navBtns.forEach((btn)=> {
    btn.addEventListener('click', ()=> {
        navBtns.forEach((btn)=> btn.classList.remove('open_link'))
        btn.classList.add('open_link');
    });
})

// new-contracts
const newContractsPage = document.querySelector('.new-contracts-page');
function showNewContractsPage() {
    newContractsPage.style.display = '';
    hideAllContractsPage();
    hideAllUsersPage();
};
function hideNewContractsPage() {
    newContractsPage.style.display = 'none';
};
// all-contracts
const allContractsPage = document.querySelector('.all-contracts-page');
function showAllContractsPage() {
    allContractsPage.style.display = '';
    hideNewContractsPage();
    hideAllUsersPage();
};
function hideAllContractsPage() {
    allContractsPage.style.display = 'none';
};

// all-user
const btnUserPage = document.querySelector('.btn_open-users-page');
btnUserPage.addEventListener('click', ()=> {
    showAllUsersPage();
})
const allUsersPage = document.querySelector('.all-users-page');
function showAllUsersPage() {
    allUsersPage.style.display = '';
    hideNewContractsPage();
    hideAllContractsPage();
    navBtns.forEach((btn)=> btn.classList.remove('open_link'));
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
    btnDeleteUser.onclick = ()=> SuperAdmin.DeleteUser(id);
};
function hidePopupDelete() {
    popupDelete.style.display = 'none';
}

// edit user
const popupEdit = document.querySelector('.popup_edit');
const popupEditName = popupEdit.querySelector('input[name="name"]');
const popupEditEmail = popupEdit.querySelector('input[name="email"]');
const popupEditRoles = popupEdit.querySelectorAll('input[name="role"]')

function showPopupEdit(name, email, roleName) {
    popupEdit.style.display = '';
    popupEditName.value = name;
    popupEditEmail.value = email;
    popupEditRoles.forEach((role)=> {
        role.checked = false;
        if(roleName.toLowerCase() === role.getAttribute('data-role')) {
            role.checked = true;
        }
});
    

};
function hidePopupEdit() {
    popupEdit.style.display = 'none';
}

popupEdit.addEventListener('submit', (e)=> {
    e.preventDefault();
    hidePopupEdit()
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
btnAddUser.addEventListener('click', ()=> {
    showPopupAdd();
});



formAddUser.addEventListener('submit', (e)=> {
    e.preventDefault();

    let name = document.getElementById('input-add-name').value;
    let surname = '';
    let email = document.getElementById('input-add-email').value;
    let password = 'ad2512';
    SuperAdmin.CreateUser(name, surname, email, password);
    hidePopupAdd();
    popupAdd.querySelectorAll('input').forEach((e)=> e.value='');
});