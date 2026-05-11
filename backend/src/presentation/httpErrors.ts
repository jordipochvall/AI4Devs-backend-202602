import { Response } from 'express';
import { DomainError, NotFoundError, ValidationError } from '../application/errors';

export const handleError = (res: Response, error: unknown): Response => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof DomainError) {
    return res.status(422).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal Server Error' });
};

export const parseIntegerParam = (raw: string, name: string): number => {
  if (!/^-?\d+$/.test(raw)) {
    throw new ValidationError(`Invalid ${name} '${raw}': must be an integer`);
  }
  return parseInt(raw, 10);
};

export const parsePagination = (
  query: Record<string, unknown>,
  defaults: { page: number; pageSize: number } = { page: 1, pageSize: 20 },
): { page: number; pageSize: number } => {
  const page = query.page === undefined ? defaults.page : parseIntegerParam(String(query.page), 'page');
  const pageSize =
    query.pageSize === undefined ? defaults.pageSize : parseIntegerParam(String(query.pageSize), 'pageSize');
  return { page, pageSize };
};
