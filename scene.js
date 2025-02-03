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
        if (scene.project != null) {
            res.push(...scene.project.scenes[0].anchors.map(t => t.id))
            res.push(...scene.project.scenes[0].objects.map(t => t.id))
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
     * Parse project to construct media list
     * @param {function(Scene)}callback
     */
    parseContent(callback) {

        const getDataByIndex = (scene, index, callback) => {
            let ii = {image: null, video: null}
            const check = () => {
                if (ii.video != null && ii.image != null)
                    callback(index, ii)
            }
            let marker = scene.anchors[index]
            if (marker.contentId > 0) {
                MixarWebBackendAPI.getAsset(marker.contentId)
                    .then(value => {
                        ii.image = {}
                        ii.image.name = value.name
                        ii.image.url = value.domain[0] + value.path
                        ii.image.id = marker.contentId
                        check()
                    })
                    .catch(err => {
                        console.log(err)
                        ii.image = {}
                        ii.image.name = null
                        ii.image.url = null
                        ii.image.id = marker.contentId
                        check()
                    })
            } else {
                ii.image = {}
                ii.image.name = null
                ii.image.url = null
                ii.image.id = -1
                check()
            }
            let video = scene.objects.filter(t => t.transform.parentId === marker.id)
            if (video.length > 0 && video[0].video.contentId > 0) {
                MixarWebBackendAPI.getAsset(video[0].video.contentId)
                    .then(value => {
                        ii.video = {}
                        ii.video.name = value.name
                        ii.video.url = value.domain[0] + value.path
                        ii.video.id = video[0].video.contentId
                        check()
                    })
                    .catch(err => {
                        console.log(err)
                        ii.video = {}
                        ii.video.name = null
                        ii.video.url = null
                        ii.video.id = video[0].video.contentId
                        check()
                    })
            } else {
                ii.video = {}
                ii.video.name = null
                ii.video.url = null
                ii.video.id = -1
                check()
            }
        }

        const getDataAll = (project, callback2) => {
            let scene = project.scenes[0]
            let cnt = []
            let index = 0
            for (let i = 0; i < scene.anchors.length; i++) cnt.push(null)

            function check() {
                if (index < scene.anchors.length) {
                    getDataByIndex(scene, index++, (index, data) => {
                        cnt[index] = data
                        check()
                    })
                } else
                    callback2(cnt)
            }

            check()
        }

        getDataAll(this.project, cnt => {
            this.content = cnt
            this.header.description = cnt.length
            callback(this)
        })
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
    createObject(parentGUID, videoContentId, videoName) {
        return {
            "id": GUID.createGUID(this),
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
                        "id": GUID.createGUID(scene),
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
    createMarker(imageContentId, imageName) {
        return {
            "id": GUID.createGUID(this),
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
        return this.project.scenes[0].anchors.length - 1
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
        return MixarWebBackendAPI.updateProject(this.header.id, this.header.name, this.header.description, JSON.stringify(this.project), 0)
    }

}
