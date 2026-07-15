import { describe, it, expect } from 'vitest';
import { hasNewBuild, isSnoozed } from './updateChecker';

describe('hasNewBuild', () => {
  it('retorna true quando o build buscado é diferente do atual', () => {
    expect(hasNewBuild('abc', 'def')).toBe(true);
  });

  it('retorna false quando os ids são iguais', () => {
    expect(hasNewBuild('abc', 'abc')).toBe(false);
  });

  it('retorna false quando a busca falhou (null)', () => {
    expect(hasNewBuild('abc', null)).toBe(false);
  });

  it('retorna false para string vazia', () => {
    expect(hasNewBuild('abc', '')).toBe(false);
  });
});

describe('isSnoozed', () => {
  it('retorna true quando "agora" é antes do fim do snooze', () => {
    expect(isSnoozed(2000, 1000)).toBe(true);
  });

  it('retorna false quando "agora" já passou do snooze', () => {
    expect(isSnoozed(1000, 2000)).toBe(false);
  });

  it('retorna false quando não há snooze definido', () => {
    expect(isSnoozed(null, 1000)).toBe(false);
  });
});
