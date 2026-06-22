import { describe, it, expect } from 'vitest';
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';

describe('maskCpfPartial', () => {
  it('masks first block and check digits of a formatted CPF', () => {
    expect(maskCpfPartial('093.740.429-24')).toBe('***.740.429-**');
  });
  it('formats and masks a raw 11-digit CPF', () => {
    expect(maskCpfPartial('09374042924')).toBe('***.740.429-**');
  });
  it('returns the masked placeholder for empty/invalid input', () => {
    expect(maskCpfPartial('')).toBe('***.***.***-**');
    expect(maskCpfPartial('123')).toBe('***.***.***-**');
  });
});

describe('maskIpPartial', () => {
  it('keeps the first two octets and masks the last two', () => {
    expect(maskIpPartial('187.61.10.20')).toBe('187.61.xx.xx');
  });
  it('returns a full placeholder for empty/invalid input', () => {
    expect(maskIpPartial('')).toBe('xxx.xxx.xx.xx');
    expect(maskIpPartial('not-an-ip')).toBe('xxx.xxx.xx.xx');
  });
});
