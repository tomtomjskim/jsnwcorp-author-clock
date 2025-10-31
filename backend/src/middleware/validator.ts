import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types/response';

/**
 * Validation middleware factory
 */
export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return res.status(400).json(response);
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
}

/**
 * Query parameter validation middleware factory
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Query validation failed',
          code: 'VALIDATION_ERROR',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return res.status(400).json(response);
    }

    // Replace req.query with validated value
    req.query = value as any;
    next();
  };
}

// Common validation schemas
export const schemas = {
  id: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  language: Joi.object({
    language: Joi.string()
      .valid('ko', 'en', 'ja', 'zh', 'es', 'fr', 'de')
      .default('ko'),
  }),

  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    language: Joi.string()
      .valid('ko', 'en', 'ja', 'zh', 'es', 'fr', 'de')
      .optional(),
    category: Joi.string().max(50).optional(),
  }),

  createQuote: Joi.object({
    text: Joi.string().min(1).max(500).required(),
    author: Joi.string().min(1).max(200).required(),
    source: Joi.string().max(300).optional().allow(null),
    source_url: Joi.string().uri().optional().allow(null),
    language: Joi.string()
      .valid('ko', 'en', 'ja', 'zh', 'es', 'fr', 'de')
      .default('ko'),
    category: Joi.string().max(50).optional().allow(null),
    is_public_domain: Joi.boolean().default(true),
  }),
};
