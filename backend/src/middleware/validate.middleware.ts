import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Request Validation Middleware Factory
 * Uses Zod schemas to validate request body, params, and query
 *
 * @param schema - Zod schema with optional `body`, `params`, `query` sub-schemas
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const normalizedQuery = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ])
    );

    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: normalizedQuery,
    });

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Assign validated & transformed values back to request
    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params;
    if (result.data.query !== undefined) req.query = result.data.query;

    next();
  };
};

/**
 * Format Zod errors into a user-friendly structure
 */
const formatZodErrors = (error: ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    // Extract field name (skip 'body', 'params', 'query' prefix)
    const pathParts = err.path.slice(1); // Remove first element (body/params/query)
    const field = pathParts.join('.') || 'root';

    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(err.message);
  });

  return errors;
};
