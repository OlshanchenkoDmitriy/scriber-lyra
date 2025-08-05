import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Trash2,
  Undo,
  Redo,
  Search,
  Type,
  Hash,
  Space,
  FileText,
  Clipboard,
  Save,
  Bold,
  Underline,
  Code,
  Heading1,
  Minus,
  List,
  AlignLeft,
  SortAsc,
  Hash as HashIcon,
  Calculator,
  SeparatorHorizontal,
  ArrowRightLeft,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SpecialCharsManager } from "./SpecialCharsManager";
import { historyAPI } from "@/lib/storage";
import { clipboard } from "@/lib/clipboard";

export const Editor = () => {
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [separator, setSeparator] = useState(",");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const addToHistory = (newText: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (newText !== history[historyIndex]) {
      addToHistory(newText);
    }
  };

  const copyToClipboard = async () => {
    const success = await clipboard.copy(text);
    if (success) {
      toast({
        title: "Скопировано",
        description: "Текст скопирован в буфер обмена",
      });
    } else {
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать текст. Попробуйте выделить текст и использовать Ctrl+C",
        variant: "destructive",
      });
    }
  };

  const pasteFromClipboard = async () => {
    const clipboardText = await clipboard.read();
    if (clipboardText) {
      handleTextChange(text + clipboardText);
      toast({
        title: "Вставлено",
        description: "Текст вставлен из буфера обмена",
      });
    } else {
      // Если не удалось прочитать буфер обмена, предлагаем альтернативы
      if (textareaRef.current) {
        textareaRef.current.focus();
        toast({
          title: "Внимание",
          description: "Используйте Ctrl+V или длительное нажатие в поле ввода для вставки",
        });
      } else {
        toast({
          title: "Ошибка буфера обмена",
          description: "Не удалось прочитать буфер обмена. Проверьте разрешения приложения",
          variant: "destructive",
        });
      }
    }
  };

  const clearText = () => {
    handleTextChange("");
    toast({ title: "Очищено", description: "Текст удален" });
  };

  const saveToHistory = () => {
    if (!text.trim()) {
      toast({ title: "Ошибка", description: "Нет текста для сохранения" });
      return;
    }

    const hasRussianChars = /[а-яё]/i.test(text);
    const language: "ru" | "en" = hasRussianChars ? "ru" : "en";

    historyAPI.add({
      text: text,
      language: language,
      type: "manual",
    });

    toast({ title: "Сохранено", description: "Текст добавлен в историю" });
  };

  // Основные функции форматирования
  const transformCase = (type: "title" | "sentence") => {
    let newText = text;
    switch (type) {
      case "title":
        newText = text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case "sentence":
        newText = text.replace(/(^\w|\.\s+\w)/g, (letter) =>
          letter.toUpperCase()
        );
        break;
    }
    handleTextChange(newText);
    toast({
      title: "Форматирование",
      description: `Регистр изменен на ${
        type === "title" ? "заглавный" : "первая буква заглавная"
      }`,
    });
  };

  const removeExtraSpaces = () => {
    const newText = text.replace(/\s+/g, " ").trim();
    handleTextChange(newText);
    toast({ title: "Очистка", description: "Лишние пробелы удалены" });
  };

  const removeDuplicateLines = () => {
    const lines = text.split("\n");
    const uniqueLines = [...new Set(lines)];
    const newText = uniqueLines.join("\n");
    handleTextChange(newText);
    toast({ title: "Очистка", description: "Дубликаты строк удалены" });
  };

  const sortLines = () => {
    const lines = text.split("\n").filter((line) => line.trim());
    const sortedLines = lines.sort();
    const newText = sortedLines.join("\n");
    handleTextChange(newText);
    toast({
      title: "Сортировка",
      description: "Строки отсортированы по алфавиту",
    });
  };

  const countCharacters = () => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split("\n").length;
    const paragraphs = text.split(/\n\s*\n/).length;

    toast({
      title: "Статистика",
      description: `Символов: ${chars}, Слов: ${words}, Строк: ${lines}, Параграфов: ${paragraphs}`,
    });
  };

  const removeEmptyLines = () => {
    const newText = text.replace(/^\s*[\r\n]/gm, "");
    handleTextChange(newText);
    toast({ title: "Очистка", description: "Пустые строки удалены" });
  };

  // Функции преобразования списков
  const inlineToList = () => {
    const lines = text.split("\n");
    const newLines = lines.map((line) => {
      if (line.trim()) {
        return line
          .split(separator)
          .map((item) => item.trim())
          .filter((item) => item)
          .join("\n");
      }
      return line;
    });
    const newText = newLines.join("\n");
    handleTextChange(newText);
    toast({
      title: "Преобразование",
      description: "Inline текст преобразован в список",
    });
  };

  const listToInline = () => {
    const lines = text.split("\n");
    const newLines = lines.map((line) => {
      if (line.trim()) {
        return line.trim();
      }
      return line;
    });
    const newText = newLines
      .filter((line) => line.trim())
      .join(separator + " ");
    handleTextChange(newText);
    toast({
      title: "Преобразование",
      description: "Список преобразован в inline текст",
    });
  };

  // Markdown функции
  const addMarkdown = (
    type: "bold" | "underline" | "code" | "heading" | "separator"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    let newText = text;
    let replacement = "";

    switch (type) {
      case "bold":
        replacement = `**${selectedText}**`;
        break;
      case "underline":
        replacement = `__${selectedText}__`;
        break;
      case "code":
        replacement = `\`${selectedText}\``;
        break;
      case "heading":
        replacement = `# ${selectedText}`;
        break;
      case "separator":
        replacement = selectedText ? `${selectedText}\n\n---\n\n` : "---";
        break;
    }

    newText = text.substring(0, start) + replacement + text.substring(end);
    handleTextChange(newText);

    // Устанавливаем курсор после вставленного текста
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }, 0);

    toast({ title: "Markdown", description: `${type} добавлен` });
  };

  const removeMarkdown = () => {
    let newText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // **bold**
      .replace(/__(.*?)__/g, "$1") // __underline__
      .replace(/`(.*?)`/g, "$1") // `code`
      .replace(/^#\s+/gm, "") // # heading
      .replace(/^---$/gm, "") // --- separator
      .replace(/\n\s*\n---\s*\n\s*\n/g, "\n\n"); // separator with newlines

    handleTextChange(newText);
    toast({ title: "Markdown", description: "Разметка удалена" });
  };

  const findAndReplace = () => {
    if (!searchTerm) return;
    const newText = text.split(searchTerm).join(replaceTerm);
    handleTextChange(newText);
    toast({ title: "Замена", description: "Текст заменен" });
  };

  const getStats = () => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split("\n").length;
    return { chars, words, lines };
  };

  const stats = getStats();

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-secondary border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            <span>Текстовый редактор</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Панель инструментов */}
          <div className="flex flex-wrap gap-1 md:gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="transition-smooth"
              title="Отменить"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="transition-smooth"
              title="Повтор"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              title="Копировать"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={pasteFromClipboard}
              title="Вставить"
            >
              <Clipboard className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearText}
              title="Очистить"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={saveToHistory}
              title="Сохранить в историю"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>

          {/* Текстовая область */}
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Введите или вставьте ваш текст здесь..."
            className="min-h-[200px] md:min-h-[300px] bg-background/50 border-border focus:border-primary transition-smooth"
          />

          {/* Панель специальных символов */}
          <SpecialCharsManager text={text} onTextChange={handleTextChange} />

          {/* Статистика */}
          <div className="flex flex-wrap gap-1 md:gap-2">
            <Badge
              variant="outline"
              className="bg-background/50 text-xs md:text-sm"
            >
              Символов: {stats.chars}
            </Badge>
            <Badge
              variant="outline"
              className="bg-background/50 text-xs md:text-sm"
            >
              Слов: {stats.words}
            </Badge>
            <Badge
              variant="outline"
              className="bg-background/50 text-xs md:text-sm"
            >
              Строк: {stats.lines}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Инструменты форматирования */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Search className="w-4 h-4 text-primary" />
              <span>Поиск и замена</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="search">Найти</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Текст для поиска"
                className="bg-background/50"
              />
            </div>
            <div>
              <Label htmlFor="replace">Заменить на</Label>
              <Input
                id="replace"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Новый текст"
                className="bg-background/50"
              />
            </div>
            <Button
              onClick={findAndReplace}
              disabled={!searchTerm}
              className="w-full"
            >
              Заменить все
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Type className="w-4 h-4 text-primary" />
              <span>Форматирование</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Основные функции */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => transformCase("title")}
                className="text-xs"
              >
                <Type className="w-3 h-3 mr-1" />
                Заглавный
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => transformCase("sentence")}
                className="text-xs"
              >
                <Type className="w-3 h-3 mr-1" />
                Первая заглавная
              </Button>
            </div>

            {/* Функции очистки */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={clearText}>
                <Hash className="w-3 h-3 mr-1" />
                Удалить все
              </Button>
              <Button variant="outline" size="sm" onClick={removeExtraSpaces}>
                <Space className="w-3 h-3 mr-1" />
                Удалить пробелы
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeDuplicateLines}
              >
                <List className="w-3 h-3 mr-1" />
                Удалить дубликаты
              </Button>
              <Button variant="outline" size="sm" onClick={removeEmptyLines}>
                <AlignLeft className="w-3 h-3 mr-1" />
                Удалить пустые строки
              </Button>
            </div>

            {/* Дополнительные функции */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={sortLines}>
                <SortAsc className="w-3 h-3 mr-1" />
                Сортировать строки
              </Button>
              <Button variant="outline" size="sm" onClick={countCharacters}>
                <Calculator className="w-3 h-3 mr-1" />
                Подсчитать символы
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Функции списков и Markdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              <span>Преобразование списков</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="separator">Разделитель</Label>
              <Input
                id="separator"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                placeholder="Разделитель (например: ,)"
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={inlineToList}>
                <List className="w-3 h-3 mr-1" />
                Inline → Список
              </Button>
              <Button variant="outline" size="sm" onClick={listToInline}>
                <AlignLeft className="w-3 h-3 mr-1" />
                Список → Inline
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <HashIcon className="w-4 h-4 text-primary" />
              <span>Markdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addMarkdown("bold")}
              >
                <Bold className="w-3 h-3 mr-1" />
                ** Жирный **
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addMarkdown("underline")}
              >
                <Underline className="w-3 h-3 mr-1" />
                __ Подчеркнутый __
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addMarkdown("code")}
              >
                <Code className="w-3 h-3 mr-1" />` Код `
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addMarkdown("heading")}
              >
                <Heading1 className="w-3 h-3 mr-1" /># Заголовок
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addMarkdown("separator")}
              >
                <SeparatorHorizontal className="w-3 h-3 mr-1" />
                --- Разделитель
              </Button>
              <Button variant="outline" size="sm" onClick={removeMarkdown}>
                <Settings className="w-3 h-3 mr-1" />
                Убрать Markdown
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
