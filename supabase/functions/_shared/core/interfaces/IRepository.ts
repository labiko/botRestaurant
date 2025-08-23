/**
 * Interface Repository - Principe SOLID: Interface Segregation
 * Définit les opérations CRUD de base pour tous les repositories
 */

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IRepositoryWithFilter<T> extends IRepository<T> {
  findByFilter(filter: Record<string, any>): Promise<T[]>;
  findOne(filter: Record<string, any>): Promise<T | null>;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IPaginatedRepository<T> extends IRepositoryWithFilter<T> {
  findPaginated(
    page: number,
    pageSize: number,
    filter?: Record<string, any>
  ): Promise<IPaginatedResult<T>>;
}