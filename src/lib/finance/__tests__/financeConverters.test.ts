import { describe, it, expect } from 'vitest';
import {
  rowToFinancialCategory,
  rowToFinancialAttachment,
  rowToFinancialEntry,
  rowToFinancialRecurrence,
} from '@/lib/finance/financeConverters';

// ---------------------------------------------------------------------------
// rowToFinancialCategory
// ---------------------------------------------------------------------------
describe('rowToFinancialCategory', () => {
  const row = {
    id: 'cat-1',
    name: 'Salário',
    type: 'income',
    color: '#00ff00',
    is_active: true,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  };

  it('converts snake_case row to camelCase FinancialCategory', () => {
    const result = rowToFinancialCategory(row);
    expect(result.id).toBe('cat-1');
    expect(result.name).toBe('Salário');
    expect(result.type).toBe('income');
    expect(result.color).toBe('#00ff00');
    expect(result.isActive).toBe(true);
    expect(result.sortOrder).toBe(1);
    expect(result.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2026-01-02T00:00:00Z');
  });

  it('handles missing optional color', () => {
    const result = rowToFinancialCategory({ ...row, color: undefined });
    expect(result.color).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// rowToFinancialAttachment
// ---------------------------------------------------------------------------
describe('rowToFinancialAttachment', () => {
  const row = {
    id: 'att-1',
    entry_id: 'entry-42',
    storage_path: 'finance/att-1.pdf',
    file_name: 'nota.pdf',
    file_type: 'application/pdf',
    file_size: 102400,
    kind: 'invoice',
    uploaded_by: 'user-9',
    created_at: '2026-03-10T12:00:00Z',
  };

  it('converts snake_case row to camelCase FinancialAttachment', () => {
    const result = rowToFinancialAttachment(row);
    expect(result.id).toBe('att-1');
    expect(result.entryId).toBe('entry-42');
    expect(result.storagePath).toBe('finance/att-1.pdf');
    expect(result.fileName).toBe('nota.pdf');
    expect(result.fileType).toBe('application/pdf');
    expect(result.fileSize).toBe(102400);
    expect(result.kind).toBe('invoice');
    expect(result.uploadedBy).toBe('user-9');
    expect(result.createdAt).toBe('2026-03-10T12:00:00Z');
  });

  it('handles optional fields being absent', () => {
    const result = rowToFinancialAttachment({
      ...row,
      file_size: undefined,
      kind: undefined,
      uploaded_by: undefined,
    });
    expect(result.fileSize).toBeUndefined();
    expect(result.kind).toBeUndefined();
    expect(result.uploadedBy).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// rowToFinancialEntry
// ---------------------------------------------------------------------------
describe('rowToFinancialEntry', () => {
  const row = {
    id: 'entry-1',
    type: 'expense',
    status: 'pending',
    category_id: 'cat-5',
    category_name: 'Aluguel',
    description: 'Aluguel de escritório',
    counterparty_name: 'Imobiliária XYZ',
    counterparty_company_id: 'comp-3',
    amount: 3500.0,
    currency: 'BRL',
    payment_method: 'transfer',
    competence_date: '2026-06-01',
    due_date: '2026-06-10',
    paid_date: null,
    notes: 'Anual renovado',
    installment_group_id: null,
    installment_number: null,
    installment_total: null,
    recurrence_id: 'rec-1',
    created_by: 'user-1',
    created_at: '2026-05-25T10:00:00Z',
    updated_at: '2026-05-26T10:00:00Z',
  };

  it('converts snake_case row to camelCase FinancialEntry', () => {
    const result = rowToFinancialEntry(row);
    expect(result.id).toBe('entry-1');
    expect(result.type).toBe('expense');
    expect(result.status).toBe('pending');
    expect(result.categoryId).toBe('cat-5');
    expect(result.categoryName).toBe('Aluguel');
    expect(result.description).toBe('Aluguel de escritório');
    expect(result.counterpartyName).toBe('Imobiliária XYZ');
    expect(result.counterpartyCompanyId).toBe('comp-3');
    expect(result.amount).toBe(3500.0);
    expect(result.currency).toBe('BRL');
    expect(result.paymentMethod).toBe('transfer');
    expect(result.competenceDate).toBe('2026-06-01');
    expect(result.dueDate).toBe('2026-06-10');
    expect(result.paidDate).toBeUndefined();
    expect(result.notes).toBe('Anual renovado');
    expect(result.installmentGroupId).toBeUndefined();
    expect(result.installmentNumber).toBeUndefined();
    expect(result.installmentTotal).toBeUndefined();
    expect(result.recurrenceId).toBe('rec-1');
    expect(result.createdBy).toBe('user-1');
    expect(result.createdAt).toBe('2026-05-25T10:00:00Z');
    expect(result.updatedAt).toBe('2026-05-26T10:00:00Z');
  });

  it('does NOT compute overdue — status is returned as-is from DB', () => {
    // Even if due_date is in the past, rowToFinancialEntry must NOT derive overdue
    const pastRow = { ...row, status: 'pending', due_date: '2020-01-01' };
    const result = rowToFinancialEntry(pastRow);
    expect(result.status).toBe('pending');
  });

  it('handles null nullable fields gracefully', () => {
    const result = rowToFinancialEntry({
      ...row,
      category_id: null,
      category_name: null,
      counterparty_name: null,
      counterparty_company_id: null,
      payment_method: null,
      paid_date: null,
      notes: null,
      installment_group_id: null,
      installment_number: null,
      installment_total: null,
      recurrence_id: null,
      created_by: null,
    });
    expect(result.categoryId).toBeUndefined();
    expect(result.categoryName).toBeUndefined();
    expect(result.counterpartyName).toBeUndefined();
    expect(result.counterpartyCompanyId).toBeUndefined();
    expect(result.paymentMethod).toBeUndefined();
    expect(result.paidDate).toBeUndefined();
    expect(result.notes).toBeUndefined();
    expect(result.installmentGroupId).toBeUndefined();
    expect(result.installmentNumber).toBeUndefined();
    expect(result.installmentTotal).toBeUndefined();
    expect(result.recurrenceId).toBeUndefined();
    expect(result.createdBy).toBeUndefined();
  });

  it('maps core fields, coerces string amount and maps category_name join', () => {
    const entry = rowToFinancialEntry({
      id: 'e1',
      type: 'expense',
      status: 'pending',
      category_id: 'c1',
      category_name: 'Marketing',
      description: 'Anúncios',
      counterparty_name: 'Google',
      counterparty_company_id: null,
      amount: '1500.50',
      currency: 'BRL',
      payment_method: 'pix',
      competence_date: '2026-06-01',
      due_date: '2026-06-10',
      paid_date: null,
      notes: null,
      installment_group_id: null,
      installment_number: null,
      installment_total: null,
      recurrence_id: null,
      created_by: 'u1',
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
    });
    expect(entry.amount).toBe(1500.5);
    expect(entry.categoryName).toBe('Marketing');
    expect(entry.counterpartyCompanyId).toBeUndefined();
    expect(entry.attachments).toBeUndefined();
  });

  it('maps nested attachments array when present', () => {
    const entry = rowToFinancialEntry({
      id: 'e2',
      type: 'income',
      status: 'paid',
      description: 'Consultoria',
      amount: 1000,
      currency: 'BRL',
      competence_date: '2026-06-01',
      due_date: '2026-06-01',
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
      attachments: [
        {
          id: 'a1',
          entry_id: 'e2',
          storage_path: 'financial/e2/1-recibo.pdf',
          file_name: 'recibo.pdf',
          file_type: 'application/pdf',
          created_at: '2026-06-01T00:00:00Z',
        },
      ],
    });
    expect(entry.attachments).toHaveLength(1);
    expect(entry.attachments?.[0].id).toBe('a1');
  });
});

// ---------------------------------------------------------------------------
// rowToFinancialRecurrence
// ---------------------------------------------------------------------------
describe('rowToFinancialRecurrence', () => {
  const row = {
    id: 'rec-1',
    type: 'expense',
    description: 'Plano mensal SaaS',
    category_id: 'cat-2',
    counterparty_name: 'Fornecedor ABC',
    counterparty_company_id: 'comp-7',
    amount: 499.9,
    payment_method: 'card_credit',
    frequency: 'monthly',
    interval: 1,
    day_of_month: 5,
    start_date: '2026-01-05',
    end_date: null,
    next_run_date: '2026-07-05',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  };

  it('converts snake_case row to camelCase FinancialRecurrence', () => {
    const result = rowToFinancialRecurrence(row);
    expect(result.id).toBe('rec-1');
    expect(result.type).toBe('expense');
    expect(result.description).toBe('Plano mensal SaaS');
    expect(result.categoryId).toBe('cat-2');
    expect(result.counterpartyName).toBe('Fornecedor ABC');
    expect(result.counterpartyCompanyId).toBe('comp-7');
    expect(result.amount).toBe(499.9);
    expect(result.paymentMethod).toBe('card_credit');
    expect(result.frequency).toBe('monthly');
    expect(result.interval).toBe(1);
    expect(result.dayOfMonth).toBe(5);
    expect(result.startDate).toBe('2026-01-05');
    expect(result.endDate).toBeUndefined();
    expect(result.nextRunDate).toBe('2026-07-05');
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2026-01-02T00:00:00Z');
  });

  it('handles optional nullable fields', () => {
    const result = rowToFinancialRecurrence({
      ...row,
      category_id: null,
      counterparty_name: null,
      counterparty_company_id: null,
      payment_method: null,
      day_of_month: null,
      end_date: null,
      next_run_date: null,
    });
    expect(result.categoryId).toBeUndefined();
    expect(result.counterpartyName).toBeUndefined();
    expect(result.counterpartyCompanyId).toBeUndefined();
    expect(result.paymentMethod).toBeUndefined();
    expect(result.dayOfMonth).toBeUndefined();
    expect(result.endDate).toBeUndefined();
    expect(result.nextRunDate).toBeUndefined();
  });
});
