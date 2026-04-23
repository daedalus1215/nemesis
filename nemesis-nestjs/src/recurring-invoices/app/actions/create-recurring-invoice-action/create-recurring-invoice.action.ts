import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceService } from '../../../domain/services/recurring-invoice.service';
import { CreateRecurringInvoiceRequestDto } from './create-recurring-invoice.request.dto';
import { CreateRecurringInvoiceResponseDto } from './create-recurring-invoice.response.dto';
import { CreateRecurringInvoiceResponder } from './create-recurring-invoice.responder';

@Controller('recurring-invoices')
export class CreateRecurringInvoiceAction {
  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly responder: CreateRecurringInvoiceResponder,
  ) {}

  @Post()
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'Create a new recurring invoice schedule',
  })
  async handle(
    @Body() dto: CreateRecurringInvoiceRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<CreateRecurringInvoiceResponseDto> {
    const entity = await this.recurringInvoiceService.create({
      issuerUserId: user.userId,
      debtorUserId: dto.debtorUserId,
      amount: dto.amount,
      intervalType: dto.intervalType,
      intervalCount: dto.intervalCount ?? 1,
      dayOfWeek: dto.dayOfWeek,
      dayOfMonth: dto.dayOfMonth,
      monthOffset: dto.monthOffset,
      hour: dto.hour,
      description: dto.description,
    });
    return this.responder.apply(entity);
  }
}
