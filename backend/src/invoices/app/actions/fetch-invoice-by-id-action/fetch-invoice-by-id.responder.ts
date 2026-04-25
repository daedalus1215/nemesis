import { Injectable } from '@nestjs/common';
import { Invoice } from '../../../domain/entities/invoice.entity';
import {
  FetchInvoiceByIdResponseDto,
  InvoiceDto,
} from './fetch-invoice-by-id.response.dto';

@Injectable()
export class FetchInvoiceByIdResponder {
  public apply(invoice: Invoice): FetchInvoiceByIdResponseDto {
    return {
      invoice: this.toDto(invoice),
      success: true,
    };
  }

  private toDto(invoice: Invoice): InvoiceDto {
    return {
      id: invoice.id,
      issuerUserId: invoice.issuerUserId,
      debtorUserId: invoice.debtorUserId,
      total: Number(invoice.total),
      balanceDue: Number(invoice.balanceDue),
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      description: invoice.description,
    };
  }
}
