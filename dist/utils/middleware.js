"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelCaseResponse = camelCaseResponse;
const caseConverter_1 = require("./caseConverter");
/**
 * Middleware to transform response data to camelCase
 */
function camelCaseResponse(req, res, next) {
    // Store the original json method
    const originalJson = res.json;
    // Override the json method
    res.json = function (body) {
        // Transform the response body to camelCase
        const transformedBody = (0, caseConverter_1.transformObjectToCamelCase)(body);
        // Call the original json method with the transformed body
        return originalJson.call(this, transformedBody);
    };
    // Continue to the next middleware/route handler
    next();
}
//# sourceMappingURL=middleware.js.map