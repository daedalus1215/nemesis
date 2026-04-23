import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceService } from '../../../domain/services/recurring-invoice.service';
import { ActivateRecurringInvoiceResponseDto } from './activate-recurring-invoice.response.dto';
import { ActivateRecurringInvoiceResponder } from './activate-recurring-invoice.responder';

@Controller('recurring-invoices')
export class ActivateRecurringInvoiceAction {
  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly responder: ActivateRecurringInvoiceResponder,
  ) {}

  @Post(':id/activate')
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'Activate a paused recurring invoice',
  })
  async handle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivateRecurringInvoiceResponseDto> {
    const entity = await this.recurringInvoiceService.activate(id);
    return this.responder.apply(entity);
  }
}
