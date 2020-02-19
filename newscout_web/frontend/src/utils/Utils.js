import {toast} from 'react-toastify';

export const readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const location_origin = window.location.origin

export const postHeaders = {
    "X-CSRFToken": readCookie("csrftoken"),
    "Content-Type": "application/json"
};

export const deleteHeaders = {
    "X-CSRFToken": readCookie("csrftoken"),
    "Content-Type": "application/json"
};

export const getHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/pdf"
};

export const fileUploadHeaders = {
    "X-CSRFToken": readCookie("csrftoken")
};

export const fileResumeUploadHeaders = {
    "X-CSRFToken": readCookie("csrftoken"),
    "Content-Type": "multipart/form-data"
};

export let notify = (msg, type = "success") => {
    toast.dismiss();
    const toastProp = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    };

    switch (type) {
        case "success":
            toast.success(msg, toastProp);
            break;
        case "error":
            toast.error(msg, toastProp);
            break;
        case "warn":
            toast.warn(msg, toastProp);
            break;
        case "info":
            toast.info(msg, toastProp);
            break;
        default:
            toast.success(msg, toastProp);
            break;
    }
};

export const getRequest = function getRequest(url, successFunc, headers = false, extra_data = false) {
    if (headers === false) {
        headers = postHeaders;
    }

    return fetch(url, {
            headers,
            method: "GET"
        })
        .then((response) => {
            if (response.status === 200 || response.status === 400) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            if (response.status === 401 || response.status === 403) {
                window.location = getLoginURL();
            }
            if (response.status >= 500) {
                notify("Internal Server Error", "error");
                throw Error("Internal Server Error");
            }
        }).catch((err) => {
            // setState({ "server_error": true })
            console.log(err);
        });
};

export const postRequest = function postRequest(url, body, successFunc, method = "POST", headers = false, extra_data = false) {
    if (!headers) {
        headers = postHeaders;
    }

    return fetch(url, {
            headers,
            body,
            method: method
        })
        .then((response) => {
            if (response.status === 200 || response.status === 201 || response.status === 400) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            // for entity already exists
            if (response.status === 422) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            if (response.status === 401 || response.status === 403) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            if (response.status >= 500) {
                notify("Something went wrong", "error")
                throw Error("Internal Server Error");
            }
        }).catch((err) => {
            // setState({ "server_error": true })
            console.log(err);
            notify("Internal Server Error", "error");
        });
};

export const putRequest = function putRequest(url, body, successFunc, method = "PUT", headers = false, extra_data = false) {
    if (!headers) {
        headers = postHeaders;
    }

    return fetch(url, {
            headers,
            body,
            method: method
        })
        .then((response) => {
            if (response.status === 200 || response.status === 201 || response.status === 400) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            // for entity already exists
            if (response.status === 422) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            if (response.status === 401 || response.status === 403) {
                window.location = getLoginURL();
            }
            if (response.status >= 500) {
                notify("Something went wrong", "error")
                throw Error("Internal Server Error");
            }
        }).catch((err) => {
            // setState({ "server_error": true })
            console.log(err);
            notify("Internal Server Error", "error");
        });
};

export const deleteRequest = function deleteRequest(url, successFunc, headers = false, extra_data = false) {
    if (!headers) {
        headers = deleteHeaders;
    }
    return fetch(url, {
            headers,
            method: "DELETE"
        })
        .then((response) => {
            if (response.status === 200 || response.status === 201 || response.status === 400) {
                return response.json().then(data => {
                    if (!extra_data) {
                        return successFunc(data);
                    } else {
                        return successFunc(data, extra_data);
                    }
                })
            }
            if (response.status === 401 || response.status === 403) {
                window.location = getLoginURL();
            }
            if (response.status >= 500) {
                throw Error("Internal Server Error");
            }
        }).catch((err) => {
            console.log(err);
            // notify("Failed", "error")
        });
};