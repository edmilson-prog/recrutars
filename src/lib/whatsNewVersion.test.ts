import { describe, it, expect } from 'vitest';
import { shouldShowWhatsNew } from './whatsNewVersion';

describe('shouldShowWhatsNew', () => {
  it('retorna true quando a versão mudou', () => {
    expect(shouldShowWhatsNew('1.73.0', '1.73.1')).toBe(true);
  });

  it('retorna false quando a versão é a mesma', () => {
    expect(shouldShowWhatsNew('1.73.1', '1.73.1')).toBe(false);
  });

  it('retorna false na primeira visita de sempre (sem última versão vista)', () => {
    expect(shouldShowWhatsNew(null, '1.73.1')).toBe(false);
  });

  it('retorna false enquanto a versão atual ainda não carregou', () => {
    expect(shouldShowWhatsNew('1.73.0', null)).toBe(false);
  });
});
