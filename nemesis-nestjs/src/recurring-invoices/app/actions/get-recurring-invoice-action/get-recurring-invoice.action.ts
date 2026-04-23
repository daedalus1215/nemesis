import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceService } from '../../../domain/services/recurring-invoice.service';
import { GetRecurringInvoiceResponseDto } from './get-recurring-invoice.response.dto';
import { GetRecurringInvoiceResponder } from './get-recurring-invoice.responder';

@Controller('recurring-invoices')
export class GetRecurringInvoiceAction {
  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly responder: GetRecurringInvoiceResponder,
  ) {}

  @Get(':id')
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'Get a recurring invoice by ID',
  })
  async handle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetRecurringInvoiceResponseDto> {
    const entity = await this.recurringInvoiceService.get(id);
    if (!entity) {
      throw new NotFoundException('Recurring invoice not found');
    }
    return this.responder.apply(entity);
  }
}
