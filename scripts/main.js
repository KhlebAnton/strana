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
    let date = ToDate(project.create);
    row.innerHTML = `
      <td>${project.name} <a data-id='${project.id}' href='#'>Изменить</a></td>
      
      <td>${date.days}.${date.months}.${date.year}</td>
      <td>0</td>
      <td><a data-id='${project.id}' href='#'>Скачать QR-код</a></td>
      <div class="btn-group">
          <div class="btn-basket"></div>
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
    if (!user.deleted) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.name} ${user.surname}</td>
        
        <td>${user.email}</td>
        <td>
        
        <span class="${user.role === 0 ? 'role_user' : 'role_admin'}">${user.role === 0 ? 'пользователь' : 'администратор'}</span>
        </td>
        <div class="btn-group">
          <a class="btn-edit" onclick="showPopupEdit('${user.name}','${user.email}','${user.role}','${user.secret}','${user.id}')">Изменить</a>
          <div class="btn-basket" onclick="showPopupDelete('(${user.name})',${user.id})"></div>
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


// add projects
const tableBody = document.querySelector('.new-contracts-table-body');
const addPhotoBtn = document.querySelector('.add-photo');
const batchUploadBtn = document.querySelector('.batch-upload');
const batchPhotoInput = document.getElementById('batch-photo-input');
const batchVideoInput = document.getElementById('batch-video-input');


// Максимальное количество пар файлов
const MAX_FILE_PAIRS = 100;

function createFileRow(photoFile = null, videoFile = null) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <div class="file-input-wrapper photo-wrapper">
                <input type="file" class="file-input photo-input" accept=".jpg,.jpeg,.png" style="display:none;">
                <span class="files-item__name">${photoFile ? photoFile.name : 'Выберите фото (JPEG или PNG)'}</span>
                <div class="files-item__btns" style="display: ${photoFile ? 'flex' : 'none'};">
                    <div class="btn-download"></div>
                    <div class="btn-delete"></div>
                </div>
            </div>
        </td>
        <td>
            <div class="file-input-wrapper video-wrapper">
                <input type="file" class="file-input video-input" accept=".mp4" style="display:none;">
                <span class="files-item__name">${videoFile ? videoFile.name : 'Выберите видео (MP4)'}</span>
                <div class="files-item__btns" style="display: ${videoFile ? 'flex' : 'none'};">
                    <div class="btn-download"></div>
                    <div class="btn-delete"></div>
                </div>
            </div>
        </td>
        <td class="td_btn">
            <div class="btn-basket" onclick="this.closest('tr').remove()"></div>
        </td>
    `;

    // Setup file input handlers for the new row
    setupFileInputHandlers(newRow);

    // If files are provided, setup their handlers
    if (photoFile) {
        const photoWrapper = newRow.querySelector('.photo-wrapper');
        const photoInput = photoWrapper.querySelector('.photo-input');
        setupSingleFileHandlers(photoWrapper, photoFile);
    }

    if (videoFile) {
        const videoWrapper = newRow.querySelector('.video-wrapper');
        const videoInput = videoWrapper.querySelector('.video-input');
        setupSingleFileHandlers(videoWrapper, videoFile);
    }

    return newRow;
}

function setupSingleFileHandlers(wrapper, file) {
    const fileInput = wrapper.querySelector('.file-input');
    const fileNameSpan = wrapper.querySelector('.files-item__name');
    const btnsContainer = wrapper.querySelector('.files-item__btns');
    const downloadBtn = btnsContainer.querySelector('.btn-download');
    const deleteBtn = btnsContainer.querySelector('.btn-delete');

    // Set initial state
    fileNameSpan.textContent = file.name;
    btnsContainer.style.display = 'flex';

    // Create a new DataTransfer to simulate a FileList
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Download handler
    downloadBtn.onclick = (event) => {
        event.stopPropagation();
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Delete handler
    deleteBtn.onclick = (event) => {
        event.stopPropagation();
        fileInput.value = '';
        fileNameSpan.textContent = fileInput.classList.contains('photo-input') 
            ? 'Выберите фото (JPEG или PNG)' 
            : 'Выберите видео (MP4)';
        btnsContainer.style.display = 'none';
    };
}

function setupFileInputHandlers(row) {
    const fileWrappers = row.querySelectorAll('.file-input-wrapper');
    fileWrappers.forEach(wrapper => {
        const fileInput = wrapper.querySelector('.file-input');
        const fileNameSpan = wrapper.querySelector('.files-item__name');
        const btnsContainer = wrapper.querySelector('.files-item__btns');
        const downloadBtn = btnsContainer.querySelector('.btn-download');
        const deleteBtn = btnsContainer.querySelector('.btn-delete');

        // Open file dialog when wrapper is clicked
        wrapper.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];

            // Validate file types
            const isValidPhoto = fileInput.classList.contains('photo-input') && 
                ['image/jpeg', 'image/png'].includes(file.type);
            const isValidVideo = fileInput.classList.contains('video-input') && 
                file.type === 'video/mp4';

            if (file && (isValidPhoto || isValidVideo)) {
                // Show buttons
                btnsContainer.style.display = 'flex';

                // Set file name
                fileNameSpan.textContent = file.name;

                // Download handler
                downloadBtn.onclick = (event) => {
                    event.stopPropagation();
                    const url = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                };

                // Delete handler
                deleteBtn.onclick = (event) => {
                    event.stopPropagation();
                    fileInput.value = '';
                    fileNameSpan.textContent = fileInput.classList.contains('photo-input') 
                        ? 'Выберите фото (JPEG или PNG)' 
                        : 'Выберите видео (MP4)';
                    btnsContainer.style.display = 'none';
                };
            } else {
                // Reset file if type is invalid
                fileInput.value = '';
                alert(fileInput.classList.contains('photo-input') 
                    ? 'Пожалуйста, выберите фото в формате JPEG или PNG' 
                    : 'Пожалуйста, выберите видео в формате MP4');
            }
        });
    });
}

// Handler for adding a single row
addPhotoBtn.addEventListener('click', () => {
    if (tableBody.children.length < MAX_FILE_PAIRS) {
        const newRow = createFileRow();
        tableBody.appendChild(newRow);
    } else {
        alert(`Максимальное количество пар файлов: ${MAX_FILE_PAIRS}`);
    }
});

// Batch upload handler
batchUploadBtn.addEventListener('click', () => {
    batchPhotoInput.click();
});

// Batch file upload handler
batchPhotoInput.addEventListener('change', (e) => {
    const photoFiles = Array.from(e.target.files);
    batchVideoInput.click();

    batchVideoInput.addEventListener('change', (videoEvent) => {
        const videoFiles = Array.from(videoEvent.target.files);

        // Determine max number of rows
        const photoCount = photoFiles.length;
        const videoCount = videoFiles.length;
        const maxCount = Math.max(photoCount, videoCount);

        // Check row limit
        const remainingSlots = MAX_FILE_PAIRS - tableBody.children.length;
        const pairsToAdd = Math.min(maxCount, remainingSlots);

      

        // Add file pairs
        for (let i = 0; i < pairsToAdd; i++) {
            const photoFile = photoFiles[i] || null;
            const videoFile = videoFiles[i] || null;

            // Validate file types
            const isValidPhoto = !photoFile || ['image/jpeg', 'image/png'].includes(photoFile.type);
            const isValidVideo = !videoFile || videoFile.type === 'video/mp4';

            if (isValidPhoto && isValidVideo) {
                const newRow = createFileRow(photoFile, videoFile);
                tableBody.appendChild(newRow);
            } else {
                console.log(`Пара ${i + 1}: Неверный формат файлов. `) ;
            }
        }

        // Show upload status
        if (pairsToAdd < maxCount) {
            console.log(`Добавлено ${pairsToAdd} из ${maxCount} пар. Достигнут лимит ${MAX_FILE_PAIRS} пар.`);
        } else if (batchUploadStatus.textContent === '') {
          console.log(`Успешно добавлено ${pairsToAdd} пар файлов.`);
        }

        // Reset inputs
        batchPhotoInput.value = '';
        batchVideoInput.value = '';
    }, { once: true });
});