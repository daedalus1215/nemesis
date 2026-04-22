import { Injectable } from '@nestjs/common';
import { Invoice } from '../../../domain/entities/invoice.entity';
import {
  FetchInvoicesResponseDto,
  InvoiceDto,
} from './fetch-invoices.response.dto';

@Injectable()
export class FetchInvoicesResponder {
  public apply(invoices: Invoice[]): FetchInvoicesResponseDto {
    return {
      invoices: invoices.map((invoice) => this.toDto(invoice)),
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
