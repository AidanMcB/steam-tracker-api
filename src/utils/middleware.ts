import { Request, Response, NextFunction } from 'express';
import { transformObjectToCamelCase } from './caseConverter';

/**
 * Middleware to transform response data to camelCase
 */
export function camelCaseResponse(req: Request, res: Response, next: NextFunction): void {
  // Store the original json method
  const originalJson = res.json;
  
  // Override the json method
  res.json = function(body: any): Response {
    // Transform the response body to camelCase
    const transformedBody = transformObjectToCamelCase(body);
    
    // Call the original json method with the transformed body
    return originalJson.call(this, transformedBody);
  };
  
  // Continue to the next middleware/route handler
  next();
} 