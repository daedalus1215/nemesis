import { Injectable } from '@nestjs/common';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { CreateInvoiceRequestDto } from './create-invoice.request.dto';
import { CreateInvoiceResponseDto } from './create-invoice.response.dto';

@Injectable()
export class CreateInvoiceResponder {
  public apply(
    invoice: Invoice,
    requestDto: CreateInvoiceRequestDto,
  ): CreateInvoiceResponseDto {
    return {
      invoiceId: invoice.id,
      debtorUserId: invoice.debtorUserId,
      amount: invoice.total,
      description: requestDto.description,
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      issueDate: invoice.issueDate.toISOString().split('T')[0],
      success: true,
    };
  }
}
