import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceService } from '../../../domain/services/recurring-invoice.service';
import { PauseRecurringInvoiceResponseDto } from './pause-recurring-invoice.response.dto';
import { PauseRecurringInvoiceResponder } from './pause-recurring-invoice.responder';

@Controller('recurring-invoices')
export class PauseRecurringInvoiceAction {
  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly responder: PauseRecurringInvoiceResponder,
  ) {}

  @Post(':id/pause')
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'Pause an active recurring invoice',
  })
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<PauseRecurringInvoiceResponseDto> {
    const entity = await this.recurringInvoiceService.pause(id, user.userId);
    return this.responder.apply(entity);
  }
}
