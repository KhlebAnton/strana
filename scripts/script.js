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
    nameProject = undefined;
    inputNewContract.value = '';
    tableBody.innerHTML = '';
}
// new-contracts
const inputNewContract = document.querySelector('.new-contracts__input')
const newContractsPage = document.querySelector('.new-contracts-page');

inputNewContract.addEventListener('change', ()=> {
    openProject.header.name = inputNewContract.value;
})

let idProject;
let nameProject;
let openProject;

const qrel = document.getElementById('qrel');
const qrelBtn = document.getElementById('qrel-btn');
function setLocation(curLoc){
    try {
      history.pushState(null, null, curLoc);
      return;
    } catch(e) {}
    location.hash = '#' + curLoc;
}
qrelBtn.addEventListener('click', () => {
    loadQr(idProject, nameProject)
});
function loadQr(id, name) {
    User.GenerateQR(id, qrel, urlQR => {
        var link = document.createElement("a");
        link.download = `QR-${name}`;
        link.href = urlQR;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    })
}
const uploadingPhotoCount = document.getElementById('uploadingPhoto');

function parsingProject(callback = null) {
    openProject.parseContent(d => {
        nameProject = d.header.name === "undefined" ? `Новый договор ${idProject}` : d.header.name;
        d.header.name = nameProject;
        inputNewContract.value = nameProject;
        let content = project.content;
        console.log(content)
        createFileRow(content);
        
        uploadingPhotoCount.textContent = project.content.length;
        newContractsPage.style.display = '';
        if (callback != null) callback();
        
    });
}

const titleNewContract = document.getElementById('title-new-page');
function showNewContractsPage(res, newProject = true) {
    setLocation('contracts')
    titleNewContract.textContent = `
    ${newProject === true ? 'Создание нового договора' : 'Изменение договора'}
    `;
    
    idProject = res;
    closeAllPages();
    
    User.GetProject(idProject, data => {
        header = data;
        User.GetProjectData(idProject, data => {
            scene = data
            project = new Scene(scene, header);
            openProject = project;
            parsingProject();
            updateProject();
        });
    });



};
const btnSaveProject = document.querySelector('.btn-save-project');
function updateProject(btnClick= false) {
    User.UpdateProject(openProject, (res) => 
        {
            console.log('update proj', res);
            if(btnClick) {
                btnSaveProject.classList.add('saved');
                btnSaveProject.textContent = 'Сохранено!'

                setTimeout(()=> {
                    btnSaveProject.classList.remove('saved');
                    btnSaveProject.textContent = 'Сохранить'
                },3000)
            }


    })
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
    setLocation('users');
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
function showPopupEdit(name, email, roleName, id) {
    userEditId = id;
    popupEdit.style.display = '';
    popupEditName.value = name;
    popupEditEmail.value = email;
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

const errBlock = document.querySelector('.error-message_block');
const errMsg = document.querySelector('.error-message_text');
function errorMsg(msg) {
    errMsg.textContent = msg;
    errBlock.style.display = 'block';
    setTimeout(()=> errBlock.style.display = 'none',5000)
}

// аккаунт кнопка
const accountBtn = document.querySelector('.account_btn');

function toggleDropdown(event) {
    event.stopPropagation(); // Останавливаем всплытие события, чтобы не сработал document.click
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    accountBtn.classList.toggle('open')
  }
  
  function hideDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.style.display = 'none';
    accountBtn.classList.remove('open');
  }
  
  // Закрытие меню при клике вне его области
  document.addEventListener('click', function(event) {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (event.target !== dropdownButton && !dropdownMenu.contains(event.target)) {
      dropdownMenu.style.display = 'none';
      accountBtn.classList.remove('open');
    }
  });

  window.addEventListener('popstate', function(event) {
    
    location.reload();
    
});