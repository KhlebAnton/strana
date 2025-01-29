// project
// 
// 
let projectData;
let filteredProjectsData;

function initProject(projects) {
  projectData = projects;
  setupSearchFilter(projectData);
  updateDisplayProject(projectData);
}

// project update
function updateDisplayProject(projects) {
  renderProjects(projects, currentPageProj, itemsProjPage);
  setupPagination(
    'proj',
    projects.length,
    itemsProjPage,
    currentPageProj,
    projects,
    (newPage) => {
      currentPageProj = newPage;
      updateDisplayProject(projects);
    }
  );
};

// project render
const projectTableBody = document.getElementById('projectTableBody');

const itemsProjPage = 3;
let currentPageProj = 1;

function renderProjects(projects, page, itemsPerPage) {
  projectTableBody.innerHTML = '';

  if (projects.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3">No projects found</td>';
    projectTableBody.appendChild(row);
    return;
  }

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedProjects = projects.slice(start, end);

  paginatedProjects.forEach(project => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${project.name} <a data-id='${project.id}' href='#'>Изменить</a></td>
      
      <td>${project.updated}</td>
      <td>0</td>
      <td><a data-id='${project.id}' href='#'>Скачать QR-код</a></td>
      <div class="btn-group">
          <div class="btn-delete"></div>
      </div>
    `;
    projectTableBody.appendChild(row);
  });
  
}

// project filter

function setupSearchFilter(projects) {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');

  function updateClearButtonVisibility() {
    clearBtn.style.display = searchInput.value ? 'block' : 'none';
  }

  function performSearch() {
    const searchValue = searchInput.value.toLowerCase().trim();

    if (searchValue) {
      filteredProjectsData = projects.filter(project => {
        const nameMatch = project.name.toLowerCase().includes(searchValue);
        return nameMatch;
      });
    } else {
      filteredProjectsData = projects;
    }
    currentPageProj = 1;
    updateDisplayProject(filteredProjectsData);
  }

  searchInput.addEventListener('input', updateClearButtonVisibility);

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateClearButtonVisibility();
    performSearch();
  });

  searchBtn.addEventListener('click', performSearch);

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Initial state
  updateClearButtonVisibility();
}
// 
// users
// 

function initUsers(users) {
  usersData = users.filter(user => !user.deleted);
  updateDisplayUser(usersData)
}
// users update
function updateDisplayUser(user) {
  renderUsers(user, currentPageUser, itemsUserPage);
  setupPagination(
    'user',
    user.length,
    itemsUserPage,
    currentPageUser,
    user,
    (newPage) => {
      currentPageUser = newPage;
      updateDisplayUser(user);
    }
  );
}
// users render
const userTableBody = document.getElementById('userTableBody');

const itemsUserPage = 4;
let currentPageUser = 1;

function renderUsers(users, page, itemsPerPage) {
  userTableBody.innerHTML = '';

  if (users.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3">No users found</td>';
    userTableBody.appendChild(row);
    return;
  }

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = users.slice(start, end);

  paginatedUsers.forEach(user => {
    if(!user.deleted) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.name} ${user.surname}</td>
        
        <td>${user.email}</td>
        <td>
        
        <span class="${user.role === 0 ? 'role_user' : 'role_admin'}">${user.role === 0 ? 'пользователь' : 'администратор'}</span>
        </td>
        <div class="btn-group">
          <div class="btn-delete" onclick="showPopupDelete('(${user.name})',${user.id})"></div>
          <div class="btn-edit" onclick="showPopupEdit('${user.name}','${user.email}','${user.role}')"></div>
        </div>
      `;
      userTableBody.appendChild(row);
    }
    
  });
}



// paginations
function setupPagination(pagePagination, totalItems, itemsPerPage, currentPage, filteredProjects, onPageChange) {
  let paginationContainer = document.getElementById(`${pagePagination === 'user' ? 'paginationUser' : 'pagination'}`);
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  paginationContainer.innerHTML = '';

  if (totalItems === 0) {
    return;
  }

  const prevButton = document.createElement('button');
  prevButton.className = 'page-btn nav-btn nav-prev';
  prevButton.textContent = '';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  paginationContainer.appendChild(prevButton);

  const createPageButton = (pageNum) => {
    const button = document.createElement('button');
    button.className = `page-btn ${currentPage === pageNum ? 'active' : ''}`;
    button.textContent = pageNum;

    button.addEventListener('click', () => {
      onPageChange(pageNum);
    });

    return button;
  };

  const addEllipsis = () => {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'ellipsis';
    ellipsis.textContent = '...';
    paginationContainer.appendChild(ellipsis);
  };

  paginationContainer.appendChild(createPageButton(1));

  if (currentPage > 4) {
    addEllipsis();
  }

  for (let i = 2; i > 0; i--) {
    if (currentPage - i > 1) {
      paginationContainer.appendChild(createPageButton(currentPage - i));
    }
  }

  if (currentPage !== 1 && currentPage !== pageCount) {
    paginationContainer.appendChild(createPageButton(currentPage));
  }

  for (let i = 1; i <= 2; i++) {
    if (currentPage + i < pageCount) {
      paginationContainer.appendChild(createPageButton(currentPage + i));
    }
  }

  if (currentPage < pageCount - 3) {
    addEllipsis();
  }

  if (pageCount > 1) {
    paginationContainer.appendChild(createPageButton(pageCount));
  }

  const nextButton = document.createElement('button');
  nextButton.className = 'page-btn nav-btn nav-next';
  nextButton.textContent = '';
  nextButton.disabled = currentPage === pageCount;
  nextButton.addEventListener('click', () => {
    if (currentPage < pageCount) {
      onPageChange(currentPage + 1);
    }
  });
  paginationContainer.appendChild(nextButton);
}


