/**
 * Утилита для работы с буфером обмена
 * Поддерживает веб и мобильные платформы
 */

export class ClipboardManager {
  /**
   * Копирует текст в буфер обмена
   */
  static async copyText(text: string): Promise<boolean> {
    try {
      // Проверяем поддержку Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Copy error:', error);
      return false;
    }
  }

  /**
   * Читает текст из буфера обмена
   */
  static async readText(): Promise<string | null> {
    try {
      // Проверяем поддержку Clipboard API
      if (navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      } else {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        
        const success = document.execCommand('paste');
        const text = textArea.value;
        document.body.removeChild(textArea);
        
        return success ? text : null;
      }
    } catch (error) {
      console.error('Read error:', error);
      return null;
    }
  }

  /**
   * Проверяет доступность буфера обмена
   */
  static isSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand);
  }

  /**
   * Показывает инструкции для пользователя
   */
  static getInstructions(): string {
    if (this.isSupported()) {
      return "Используйте кнопки копирования/вставки или стандартные сочетания клавиш";
    } else {
      return "Буфер обмена не поддерживается в вашем браузере. Используйте Ctrl+C/Ctrl+V";
    }
  }
}

// Экспортируем для использования в компонентах
export const clipboard = {
  copy: ClipboardManager.copyText,
  read: ClipboardManager.readText,
  isSupported: ClipboardManager.isSupported,
  getInstructions: ClipboardManager.getInstructions,
}; 