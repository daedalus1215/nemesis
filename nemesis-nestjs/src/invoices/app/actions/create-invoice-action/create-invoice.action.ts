import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { InvoiceService } from '../../../domain/services/invoice.service';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { CreateInvoiceRequestDto } from './create-invoice.request.dto';
import { CreateInvoiceResponseDto } from './create-invoice.response.dto';
import { CreateInvoiceResponder } from './create-invoice.responder';

@Controller('invoices')
export class CreateInvoiceAction {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly responder: CreateInvoiceResponder,
  ) {}

  @Post()
  @ProtectedAction({
    tag: 'Invoice',
    summary: 'Create and send an invoice to a user',
  })
  async handle(
    @Body() createInvoiceDto: CreateInvoiceRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<CreateInvoiceResponseDto> {
    return this.responder.apply(
      await this.invoiceService.createInvoice(createInvoiceDto, user.userId),
      createInvoiceDto,
    );
  }
}
