import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain.error.js';
export declare class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainError, host: ArgumentsHost): void;
}
