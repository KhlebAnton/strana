class User {
    /**
     * Авторизация
     * @param {string}email
     * @param {string}pass
     * @param callback
     */
    static Auth(email, pass, callback) {
        MixarWebBackendAPI.authenticateUser(email, pass)
            .then(data => {
                console.log("[SignIn] ok")
                callback(true)
            }
            )
            .catch(err => {
                console.log("[SignIn] error:", err)
                callback(false)
            })
    }


    /**
   * Получение списка проектов
   */
    static GetProjects() {
        MixarWebBackendAPI.getProjects()
            .then(data => {
                let projects2 = []
                for (let i = data.length - 1; i >= 0; i--)
                    projects2.push(data[i])
                console.log("[GetProjects]", projects2);
                initProject(projects2)

            })
            .catch(err => {
                console.trace("[GetProjects]", err);
                showAllContractsPage();
            })
    }



    /**
     * Создание нового проекта
     * @param {string}name
     * @param {string}description
     */

    static CreateProject(name, description) {
        let scene = Scene.createScene(name);
        MixarWebBackendAPI.createProject(name, description, 0)
            .then(res => {
                console.log("[CreateProject] ID нового проекта:", res);
                showNewContractsPage(res);
                User.GetProjects();
            })
            .catch(err => console.log("[CreateProject] error:", err))
    }

    /**
     * Удаление проекта по ID
     * @param {number}pid
     */
    static DeleteProject(pid, elem) {
        elem.closest('tr').classList.add('delete')
        MixarWebBackendAPI.deleteProject(pid)
            .then(_ => {
                console.log("[DeleteProject] ok");
                hidePopupDeleteProject();
                User.GetProjects();
            })
            .catch(err => console.log("[DeleteProject] error:", err))
    }

    /**
     * Восстановление удалённого проекта по ID
     * @param {number}pid
     */
    static RestoreProject(pid) {
        MixarWebBackendAPI.restoreProject(pid)
            .then(_ => {
                console.log("[RestoreProject] ok");
                User.GetProjects();
            })
            .catch(err => console.log("[RestoreProject] error:", err))
    }

    /**
     * Получение заголовка проекта по ID
     * @param {number}id
     * @param callback
     */
    static GetProject(id, callback) {
        MixarWebBackendAPI.getProject(id)
            .then(data => callback(data))
            .catch(err => console.trace("[GetProject]", err))
    }

    /**
     * Получение содержимого проекта по ID
     * @param {number}id
     */
    static GetProjectData(id, callback) {
        MixarWebBackendAPI.getProjectData(id)
            .then(data => callback(data))
            .catch(err => {
                console.trace("[GetProjectData]", err);
                showAllContractsPage();
                errorMsg(err)
            })
    }

    /**
     * Обновление (загрузка) проекта на сервер
     * @param {Scene}project
     */
    static UpdateProject(project, callback) {
        MixarWebBackendAPI.updateProject(project.projectId, project.header.name, project.header.description, project.header.visibility, JSON.stringify(project.project))
            .then(res => {
                callback(res);
                User.GetProjects();
            })
            .catch(err => console.log("[UpdateProject] error:", err))
    }


    /**
     * Загрузка маркера (картинки) на сервер и получение contentId файла для использования в проекте
     @param {string}name - имя
     @param {string}extension - расширение
     @param {number}pid - id проекта
     @param {Blob}blob - бинарные данные файла
     @param {function(number|null)}callback
     */
    static CreateMarker(name, extension, pid, blob, callback = null) {
        MixarWebBackendAPI.createAsset(name, "image", extension, pid, blob)
            .then(res => {
                console.log("[CreateMarker] contentId:", res)
                if (callback != null) callback(res)
            })
            .catch(err => {
                console.log("[CreateMarker] error:", err)
                callback(null)
            })
    }


    /**
     * Загрузка видео на сервер и получение contentId файла для использования в проекте
     @param {string}name - имя
     @param {string}extension - расширение
     @param {number}pid - id проекта
     @param {Blob}blob - бинарные данные файла
     @param {function(number|null)}callback
     */
    static CreateVideo(name, extension, pid, blob, callback = null) {
        MixarWebBackendAPI.createAsset(name, "video", extension, pid, blob)
            .then(res => {
                console.log("[CreateVideo] contentId:", res);
                if (callback != null) callback(res)
            })
            .catch(err => {
                console.log("[CreateVideo] error:", err)
                callback(null)
            })
    }

    /**
     * Добавление в сцену файлов с сервера
     * @param {Scene}scene
     * @param {number}markerId
     * @param {number}videoId
     * @param {function()}callback
     */
    static CreateSceneObjects(scene, markerId, videoId, callback = null) {
        let marker = { name: "" }
        let video = { name: "" }
        MixarWebBackendAPI.getAsset(markerId)
            .then(asset => {
                marker = asset
                MixarWebBackendAPI.getAsset(videoId)
                    .then(asset => {
                        video = asset
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.addContent(marker, video)
                        console.log("[CreateSceneObjects] marker: yes, video: yes")
                        parsingProject(callback)
                    })
                    .catch(err => {
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.addContent(marker, video)
                        console.log("[CreateSceneObjects] marker:yes, video:no");
                        parsingProject(callback)
                    })
            })
            .catch(err => {
                MixarWebBackendAPI.getAsset(videoId)
                    .then(asset => {
                        video = asset
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.addContent(marker, video)
                        console.log("[CreateSceneObjects] marker:no, video:yes")
                        parsingProject(callback)
                    })
                    .catch(err => {
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.addContent(marker, video)
                        console.log("[CreateSceneObjects] marker:no, video:no")
                        parsingProject(callback)
                    })
            })
    }

    /**
     * Удаление из проекта пары маркер+видео
     * @param {Scene}scene
     * @param {number}index
     */
    static DeleteSceneObject(scene, index) {
        scene.removeContent(index)

    }

    /**
     * Заменяет объекты в сцене по индексу
     * @param {Scene}scene
     * @param {number}index
     * @param {number}markerId
     * @param {number}videoId
     * @param callback
     * @constructor
     */
    static ReplaceSceneObject(scene, index, markerId, videoId, callback) {
        let marker = { name: "" }
        let video = { name: "" }
        MixarWebBackendAPI.getAsset(markerId)
            .then(asset => {
                marker = asset
                MixarWebBackendAPI.getAsset(videoId)
                    .then(asset => {
                        video = asset
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.replaceContent(index, marker, video)
                        console.log("[ReplaceSceneObject] marker: yes, video: yes")
                        parsingProject(() => {
                            this.SetVideoAspect(scene, index, () => {
                                if (callback != null) callback()
                            })
                        })


                    })
                    .catch(err => {
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.replaceContent(index, marker, video)
                        console.log("[ReplaceSceneObject] marker:yes, video:no")
                        parsingProject(callback)
                    })
            })
            .catch(err => {
                MixarWebBackendAPI.getAsset(videoId)
                    .then(asset => {
                        video = asset
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.replaceContent(index, marker, video)
                        console.log("[ReplaceSceneObject] marker:no, video:yes")
                        parsingProject(callback)
                    })
                    .catch(err => {
                        marker = scene.createMarker(markerId, marker.name)
                        video = scene.createObject(marker.id, videoId, video.name)
                        scene.replaceContent(index, marker, video)
                        console.log("[ReplaceSceneObject] marker:no, video:no")
                        parsingProject(callback)
                    })
            })
    }


    static baseURL = "https://dummy.org"
    static qrcode = null

    /**
     *
     * @param {number}id
     * @param {HTMLElement}element
     * @param {function("data:image/png;base64,")}callback
     */
    static GenerateQR(id, element, callback) {
        if (this.qrcode == null) {
            this.qrcode = new QRCode(element.id, {
                text: "dummytext",
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            })
        }
        this.qrcode.clear()
        this.qrcode.makeCode(`${this.baseURL}?id=${id}`)
        setTimeout(() => callback(element.children[1].src), 1000)
    }

    static GetCurrentUser(callback) {
        MixarWebBackendAPI.getCurrentUser()
            .then(res => {
                callback(res)
            })
            .catch(err => {
                console.log("[GetCurrentUser] error:", err)
                callback(null)
            })
    }
    /**
     *
     * @param {number}id
     * @param {function(Object)}callback
     * @constructor
     */
    static GetMediaInfo(id, callback) {
        MixarWebBackendAPI.getMediaInfo(id)
            .then(info => callback(info))
            .catch(err => callback(null))
    }

    static calcAspect(info, info2) {
        let iaspect = info.width / info.height
        let vvaspect = info2.width / info2.height
        let hnorm = { width: 1.0, height: info2.height / info2.width }
        let vnorm = { width: info2.width / info2.height, height: 1.0 }

        if (iaspect > 1) {
            if (vvaspect > 1) {
                if (vvaspect > iaspect) return hnorm
                else return vnorm
            } else {
                return vnorm
            }
        } else {
            if (vvaspect > 1) {
                return hnorm
            } else {
                if (vvaspect < iaspect) return hnorm
                else return vnorm
            }
        }
    }

    /**
     *
     * @param {Scene}scene
     * @param {number}index
     * @param {function()}callback
     */
    static SetVideoAspect(scene, index, callback = null) {

        let imageid = scene.content[index].image.id
        let videoid = scene.content[index].video.id
        this.GetMediaInfo(imageid, info => {
            if (info != null)
                this.GetMediaInfo(videoid, info2 => {
                    if (info2 != null) {
                        let vaspect = this.calcAspect(info, info2)
                        let video = scene.project.scenes[0].objects.filter(t => {
                            return t.video.contentId === videoid
                        })
                        video[0].transform.scale = { x: vaspect.width, y: vaspect.height, z: 1 }
                        if (callback != null) callback()
                    } else if (callback != null) callback()
                })
            else if (callback != null) callback()
        })
    }
}