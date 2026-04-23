import { Controller, Get, Query } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceService } from '../../../domain/services/recurring-invoice.service';
import { ListRecurringInvoicesRequestDto } from './list-recurring-invoices.request.dto';
import { ListRecurringInvoicesResponseDto } from './list-recurring-invoices.response.dto';
import { ListRecurringInvoicesResponder } from './list-recurring-invoices.responder';

@Controller('recurring-invoices')
export class ListRecurringInvoicesAction {
  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly responder: ListRecurringInvoicesResponder,
  ) {}

  @Get()
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'List recurring invoices for the authenticated user',
  })
  async handle(
    @Query() dto: ListRecurringInvoicesRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<ListRecurringInvoicesResponseDto> {
    const entities = await this.recurringInvoiceService.list(
      user.userId,
      dto.status,
    );
    return this.responder.apply(entities);
  }
}
