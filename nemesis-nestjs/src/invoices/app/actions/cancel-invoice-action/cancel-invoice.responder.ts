import { Injectable } from '@nestjs/common';
import { Invoice } from '../../../domain/entities/invoice.entity';
import {
  CancelInvoiceResponseDto,
  InvoiceDto,
} from './cancel-invoice.response.dto';

@Injectable()
export class CancelInvoiceResponder {
  public apply(invoice: Invoice): CancelInvoiceResponseDto {
    return {
      success: true,
      invoice: this.toDto(invoice),
    };
  }

  private toDto(invoice: Invoice): InvoiceDto {
    const formatDate = (date: Date | string): string => {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return date;
    };

    return {
      id: invoice.id,
      issuerUserId: invoice.issuerUserId,
      debtorUserId: invoice.debtorUserId,
      total: Number(invoice.total),
      balanceDue: Number(invoice.balanceDue),
      status: invoice.status,
      issueDate: formatDate(invoice.issueDate),
      dueDate: formatDate(invoice.dueDate),
      description: invoice.description,
    };
  }
}
