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
      <td>
        <div class="project-name-wrapper">
          <span class="project-name-title">${project.name}  <sup class="project-name-title_id">№${project.id}</sup></span> 
          
          <div class="bubble-full-name">${project.name}</div>
          <a data-id='${project.id}' onclick="setUrlParam('edit',${project.id})">Изменить</a>
        </div>
      </td>
      
      <td>${date.days}.${date.months}.${date.year}</td>
      <td>${project.description === 'undefined' ? '0' : project.description}</td>
      <td><a data-id='${project.id}' onclick="loadQr(${project.id}, '${project.name}')">Скачать QR-код</a></td>
      <div class="btn-group">
          <div class="btn-basket" onclick="showPopupDeleteProject(${project.id}, this)"></div>
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
        <td>
          <div class="table-user__name">
            ${user.name} ${user.surname}
          </div>
        </td>
        
        <td>
          <div class="table-user__email">
            ${user.email}
          </div>
        </td>
        <td>
        
        <span class="${user.role === 0 ? 'role_user' : 'role_admin'}">${user.role === 0 ? 'пользователь' : 'администратор'}</span>
        </td>
        <div class="btn-group">
          <a class="btn-edit" onclick="showPopupEdit('${user.name}','${user.email}','${user.role}','${user.id}')">Изменить</a>
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


function createFileRow(dataArray) {
  tableBody.innerHTML = '';

  if (!dataArray || dataArray.length === 0) {
    return;
  }

  dataArray.forEach((item, index) => {
    const newRow = document.createElement('tr');
    const { image, video } = item;

    // Обрабатываем изображение
    const imageCell = document.createElement('td');
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'file-input-wrapper photo-wrapper';

    if (image.id === -1) {
      imageWrapper.innerHTML = `
        <input type="file" data-scene-id="${index}" class="file-input photo-input" accept=".jpg,.jpeg,.png" style="display:none;">
        <span class="files-item__name">Выберите фото (JPEG или PNG)</span>
        <div class="files-item__btns" style="display: none;">
          <div class="btn-download"></div>
          <div class="btn-delete"></div>
        </div>
      `;
    } else {
      imageWrapper.innerHTML = `
        <span class="files-item__name" data-scene-id="${index}" data-id="${image.id}" data-url="${image.url}">${image.name}</span>
        <div class="files-item__btns" style="display: flex;">
          <div class="btn-download" onclick="loadFile('${image.name}','${image.url}')"></div>
          <div class="btn-delete" onclick="deleteImage(${index}, this)"></div>
        </div>
      `;
    }

    imageCell.appendChild(imageWrapper);
    newRow.appendChild(imageCell);

    // Обрабатываем видео
    const videoCell = document.createElement('td');
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'file-input-wrapper video-wrapper';

    if (video.id === -1) {
      videoWrapper.innerHTML = `
        <input type="file" data-scene-id="${index}" class="file-input video-input" accept=".mp4" style="display:none;">
        <span class="files-item__name">Выберите видео (MP4)</span>
        <div class="files-item__btns" style="display: none;">
          <div class="btn-download"></div>
          <div class="btn-delete"></div>
        </div>
      `;
    } else {
      videoWrapper.innerHTML = `
        <span class="files-item__name" data-scene-id="${index}" data-id="${video.id}" data-url="${video.url}">${video.name}</span>
        <div class="files-item__btns" style="display: flex;">
          <div class="btn-download" onclick="loadFile('${video.name}','${video.url}')"></div>
          <div class="btn-delete" onclick="deleteVideo(${index}, this)"></div>
        </div>
      `;
    }



    videoCell.appendChild(videoWrapper);
    newRow.appendChild(videoCell);

    // Добавляем кнопку удаления строки
    const deleteCell = document.createElement('td');
    deleteCell.className = 'td_btn';
    deleteCell.innerHTML = `<div class="btn-basket" onclick="clearScene(${index})"></div>`;
    newRow.appendChild(deleteCell);

    // Добавляем строку в таблицу
    tableBody.appendChild(newRow);

    // Добавляем обработчики событий для текста и инпутов файлов
    const photoInput = imageWrapper.querySelector('.photo-input');
    const photoText = imageWrapper.querySelector('.files-item__name');
    const videoInput = videoWrapper.querySelector('.video-input');
    const videoText = videoWrapper.querySelector('.files-item__name');

    if (photoInput && photoText) {
      photoText.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', (event) => handleFileUpload(event, 'photo', index));
    }

    if (videoInput && videoText) {
      videoText.addEventListener('click', () => videoInput.click());
      videoInput.addEventListener('change', (event) => handleFileUpload(event, 'video', index));
    }
  });
}


function loadFile(name, url) {
  window.open(url, '_blank');
}

function deleteVideo(sceneIndex, elem) {
  elem.closest('td').classList.add('delete');
  User.ReplaceSceneObject(openProject, sceneIndex, openProject.content[sceneIndex].image.id, -1, ()=> console.log('video delete'));
};
function deleteImage(sceneIndex, elem) {
  elem.closest('td').classList.add('delete');
  User.ReplaceSceneObject(openProject, sceneIndex, -1, openProject.content[sceneIndex].video.id, ()=> console.log('image delete'));
}
let sceneId;
// Обработчик загрузки файла
function handleFileUpload(event, type, sceneIndex) {
  event.target.closest('td').classList.add('uploading');
  event.target.closest('td').querySelector('.files-item__name').textContent = "Загрузка";
  const file = event.target.files[0];
  if (!file) return;
  sceneId = sceneIndex;

  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const pid = openProject.projectId; // ID проекта

  // Чтение файла как Blob
  const reader = new FileReader();
  reader.onload = function (e) {
    const blob = new Blob([e.target.result], { type: file.type });


    if (type === 'photo') {
      User.CreateMarker(fileName, fileExtension, pid, blob, res => saveFileIdImage(sceneId, res))
      // Сохраняем ID фото
    } else if (type === 'video') {
      User.CreateMarker(fileName, fileExtension, pid, blob, res => saveFileIdVideo(sceneId, res))
      // Сохраняем ID видео

    }
  };
  reader.readAsArrayBuffer(file);
}

function fileSend(file, callback) {
  console.log(file.name);
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const pid = openProject.projectId; // ID проекта

  // Чтение файла как Blob
  const reader = new FileReader();
  reader.onload = function (e) {
    const blob = new Blob([e.target.result], { type: file.type });
    // Возвращаем результат через колбэк
    callback({ fileName, fileExtension, blob });
  };
  reader.readAsArrayBuffer(file);
}

// Сохраняем ID файла для дальнейшего использования
function saveFileIdImage(sceneIndex, fileId) {
  User.ReplaceSceneObject(openProject, sceneIndex, fileId, openProject.content[sceneIndex].video.id, ()=> console.log('image add'));
}

function saveFileIdVideo(sceneIndex, fileId) {
  User.ReplaceSceneObject(openProject, sceneIndex, openProject.content[sceneIndex].image.id, fileId, ()=> console.log('video add'));
}

function clearScene(index) {
  User.DeleteSceneObject(openProject, index);
  parsingProject();
}


const batchInput = document.getElementById('batch-input');
const banchBtn = document.querySelector('.primary-btn.batch-upload');
const batchLoadAnim = document.querySelector('.load-batch');

banchBtn.addEventListener('click', () => batchInput.click());
batchInput.addEventListener('change', (event) => batchUpload(event));

function UploadPair(pairs, index) {
  const projectID = openProject.projectId;
  if (index < pairs.length) {
    User.CreateSceneObjects(openProject, -1, -1, () => {
      let projIndex = openProject.content.length - 1
      if (pairs[index] != null)
        User.CreateMarker(`${pairs[index].fileName}.${pairs[index].fileExtension}`, pairs[index].fileExtension, projectID, pairs[index].blob, id => {
          if (id != null)
            User.ReplaceSceneObject(openProject, projIndex, id, openProject.content[projIndex].id, () => {
              if (id != null && pairs[index + 1] != null)
                User.CreateVideo(`${pairs[index + 1].fileName}.${pairs[index + 1].fileExtension}`, pairs[index + 1].fileExtension, projectID, pairs[index + 1].blob, id => {
                  User.ReplaceSceneObject(openProject, projIndex, openProject.content[projIndex].image.id, id, () => {
                    UploadPair(pairs, index + 2)
                  })
                })
              else UploadPair(pairs, index + 2)
            })
          else if (pairs[index + 1] != null)
            User.CreateVideo(`${pairs[index + 1].fileName}.${pairs[index + 1].fileExtension}`, pairs[index + 1].fileExtension, projectID, pairs[index + 1].blob, id => {
              if (id != null)
                User.ReplaceSceneObject(openProject, projIndex, openProject.content[projIndex].image.id, id, () => {
                  UploadPair(pairs, index + 2)
                })
              else UploadPair(pairs, index + 2)
            })
          else UploadPair(pairs, index + 2)
        })
      else if (pairs[index + 1] != null)
        User.CreateVideo(`${pairs[index + 1].fileName}.${pairs[index + 1].fileExtension}`, pairs[index + 1].fileExtension, projectID, pairs[index + 1].blob, id => {
          User.ReplaceSceneObject(openProject, projIndex, openProject.content[projIndex].image.id, id, () => {
            UploadPair(pairs, index + 2)
          })
        })
    })
  } else {
    batchLoadAnim.style.display = 'none';
  }
}




function batchUpload(event) {
  const files = event.target.files;
  const fileMap = {};

  // Создаем структуру пар файлов
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name.split('.').slice(0, -1).join('.');
    const fileType = file.type.split('/')[0];

    if (!fileMap[fileName]) {
      fileMap[fileName] = { photo: null, video: null };
    }

    if (fileType === 'image') {
      fileMap[fileName].photo = file;
    } else if (fileType === 'video') {
      fileMap[fileName].video = file;
    }
  }

  const filePairs = Object.values(fileMap);

  // Преобразуем пары файлов в новый список
  const newList = filePairs.map(pair => {
    const image = pair.photo ? {
      fileName: pair.photo.name.split('.').slice(0, -1).join('.'),
      fileExtension: pair.photo.name.split('.').pop(),
      blob: pair.photo
    } : null;

    const video = pair.video ? {
      fileName: pair.video.name.split('.').slice(0, -1).join('.'),
      fileExtension: pair.video.name.split('.').pop(),
      blob: pair.video
    } : null;

    return [image, video];
  }).flat(); // Преобразуем массив массивов в плоский массив
  console.log(newList)

  function UploadPairs() {
    batchLoadAnim.style.display = 'flex';
    UploadPair(newList, 0);
    batchInput.value= '';
  }
  
  UploadPairs();
  
}