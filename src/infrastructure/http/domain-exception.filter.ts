import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain.error.js';
import { BlockedPiiError } from '../../domain/errors/blocked-pii.error.js';
import { BudgetExceededError } from '../../domain/errors/budget-exceeded.error.js';

/**
 * ADAPTER de entrada (traduce errores de dominio → HTTP)
 *
 * FLUJO:
 *   UseCase throw DomainError
 *     → este filter (Nest lo intercepta)
 *     → JSON con status
 *
 * El dominio sigue sin importar @nestjs/common en sus errores.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<{
      status: (code: number) => { json: (body: unknown) => void };
    }>();

    let status = HttpStatus.BAD_REQUEST;
    if (exception instanceof BudgetExceededError) {
      status = HttpStatus.PAYMENT_REQUIRED; // 402
    } else if (exception instanceof BlockedPiiError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }

    res.status(status).json({
      error: exception.name,
      message: exception.message,
    });
  }
}
