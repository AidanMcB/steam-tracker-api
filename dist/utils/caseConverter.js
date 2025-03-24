"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakeToCamel = snakeToCamel;
exports.transformObjectToCamelCase = transformObjectToCamelCase;
/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}
/**
 * Recursively transforms an object's keys from snake_case to camelCase
 */
function transformObjectToCamelCase(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => transformObjectToCamelCase(item));
    }
    return Object.entries(obj).reduce((camelObj, [key, value]) => {
        const camelKey = snakeToCamel(key);
        camelObj[camelKey] = transformObjectToCamelCase(value);
        return camelObj;
    }, {});
}
//# sourceMappingURL=caseConverter.js.map