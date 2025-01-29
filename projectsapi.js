//const phpurl = "https://editor.mix-ar.ru/server"
const phpurl = "https://mix-ar.ru/web/apps/ojv/server"
const apiurl = "https://mixar-api.ru"
const appurl = ""
let token = ""

class Cookie {
    /**
     * Get cookie by name
     * @param {string}name
     * @returns {null|string}
     */
    static getCookie(name) {
        name = name + "=";
        let ca = decodeURIComponent(document.cookie).split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trimStart()
            if (c.startsWith(name))
                return c.substring(name.length, c.length)
        }
        return null
    }

    /**
     * Set cookie with expires time
     * @param {string}name - name
     * @param {string}value - value
     * @param {number}days - days to expire
     */
    static setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
}

class GUID {
    static _createGUID() {
        //"014d634b-4a57-4760-99be-3f7a6ebe0bc7"
        const chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]

        function g(count) {
            let r = ""
            for (let i = 0; i < count; i++) r += chars[Math.floor(Math.random() * chars.length)]
            return r
        }

        return `${g(8)}-${g(4)}-${g(4)}-${g(4)}-${g(4)}-${g(12)}`
    }

    static _isFreeGUID(guid, scene) {
        for (const ge of this._collectGUIDs(scene)) if (ge === guid) return false
        return true
    }

    static _collectGUIDs(scene) {
        let res = []
        if (scene.content != null) {
            res.push(...scene.content.scenes[0].anchors.map(t => t.id))
            res.push(...scene.content.scenes[0].objects.map(t => t.id))
        }
        return res
    }

    static createGUID(scene) {
        let guid = ""
        do {
            guid = this._createGUID()
        } while (this._isFreeGUID(guid, scene) === false)
        return guid
    }
}

class MixarAPI {
    //API requests
    static getHeaders() {
        let res = new Headers()
        res.append("Authorization", `Bearer ${token}`)
        return res
    }

    static getAssetUrl(id) {
        return `${apiurl}/asset/${id}`
    }

    static getAsset(id) {
        return new Promise((resolve, reject) => {
            let url = this.getAssetUrl(id)
            fetch(url, {
                headers: this.getHeaders(),
                mode: "cors",
                method: "GET",
            })
                .then(data => data.json()
                    .then(json => resolve(json))
                    .catch(err => reject(err)))
                .catch(err => reject(err))
        })
    }

    static putAssetUrl(name, ext, type) {
        return `${apiurl}/asset?name=${name}&type=${type}&extension=${ext}`
    }

    /**
     * Upload asset
     * @param {Blob}asset
     * @param {string}name
     * @param {string}ext
     * @param {string}type "image" | "video"
     * @returns {Promise<string>}
     */
    static putAsset(asset, name, ext, type) {
        return new Promise((resolve, reject) => {
            let url = this.putAssetUrl(name, ext, type)
            fetch(url, {
                method: "POST",
                mode: "cors",
                headers: this.getHeaders()
            })
                .then(res => {
                    if (res.status === 200) {
                        fetch(url, {
                            method: "PUT",
                            mode: "cors",
                            body: asset,
                        })
                            .then(res => res.text().then(id => resolve({status: 200, id: id})))
                            .catch(err => reject({status: res.status, text: err.message}))
                    }
                })
                .catch(err => reject(err))
        })
    }

    /**
     * Upload asset
     * @param {Blob}asset
     * @param {string}name
     * @param {string}ext
     * @returns {Promise<string>}
     */
    static putImage(asset, name, ext) {
        return this.putAsset(asset, name, ext, "image")
    }

    /**
     * Upload asset
     * @param {Blob}asset
     * @param {string}name
     * @param {string}ext
     * @returns {Promise<string>}
     */
    static putVideo(asset, name, ext) {
        return this.putAsset(asset, name, ext, "video")
    }

    static getProjectHeaderUrl(pid) {
        return `${apiurl}/project/${pid}`
    }

    static getProjectHeader(pid) {
        return new Promise((resolve, reject) => {
            let url = this.getProjectHeaderUrl(pid)
            fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
                mode: "cors",
                cache: "no-cache",
            })
                .then(res => res.json()
                    .then(json => resolve(json))
                    .catch(err => reject(err)))
                .catch(err => reject(err))
        })
    }

    static putProjectDataUrl(pid, pheader = {name: null, description: null}) {
        return (pheader.name != null && pheader.description != null) ?
            `${apiurl}/project/${pid}?name=${pheader.name}&description=${pheader.description}` :
            `${apiurl}/project/${pid}`
    }

    static putProjectData(pid, data = undefined, pheader = {name: null, description: null}) {
        return new Promise((resolve, reject) => {
            let url = this.putProjectDataUrl(pid, pheader)
            fetch(url, {
                method: "PUT",
                headers: this.getHeaders(),
                mode: "cors",
                cache: "no-cache",
                body: data,
            })
                .then(res => res.json()
                    .then(json => resolve(json))
                    .catch(err => reject(err)))
                .catch(err => reject(err))
        })
    }

    static getProjectDataUrl(pid) {
        return `${apiurl}/project/${pid}/data`
    }

    static getProjectData(pid) {
        return new Promise((resolve, reject) => {
            let url = this.getProjectDataUrl(pid)
            fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
                mode: "cors",
                cache: "no-cache",
            })
                .then(res => res.json()
                    .then(json => resolve(json))
                    .catch(err => reject(err)))
                .catch(err => reject(err))
        })
    }


    /////////////////////////////////////////////////////////////
    //PHP requests
    static getUserUrl() {
        return `${phpurl}/getUser.php?token=${token}`
    }

    static getUser() {
        return new Promise((resolve, reject) => {
            fetch(this.getUserUrl(),
                {
                    mode: 'cors',
                })
                .then(value => {
                    value.json()
                        .then(value => resolve(value))
                        .catch(err => reject(err))
                })
                .catch(reason => reject(reason))
        })
    }

    static getProjectsUrl() {
        return `${phpurl}/getProjects.php?token=${token}`
    }

    static getProjects() {
        return new Promise((resolve, reject) => {
            fetch(this.getProjectsUrl(),
                {
                    method: "POST",
                    mode: 'cors',
                    body: {
                        token: token,
                    }
                })
                .then(result => {
                    result.json()
                        .then(data => {
                            let projects = data.projects.map(t => ({
                                id: t.id,
                                name: t.title,
                                updated: t.updated,
                                deleted: (t.is_deleted !== 0),
                                hash: t.hash,
                            }))
                            //projects.push(data.projects)
                            resolve(projects)
                        })
                })
                .catch(reason => reject(reason))
        })
    }

    static getSignInUrl() {
        return `${phpurl}/signIn.php`
    }

    static signIn(email, password) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            fetch(this.getSignInUrl(), {
                method: 'POST',
                mode: 'cors',
                body: formData
            })
                .then(result => {
                    result.json()
                        .then(value => {
                            if (value.result === "success")
                                resolve(value)
                            else
                                reject(value)
                        })
                        .catch(value => {
                            console.log("[SignIn] json parse error:", result);
                            reject(value)
                        })
                })
                .catch(reason => {
                    console.log("SignIn fail:", reason)
                    reject(reason)
                })
        })
    }

    static addProjectUrl() {
        return `${phpurl}/addProject.php`
    }

    static createProjectUrl(ownerid, name, description) {
        return `${apiurl}/project?name=${name}&description=${description}&visibility=0&ownerId=${ownerid}`
    }

    /**
     * Create new empty project
     * @param {string}name
     * @param {string}description
     * @returns {Promise<unknown>}
     */
    static createProject(name, description) {
        return new Promise((resolve, reject) => {
            MixarAPI.getUser()
                .then(user => {
                    let project = Scene.createScene(name)
                    fetch(this.createProjectUrl(user.id, name, description), {
                        method: "POST",
                        mode: 'cors',
                        headers: this.getHeaders(),
                        body: project.project,
                    }).then(data => {
                        data.text()
                            .then(text => {
                                console.log("[MixarAPI] [createProject] new ID:", Number.parseInt(text))
                                project.header = Scene.createHeader(Number.parseInt(text), user.id, name, description)
                                project.saveScene().then(result => {
                                    project.header = result
                                    project.projectId = result.id
                                    fetch(this.addProjectUrl(), {
                                        method: "POST",
                                        headers: this.getHeaders(),
                                        mode: 'cors',
                                        body: {
                                            token: token,
                                            title: project.project.title,
                                            image: "assets/images/projects/plane_v.jpg",
                                            project_id: project.projectId
                                        }
                                    }).then(result => {
                                        result.text().then(text => console.log("[MixarAPI] [createProject] addProject.php", text))
                                        resolve("DUMMY")
                                    })

                                })
                            })
                    })
                })
                .catch(err => reject(err))
        })
    }

    /**
     * Delete project by HASH
     * @param hash
     * @returns {Promise<string>}
     */
    static deleteProject(hash) {
        return new Promise((resolve, reject) => {
            resolve("DUMMY")
        })
    }
}

class DefaultHeader {
    /**
     * @type {number}
     */
    id = 0
    /**
     * @type {string}
     */
    name = ""
    /**
     * @type {string}
     */
    description = ""
    /**
     * @type {string}
     */
    preview = ""
    /**
     * @type {number}
     */
    ownerId = 0
    /**
     * @type {string}
     */
    created = ""
    /**
     * @type {string}
     */
    updated = ""
    /**
     * @type {number}
     */
    visibility = 0

    constructor(id, ownerId, name, description) {
        this.id = id
        this.description = description
        this.ownerId = ownerId
        this.name = name
        return this
    }
}

class Scene {
    /**
     * Project object
     * @type {object}
     */
    project = {}
    /**
     * Header of project
     * @type {DefaultHeader}
     */
    header = null
    /**
     * Project ID
     * @type {number}
     */
    projectId = 0

    /**
     * media content
     * image: {name: '3.png', url: 'https://mixar-api.ru/data-dev/1005270.png'}
     * video: {name: '3.mp4', url: 'https://mixar-api.ru/data-dev/1005275.mp4'}
     * @type {[]}
     */
    content = []

    constructor(scene, header) {
        this.project = scene
        if (header) {
            this.header = header
            this.projectId = header.id
        } else {
            this.header = Scene.createHeader(-1, null, null, null)
            this.projectId = -1
        }
    }

    /**
     * Create new empty project
     * @param title
     * @returns {Scene}
     */
    static createScene(title) {
        return new Scene({
            "scenes": [
                {
                    "id": "scene1",
                    "sceneSettings": {
                        "autoPlacement": false,
                        "capture": true,
                        "showTips": false,
                        "analytics": false,
                        "sceneScale": 0,
                        "hdrMapUrl": "",
                        "enableDepthOcclusion": false
                    },
                    "anchors": [],
                    "interactive": [],
                    "objects": []
                }
            ],
            "webViewUrl": "https://editor.mix-ar.ru/mainui.php",
            "title": title
        })
    }

    /**
     * Create new header for project
     * @param id - ID after server-side creation
     * @param ownerId - user ID
     * @param name
     * @param description
     * @returns {DefaultHeader}
     */
    static createHeader(id, ownerId, name, description) {
        return new DefaultHeader(id, ownerId, name, description)
    }

    /**
     * Create video object
     * @param {string}parentGUID - assigned marker GUID (use id from marker)
     * @param {number}videoContentId - ID of uploaded video
     * @param {string}videoName
     * @returns {object}
     */
    static createObject(parentGUID, videoContentId, videoName) {
        return {
            "id": createGUID(),
            "name": videoName,
            "enabled": true,
            "type": 2,
            "transform": {
                "parentId": parentGUID,
                "position": {
                    "x": 0,
                    "y": 0.0001,
                    "z": 0
                },
                "rotation": {
                    "x": -90,
                    "y": 180,
                    "z": 0
                },
                "scale": {
                    "x": 0.2,
                    "y": 0.2,
                    "z": 1
                },
                "boneIndex": -1,
                "bonesNames": []
            },
            "renderer": {
                "emission": {
                    "color": {
                        "r": 0,
                        "g": 0,
                        "b": 0,
                        "a": 0
                    },
                    "intensive": 0
                },
                "visible": true,
                "shadowCast": true,
                "billboard": false,
                "opacity": 1,
                "materials": [
                    {
                        "texture": {
                            "contentId": 0,
                            "tiling": {
                                "x": 1,
                                "y": 1
                            },
                            "isVideo": false
                        },
                        "doublesided": false,
                        "name": "glTF-Default-Material (Instance) | Plane001",
                        "shaderId": 0,
                        "color": {
                            "r": 1,
                            "g": 1,
                            "b": 1,
                            "a": 1
                        },
                        "roughness": -1,
                        "metallic": -1,
                        "zWrite": true,
                        "renderQueue": -1,
                        "cullMode": 0,
                        "id": createGUID(),
                        "alphaCutoff": 0.5
                    }
                ],
                "color": {
                    "r": 1,
                    "g": 1,
                    "b": 1,
                    "a": 1
                },
                "isOcclusion": null
            },
            "model": {
                "contentId": 98,
                "playOnAwake": false,
                "animations": []
            },
            "video": {
                "contentId": videoContentId,
                "volume": 1,
                "loop": true,
                "playOnAwake": true,
                "chromakey": false
            },
            "manipulation": {
                "movable": false,
                "sizable": false,
                "rotatable": false,
                "heightCorrection": false
            }
        }
    }

    /**
     * Create marker with image
     * @param {number}imageContentId - ID of uploaded image
     * @param {string}imageName
     * @returns {object}
     */
    static createMarker(imageContentId, imageName) {
        return {
            "id": createGUID(),
            "type": 0,
            "contentId": imageContentId,
            "markerWidth": 0.2,
            "markerName": imageName
        }
    }

    /**
     * Add marker & video to project
     * @param {object}marker
     * @param {object}object
     */
    addContent(marker, object) {
        this.project.scenes[0].anchors.push(marker)
        this.project.scenes[0].objects.push(object)
    }

    /**
     * Replace pair by index
     * @param {number}index
     * @param {object}marker
     * @param {object}object
     */
    replaceContent(index, marker, object) {
        this.project.scenes[0].anchors[index] = marker
        this.project.scenes[0].objects[index] = object
    }

    /**
     * Remove pair marker-video by index
     * @param {number}index
     */
    removeContent(index) {
        this.project.scenes[0].anchors.splice(index, 1)
        this.project.scenes[0].objects.splice(index, 1)
    }

    /**
     * Save project to server
     * @returns {Promise}
     */
    saveScene() {
        return MixarAPI.putProjectData(this.header.id, JSON.stringify(this.project), {
            name: this.header.name,
            description: this.header.description
        })
    }
}

/**
 * Get content by index
 * @param scene
 * @param index
 * @param callback
 */
function getDataByIndex(scene, index, callback) {
    let ii = {image: null, video: null}
    const check = () => {
        if (ii.video != null && ii.image != null)
            callback(index, ii)
    }
    let marker = scene.anchors[index]
    if (marker.contentId > 1000000) {
        MixarAPI.getAsset(marker.contentId)
            .then(value => {
                ii.image = {}
                ii.image.name = value.name
                ii.image.url = value.domain[0] + value.path
                check()
            })
            .catch(err => {
                console.log(err)
                ii.image = {}
                ii.image.name = null
                ii.image.url = null
                check()
            })
    } else {
        ii.image = {}
        ii.image.name = null
        ii.image.url = null
        check()
    }
    let video = scene.objects.filter(t => t.transform.parentId === marker.id)
    if (video.length > 0) {
        MixarAPI.getAsset(video[0].video.contentId)
            .then(value => {
                ii.video = {}
                ii.video.name = value.name
                ii.video.url = value.domain[0] + value.path
                check()
            })
            .catch(err => {
                console.log(err)
                ii.video = {}
                ii.video.name = null
                ii.video.url = null
                check()
            })
    } else {
        ii.video = {}
        ii.video.name = null
        ii.video.url = null
        check()
    }
}

/**
 * Get content list from project
 * @param {Scene}project
 * @param {function(array)}callback
 */
function getDataAll(project, callback) {
    let scene = project.project.scenes[0]
    let content = []
    let index = -1
    for (let i = 0; i < scene.anchors.length; i++) content.push(null)

    function check() {
        if (index < scene.anchors.length - 1) {
            getDataByIndex(scene, ++index, (index, data) => {
                content[index] = data
                check()
            })
        } else
            callback(content)
    }

    check()
}

/**
 * Получение проекта
 * @param {number}pid
 * @returns {Promise<Scene>}
 */
function getProjectContent(pid) {
    return new Promise((resolve, reject) => {
        let result = null
        MixarAPI.getProjectHeader(pid)
            .then(data => {
                let header = data
                MixarAPI.getProjectData(pid)
                    .then(data => {
                        result = new Scene(data, header)
                        getDataAll(result, cnt => {
                            result.content = cnt
                            resolve(result)
                        })
                    })
            })
            .catch(err => reject(err))
    })
}

