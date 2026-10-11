import { Request, Response, NextFunction } from 'express';

export type ValidatorFn = (value: any) => string | null;

export interface ValidationSchema {
  [field: string]: ValidatorFn;
}

/**
 * Express middleware that checks req.body against a schema of validation functions.
 * Returns HTTP 400 Bad Request with field errors if any check fails.
 */
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    for (const [field, validator] of Object.entries(schema)) {
      const error = validator(req.body?.[field]);
      if (error) {
        errors[field] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError,
        errors
      });
    }

    next();
  };
};

/**
 * Helper function to validate an arbitrary object and return errors.
 */
export const validateObject = (obj: any, schema: ValidationSchema): { isValid: boolean; errors: Record<string, string>; firstError: string | null } => {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(obj?.[field]);
    if (error) {
      errors[field] = error;
    }
  }

  const errorKeys = Object.keys(errors);
  return {
    isValid: errorKeys.length === 0,
    errors,
    firstError: errorKeys.length > 0 ? errors[errorKeys[0]] : null
  };
};
