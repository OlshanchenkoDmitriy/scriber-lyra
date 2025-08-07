import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
  Download,
  Share2,
  Eye,
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
  const [favoriteSeparators, setFavoriteSeparators] = useState<string[]>([]);
  const [showInvisible, setShowInvisible] = useState(false);
  const [targetChars, setTargetChars] = useState<number>(0);
  const [targetWords, setTargetWords] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("editor_fav_separators");
      if (saved) setFavoriteSeparators(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "editor_fav_separators",
        JSON.stringify(favoriteSeparators.slice(0, 8))
      );
    } catch {}
  }, [favoriteSeparators]);

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

  // Selection helpers
  const getSelection = () => {
    const el = textareaRef.current;
    if (!el) return { start: 0, end: 0 };
    return { start: el.selectionStart, end: el.selectionEnd };
  };

  const replaceRange = (source: string, start: number, end: number, insert: string) => {
    return source.substring(0, start) + insert + source.substring(end);
  };

  const applyToSelectionOrAll = (transform: (input: string) => string) => {
    const el = textareaRef.current;
    if (!el) {
      handleTextChange(transform(text));
      return;
    }
    const { start, end } = getSelection();
    if (start !== end) {
      const selected = text.substring(start, end);
      const changed = transform(selected);
      const next = replaceRange(text, start, end, changed);
      handleTextChange(next);
      // Restore selection around changed block
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + changed.length);
      }, 0);
    } else {
      const next = transform(text);
      handleTextChange(next);
      setTimeout(() => {
        el.focus();
        const pos = Math.min(next.length, start);
        el.setSelectionRange(pos, pos);
      }, 0);
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
        description:
          "Не удалось скопировать текст. Попробуйте выделить текст и использовать Ctrl+C",
        variant: "destructive",
      });
    }
  };

  const pasteFromClipboard = async () => {
    const clipboardText = await clipboard.read();
    if (clipboardText) {
      const el = textareaRef.current;
      if (el && el.selectionStart !== el.selectionEnd) {
        const { start, end } = getSelection();
        const next = replaceRange(text, start, end, clipboardText);
        handleTextChange(next);
      } else {
        handleTextChange(text + clipboardText);
      }
      toast({ title: "Вставлено", description: "Текст вставлен из буфера обмена" });
    } else {
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

  // Основные функции форматирования (с учётом выделения)
  const transformCase = (type: "title" | "sentence") => {
    applyToSelectionOrAll((chunk) => {
      switch (type) {
        case "title":
          return chunk.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        case "sentence":
          return chunk.replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());
      }
    });
    toast({
      title: "Форматирование",
      description: `Регистр изменен на ${type === "title" ? "заглавный" : "первая буква заглавная"}`,
    });
  };

  const removeExtraSpaces = () => {
    applyToSelectionOrAll((chunk) => chunk.replace(/\s+/g, " ").trim());
    toast({ title: "Очистка", description: "Лишние пробелы удалены" });
  };

  const removeDuplicateLines = () => {
    applyToSelectionOrAll((chunk) => {
      const lines = chunk.split("\n");
      const unique = [...new Set(lines)];
      return unique.join("\n");
    });
    toast({ title: "Очистка", description: "Дубликаты строк удалены" });
  };

  const sortLines = () => {
    applyToSelectionOrAll((chunk) => {
      const lines = chunk.split("\n").filter((l) => l.trim());
      return lines.sort().join("\n");
    });
    toast({ title: "Сортировка", description: "Строки отсортированы по алфавиту" });
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
    applyToSelectionOrAll((chunk) => chunk.replace(/^\s*[\r\n]/gm, ""));
    toast({ title: "Очистка", description: "Пустые строки удалены" });
  };

  // Функции преобразования списков (с учётом выделения)
  const inlineToList = () => {
    applyToSelectionOrAll((chunk) => {
      return chunk
        .split("\n")
        .map((line) => {
          if (line.trim()) {
            return line
              .split(separator)
              .map((item) => item.trim())
              .filter((item) => item)
              .join("\n");
          }
          return line;
        })
        .join("\n");
    });
    toast({ title: "Преобразование", description: "Inline текст преобразован в список" });
  };

  const listToInline = () => {
    applyToSelectionOrAll((chunk) => {
      const newLines = chunk
        .split("\n")
        .map((line) => (line.trim() ? line.trim() : line));
      return newLines
        .filter((line) => line.trim())
        .join(separator + " ");
    });
    toast({ title: "Преобразование", description: "Список преобразован в inline текст" });
  };

  // Markdown функции (как было)
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

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);

    toast({ title: "Markdown", description: `${type} добавлен` });
  };

  const removeMarkdown = () => {
    let newText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/^#\s+/gm, "")
      .replace(/^---$/gm, "")
      .replace(/\n\s*\n---\s*\n\s*\n/g, "\n\n");

    handleTextChange(newText);
    toast({ title: "Markdown", description: "Разметка удалена" });
  };

  const findAndReplace = () => {
    if (!searchTerm) return;
    const el = textareaRef.current;
    if (el && el.selectionStart !== el.selectionEnd) {
      const { start, end } = getSelection();
      const selected = text.substring(start, end);
      const replaced = selected.split(searchTerm).join(replaceTerm);
      const next = replaceRange(text, start, end, replaced);
      handleTextChange(next);
    } else {
      const newText = text.split(searchTerm).join(replaceTerm);
      handleTextChange(newText);
    }
    toast({ title: "Замена", description: "Текст заменен" });
  };

  // Быстрые исправления
  const fixDoubleSpaces = () => applyToSelectionOrAll((c) => c.replace(/\s{2,}/g, " "));
  const fixSpaceBeforePunct = () => applyToSelectionOrAll((c) => c.replace(/\s+([,.;:!?\)\]\}])/g, "$1").replace(/([\(\[\{])\s+/g, "$1"));
  const fixDoublePunctuation = () => applyToSelectionOrAll((c) => c.replace(/([,.;:!?])\1+/g, "$1"));
  const replaceWithSmartQuotesRu = () => applyToSelectionOrAll((c) => c.replace(/"([^\"]+)"/g, "«$1»"));

  // Невидимые символы (превью)
  const visualizeInvisible = (source: string) => {
    const lines = source.split("\n");
    const marked = lines.map((ln) => ln.replace(/\t/g, "⇥").replace(/ /g, "·") + " ↵");
    return marked.join("\n");
  };

  // Экспорт и общий доступ
  const exportAs = (format: "txt" | "md") => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `text.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Экспорт", description: `Файл .${format} сохранен` });
  };

  const shareText = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: "Текстовый редактор", text });
      } else {
        throw new Error("share-not-supported");
      }
    } catch {
      toast({ title: "Поделиться", description: "Поделиться не поддерживается на вашем устройстве", variant: "destructive" });
    }
  };

  const addCurrentSeparatorToFavorites = () => {
    if (!separator) return;
    if (favoriteSeparators.includes(separator)) return;
    const next = [separator, ...favoriteSeparators].slice(0, 8);
    setFavoriteSeparators(next);
    toast({ title: "Сохранено", description: "Разделитель добавлен в избранные" });
  };

  const stats = (() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split("\n").length;
    return { chars, words, lines };
  })();

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
            <Button variant="outline" size="icon" onClick={copyToClipboard} title="Копировать">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={pasteFromClipboard} title="Вставить">
              <Clipboard className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={clearText} title="Очистить">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={saveToHistory} title="Сохранить в историю">
              <Save className="w-4 h-4" />
            </Button>
            {/* Экспорт/Шеринг */}
            <Button variant="outline" size="icon" onClick={() => exportAs("txt")} title="Экспорт .txt">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => exportAs("md")} title="Экспорт .md">
              <HashIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={shareText} title="Поделиться">
              <Share2 className="w-4 h-4" />
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

          {/* Просмотр невидимых символов */}
          <div className="flex items-center gap-2">
            <Switch checked={showInvisible} onCheckedChange={setShowInvisible} id="show-invisible" />
            <Label htmlFor="show-invisible" className="text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" /> Показать невидимые символы
            </Label>
          </div>
          {showInvisible && (
            <pre className="p-3 rounded-md border border-border bg-muted/30 text-xs overflow-auto whitespace-pre-wrap">
              {visualizeInvisible(text)}
            </pre>
          )}

          {/* Панель специальных символов */}
          <SpecialCharsManager text={text} onTextChange={handleTextChange} />

          {/* Статистика */}
          <div className="flex flex-wrap gap-1 md:gap-2">
            <Badge variant="outline" className="bg-background/50 text-xs md:text-sm">
              Символов: {stats.chars}
            </Badge>
            <Badge variant="outline" className="bg-background/50 text-xs md:text-sm">
              Слов: {stats.words}
            </Badge>
            <Badge variant="outline" className="bg-background/50 text-xs md:text-sm">
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
            <Button onClick={findAndReplace} disabled={!searchTerm} className="w-full">
              Заменить все {/** с учётом выделения, если есть */}
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
              <Button variant="outline" size="sm" onClick={() => transformCase("title")} className="text-xs">
                <Type className="w-3 h-3 mr-1" /> Заглавный
              </Button>
              <Button variant="outline" size="sm" onClick={() => transformCase("sentence")} className="text-xs">
                <Type className="w-3 h-3 mr-1" /> Первая заглавная
              </Button>
            </div>

            {/* Функции очистки */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={clearText}>
                <Hash className="w-3 h-3 mr-1" /> Удалить все
              </Button>
              <Button variant="outline" size="sm" onClick={removeExtraSpaces}>
                <Space className="w-3 h-3 mr-1" /> Удалить пробелы
              </Button>
              <Button variant="outline" size="sm" onClick={removeDuplicateLines}>
                <List className="w-3 h-3 mr-1" /> Удалить дубликаты
              </Button>
              <Button variant="outline" size="sm" onClick={removeEmptyLines}>
                <AlignLeft className="w-3 h-3 mr-1" /> Удалить пустые строки
              </Button>
            </div>

            {/* Дополнительные функции */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={sortLines}>
                <SortAsc className="w-3 h-3 mr-1" /> Сортировать строки
              </Button>
              <Button variant="outline" size="sm" onClick={countCharacters}>
                <Calculator className="w-3 h-3 mr-1" /> Подсчитать символы
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые исправления */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Быстрые исправления</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={fixDoubleSpaces}>Двойные пробелы → один</Button>
          <Button variant="outline" size="sm" onClick={fixSpaceBeforePunct}>Убрать пробел перед пунктуацией</Button>
          <Button variant="outline" size="sm" onClick={fixDoublePunctuation}>Двойная пунктуация → одна</Button>
          <Button variant="outline" size="sm" onClick={replaceWithSmartQuotesRu}>Кавычки → «ёлочки»</Button>
        </CardContent>
      </Card>

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
              {/* Избранные разделители */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[", ", "; ", "|", " / ", "\t", ...favoriteSeparators].slice(0, 8).map((sep, idx) => (
                  <Button
                    key={`${sep}-${idx}`}
                    variant={separator === sep ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSeparator(sep)}
                    className="text-xs"
                  >
                    {sep === "\t" ? "TAB" : sep}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={addCurrentSeparatorToFavorites} className="text-xs">
                  + В избранные
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={inlineToList}>
                <List className="w-3 h-3 mr-1" /> Inline → Список
              </Button>
              <Button variant="outline" size="sm" onClick={listToInline}>
                <AlignLeft className="w-3 h-3 mr-1" /> Список → Inline
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
              <Button variant="outline" size="sm" onClick={() => addMarkdown("bold")}>
                <Bold className="w-3 h-3 mr-1" /> ** Жирный **
              </Button>
              <Button variant="outline" size="sm" onClick={() => addMarkdown("underline")}>
                <Underline className="w-3 h-3 mr-1" /> __ Подчеркнутый __
              </Button>
              <Button variant="outline" size="sm" onClick={() => addMarkdown("code")}>
                <Code className="w-3 h-3 mr-1" />` Код `
              </Button>
              <Button variant="outline" size="sm" onClick={() => addMarkdown("heading")}>
                <Heading1 className="w-3 h-3 mr-1" /># Заголовок
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => addMarkdown("separator")}>
                <SeparatorHorizontal className="w-3 h-3 mr-1" /> --- Разделитель
              </Button>
              <Button variant="outline" size="sm" onClick={removeMarkdown}>
                <Settings className="w-3 h-3 mr-1" /> Убрать Markdown
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Цели по объёму */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Цели по объёму</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target-chars">Цель по символам</Label>
              <Input
                id="target-chars"
                type="number"
                min={0}
                value={targetChars}
                onChange={(e) => setTargetChars(Number(e.target.value))}
                className="bg-background/50"
                placeholder="например, 1000"
              />
              {targetChars > 0 && (
                <div className="mt-2 space-y-1">
                  <Progress value={Math.min(100, (stats.chars / targetChars) * 100)} />
                  <div className="text-xs text-muted-foreground">
                    {stats.chars} / {targetChars} символов
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="target-words">Цель по словам</Label>
              <Input
                id="target-words"
                type="number"
                min={0}
                value={targetWords}
                onChange={(e) => setTargetWords(Number(e.target.value))}
                className="bg-background/50"
                placeholder="например, 200"
              />
              {targetWords > 0 && (
                <div className="mt-2 space-y-1">
                  <Progress value={Math.min(100, (stats.words / targetWords) * 100)} />
                  <div className="text-xs text-muted-foreground">
                    {stats.words} / {targetWords} слов
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
