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

class MixarWebBackendAPI {
    static apiUrl = 'https://api.strzn.dmurz.su'

    static get token() {
        return Cookie.getCookie("token")
    }

    static set token(value) {
        Cookie.setCookie('token', value, 3)
    }

    static getHeaders(headersAdd = null) {
        let res = new Headers()
        if (this.token !== "")
            res.append("Token", `${this.token}`)
        if (headersAdd != null)
            for (const key in headersAdd)
                res.append(key, headersAdd[key])
        return res
    }

    // /asset/{id}
    static getAsset(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/asset/${id}`, {
                method: 'GET',
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })

    }

    static updateAsset(id, name, type, extension, projectId) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/asset/${id}`, {
                method: 'PUT',
                headers: this.getHeaders({'Content-Type': 'application/json'}),
                body: JSON.stringify({name, type, extension, projectId})
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    static deleteAsset(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/asset/${id}`, {
                method: 'DELETE'
            })
                .then(response => resolve())
                .catch(reject)
        })

    }

    // /asset
    static createAsset(name, type, extension, projectId, blob) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/asset?name=${name}&type=${type}&extension=${extension}&projectId=${projectId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: blob,
            })
                .then(response => {
                    response.text()
                        .then(resolve)
                        .catch(reject)
                }).catch(reject)
        })

    }

    // /project
    static createProject(name, description, visibility = 0, body = null) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project?name=${name}&description=${description}&visibility=${visibility}`, {
                method: 'POST',
                headers: this.getHeaders({'Content-Type': 'application/json'}),
                body: JSON.stringify((body ?? Scene.createScene(name)).project)
            })
                .then(response => {
                    response.text()
                        .then(text => resolve(text))
                        .catch(reject)
                })
                .catch(reject)
        })

    }

    static getProjects() {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project`, {
                method: 'GET',
                headers: this.getHeaders(),
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
        /*
                return new Promise((resolve, reject) => {

                })
                */
    }

    // /project/{id}
    static getProject(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project/${id}`, {
                method: 'GET',
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    static updateProject(id, name, description, visibility, body) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project/${id}?name=${name}&description=${description}&visibility=${visibility}`, {
                method: 'PUT',
                headers: this.getHeaders({'Content-Type': 'application/json'}),
                body: body,
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })

    }

    static deleteProject(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            })
                .then(response => {
                    response.json()
                        .then(json => resolve({status: json.status, statusText: json.statusText}))
                        .catch(err => resolve(err))
                })
                .catch(reject)
        })
    }

    // /project/{id}/data
    static getProjectData(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project/${id}/data`, {
                method: 'GET',
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    // /project/{id}/restore
    static restoreProject(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/project/${id}/restore`, {
                method: 'POST'
            })
                .then(resolve)
                .catch(reject)
        })
    }

    // /user/auth
    static authenticateUser(email, secret) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user/auth`, {
                method: 'POST',
                headers: this.getHeaders({'Content-Type': 'application/json'}),
                body: JSON.stringify({email, secret})
            })
                .then(response => {
                    response.text()
                        .then(text => {
                            this.token = text
                            Cookie.setCookie("token", this.token, 4)
                            resolve()
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    // /user
    static getUsers() {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user`, {
                method: 'GET',
                headers: this.getHeaders(),
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    static getCurrentUser() {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user/me`, {
                method: 'GET',
                headers: this.getHeaders(),
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    static createUser(name = "", surname = "", picture = "", email = "", secret = "", role = 0) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user`, {
                method: 'POST',
                headers: this.getHeaders({'Content-Type': 'application/json'}),
                body: JSON.stringify({name, surname, picture, email, secret, role, authProvider: "email"})
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        }).catch(reject)
                })
                .catch(reject)
        })
    }

    // /user/{id}
    static updateUser(id, name = "", surname = "", picture = "", email = "", secret = "", role = 0) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user/${id}`, {
                method: 'PUT',
                headers: this.getHeaders({'Content-Type': 'application/json'}),
                body: JSON.stringify({name, surname, picture, email, secret, role, authProvider: "email"}),
            })
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    static deleteUser(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            })
                .then(resolve)
                .catch(reject)
        })
    }

    // /user/{id}/restore
    static restoreUser(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user/${id}/restore`, {
                method: 'POST',
                headers: this.getHeaders(),
            })
                .then(resolve)
                .catch(reject)
        })
    }

    // /user/{id}/projects
    static getUserProjects(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.apiUrl}/user/${id}/projects`)
                .then(response => {
                    response.json()
                        .then(json => {
                            if (!json.status || json.status === 200)
                                resolve(json)
                            else
                                reject(json)
                        }).catch(reject)
                })
                .catch(reject)
        })
    }
}

function ToDate(value) {
    let date = new Date(value * 1000)
    return {
        hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds(),
        days: date.getDate(), months: date.getMonth() + 1, year: date.getFullYear()
    }
}