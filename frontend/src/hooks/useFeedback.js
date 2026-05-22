import { useState, useCallback } from 'react';

/**
 * Hook ergonomico para usar FeedbackDialog.
 *
 * Uso:
 *   const fb = useFeedback();
 *   fb.success('Salvo!', 'Perfil atualizado.');
 *   fb.error('Erro', 'Nao foi possivel salvar.');
 *
 *   <FeedbackDialog
 *     visible={fb.visible}
 *     onClose={fb.close}
 *     type={fb.type}
 *     title={fb.title}
 *     message={fb.message}
 *     autoCloseMs={fb.autoCloseMs}
 *   />
 */
export default function useFeedback() {
  const [state, setState] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    autoCloseMs: undefined,
  });

  const show = useCallback((type, title, message, autoCloseMs) => {
    setState({ visible: true, type, title, message, autoCloseMs });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  return {
    ...state,
    close,
    show,
    success: (title, message, autoCloseMs) => show('success', title, message, autoCloseMs),
    error:   (title, message, autoCloseMs) => show('error',   title, message, autoCloseMs),
    warn:    (title, message, autoCloseMs) => show('warn',    title, message, autoCloseMs),
    info:    (title, message, autoCloseMs) => show('info',    title, message, autoCloseMs),
  };
}
