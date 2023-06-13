function compareObjects(a, b) {
    if (a === b) return true;

    if (typeof a != typeof b) return false;

    if (Array.isArray(a)) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;

    let a_json = JSON.stringify(a, Object.keys(a).sort());
    let b_json = JSON.stringify(b, Object.keys(b).sort());
    return a_json === b_json;
}

function isObject(obj) {
    return typeof obj === 'object' &&
        !Array.isArray(obj) &&
        obj !== null;
}

function isArray(arr) {
    return Array.isArray(arr);
}

function clone(source) {
    if (isObject(source) || isArray(source))
        return JSON.parse(JSON.stringify(source, Object.keys(source).sort()));

    return source;
}

function hasIntersection(arr1 = [], arr2 = []) {

    for (let i = 0; i < arr1.length; i++) {
        if (arr2.includes(arr1[i])) {
            return true;
        }
    }

    return false;
}


export {compareObjects, isObject, isArray, clone, hasIntersection};