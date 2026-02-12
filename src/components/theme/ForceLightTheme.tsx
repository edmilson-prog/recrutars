import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * ForceLightTheme Component
 *
 * Forca tema light em paginas publicas/marketing, preservando
 * a preferencia original do usuario via backup em localStorage.
 *
 * Correcoes para bugs conhecidos:
 * - localStorage backup (nao React ref) — sobrevive a timing de React state
 * - Contador module-level evita restauracao prematura entre instancias
 * - Manipulacao direta do DOM no unmount evita depender de useEffect batched
 */

const STORAGE_KEY = 'recrutars-theme';
const BACKUP_KEY = 'recrutars-theme-backup';

/**
 * Contador de instancias ativas de ForceLightTheme.
 * Somente a ultima instancia a desmontar dispara a restauracao do tema.
 * Previne race conditions ao navegar entre paginas publicas.
 */
let activeForceLightCount = 0;

export function ForceLightTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // MOUNT: backup somente se nenhum backup existe ainda.
    // Quando transitando entre paginas publicas (Landing → Plans), a
    // instancia anterior pode ter desmontado e restaurado. Se outra
    // instancia ainda esta ativa (count > 0), o backup ja contem
    // a preferencia original correta.
    if (!localStorage.getItem(BACKUP_KEY)) {
      const currentTheme = localStorage.getItem(STORAGE_KEY);
      localStorage.setItem(BACKUP_KEY, currentTheme || 'system');
    }

    activeForceLightCount++;
    setTheme('light');

    // UNMOUNT
    return () => {
      activeForceLightCount--;

      if (activeForceLightCount <= 0) {
        activeForceLightCount = 0; // Clamp defensivo

        const backup = localStorage.getItem(BACKUP_KEY);
        const themeToRestore = backup || 'system';

        // 1. Limpa backup (consumido)
        localStorage.removeItem(BACKUP_KEY);

        // 2. Grava no localStorage primario (sincrono, duravel)
        localStorage.setItem(STORAGE_KEY, themeToRestore);

        // 3. Aplica classes no DOM diretamente.
        //    next-themes usa attribute="class" no <html>.
        //    Necessario porque o React state update do setTheme e
        //    batched pelo React 18, e o useEffect do ThemeProvider
        //    que aplica classes pode nao rodar antes do proximo paint.
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        if (themeToRestore === 'dark') {
          root.classList.add('dark');
        } else if (themeToRestore === 'system') {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          root.classList.add(prefersDark ? 'dark' : 'light');
        }
        // 'light' nao precisa de classe extra (next-themes usa ausencia de 'dark')

        // 4. Sincroniza React state do next-themes.
        //    setTheme grava no localStorage (redundante mas inofensivo)
        //    e faz setState para que useTheme() retorne valores corretos.
        setTheme(themeToRestore);
      }
      // Se activeForceLightCount > 0, outra instancia ainda esta montada.
      // Nao restaurar — ela mantem light forcado, e o backup permanece
      // no localStorage para a ultima instancia consumir.
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
