/**
 * Converts a snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Recursively transforms an object's keys from snake_case to camelCase
 */
export function transformObjectToCamelCase(obj: any): any {
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
  }, {} as Record<string, any>);
} 