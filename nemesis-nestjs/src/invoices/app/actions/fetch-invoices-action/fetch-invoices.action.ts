import { Controller, Get, Query } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { InvoiceService } from '../../../domain/services/invoice.service';
import { FetchInvoicesRequestDto } from './fetch-invoices.request.dto';
import { FetchInvoicesResponseDto } from './fetch-invoices.response.dto';
import { FetchInvoicesResponder } from './fetch-invoices.responder';

@Controller('invoices')
export class FetchInvoicesAction {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly responder: FetchInvoicesResponder,
  ) {}

  @Get()
  @ProtectedAction({
    tag: 'Invoice',
    summary: 'Get user invoices with optional status filtering',
  })
  async handle(
    @GetAuthUser() user: AuthUser,
    @Query() query: FetchInvoicesRequestDto,
  ): Promise<FetchInvoicesResponseDto> {
    const invoices = await this.invoiceService.getInvoices(
      user.userId,
      query.statuses,
    );

    return this.responder.apply(invoices);
  }
}
