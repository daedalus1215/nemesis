export const PaymentStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentType = {
    INCOMING: 'INCOMING',
    OUTGOING: 'OUTGOING',
} as const;

export type PaymentType = typeof PaymentType[keyof typeof PaymentType];