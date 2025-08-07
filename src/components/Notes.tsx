import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  StickyNote,
  Plus,
  Search,
  Trash2,
  Edit3,
  Save,
  Copy,
  Undo,
  Redo,
  Type,
  Download,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notesAPI, type Note } from "@/lib/storage";

export const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Загружаем заметки при монтировании компонента
  useEffect(() => {
    const loadNotes = () => {
      const allNotes = notesAPI.getAll();
      setNotes(allNotes);
      if (allNotes.length > 0 && !selectedNote) {
        setSelectedNote(allNotes[0]);
      }
    };
    loadNotes();
  }, [selectedNote]);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewNote = () => {
    const newNote = notesAPI.create({
      title: "Новая заметка",
      content: "",
    });
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    toast({ title: "Создано", description: "Новая заметка создана" });
  };

  const startEditing = () => {
    if (!selectedNote) return;
    setIsEditing(true);
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setHistory([selectedNote.content]);
    setHistoryIndex(0);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const updatedNote = notesAPI.update(selectedNote.id, {
      title: editTitle || "Без названия",
      content: editContent,
    });

    if (updatedNote) {
      setNotes(
        notes.map((note) => (note.id === selectedNote.id ? updatedNote : note))
      );
      setSelectedNote(updatedNote);
      setIsEditing(false);
      toast({ title: "Сохранено", description: "Заметка обновлена" });
    }
  };

  const deleteNote = (noteId: string) => {
    if (notesAPI.delete(noteId)) {
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(notes.find((note) => note.id !== noteId) || null);
        setIsEditing(false);
      }
      toast({ title: "Удалено", description: "Заметка удалена" });
    }
  };

  const addToHistory = (content: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleContentChange = (content: string) => {
    setEditContent(content);
    if (content !== history[historyIndex]) {
      addToHistory(content);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditContent(history[historyIndex + 1]);
    }
  };

  const copyToClipboard = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    toast({
      title: "Скопировано",
      description: "Содержимое заметки скопировано",
    });
  };

  const clearContent = () => {
    setEditContent("");
    addToHistory("");
  };



  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `linguascribe-notes-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast({ title: "Экспорт", description: "Заметки экспортированы" });
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedNotes)) {
          // Добавляем импортированные заметки
          importedNotes.forEach((note) => {
            notesAPI.create({
              title: note.title || "Импортированная заметка",
              content: note.content || "",
            });
          });

          // Перезагружаем заметки
          const allNotes = notesAPI.getAll();
          setNotes(allNotes);
          toast({
            title: "Импорт",
            description: `${importedNotes.length} заметок импортировано`,
          });
        }
      } catch (error) {
        toast({ title: "Ошибка", description: "Неверный формат файла" });
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Боковая панель с заметками */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-gradient-secondary border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StickyNote className="w-5 h-5 text-primary" />
                <span>Заметки</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportNotes}
                  title="Экспорт"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <label htmlFor="import-notes" className="cursor-pointer">
                  <Button size="sm" variant="outline" asChild title="Импорт">
                    <span>
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
                <input
                  id="import-notes"
                  type="file"
                  accept=".json"
                  onChange={importNotes}
                  className="hidden"
                />
                <Button size="sm" onClick={createNewNote}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Поиск заметок..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`cursor-pointer transition-smooth border-border ${
                selectedNote?.id === note.id
                  ? "bg-primary/10 border-primary"
                  : "bg-card hover:bg-secondary/50"
              }`}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm truncate flex-1 mr-2">
                    {note.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {note.content.substring(0, 80)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(note.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Область редактирования */}
      <div className="lg:col-span-2 space-y-4">
        {selectedNote ? (
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-lg font-medium bg-transparent border-none p-0 focus:ring-0"
                      placeholder="Название заметки"
                    />
                  ) : (
                    <h2 className="text-lg font-medium">
                      {selectedNote.title}
                    </h2>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Отмена
                      </Button>
                      <Button size="sm" onClick={saveNote}>
                        <Save className="w-4 h-4 mr-1" />
                        Сохранить
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={startEditing}>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Обновлено: {formatDate(selectedNote.updatedAt)}</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4 h-full">
              {isEditing && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearContent}>
                    <Trash2 className="w-4 h-4" />
                  </Button>


                  <div className="flex items-center space-x-2 ml-auto">
                    <Type className="w-4 h-4" />
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="text-sm bg-background border border-border rounded px-2 py-1"
                    >
                      <option value={12}>12px</option>
                      <option value={14}>14px</option>
                      <option value={16}>16px</option>
                      <option value={18}>18px</option>
                      <option value={20}>20px</option>
                    </select>
                  </div>
                </div>
              )}

              {isEditing ? (
                <Textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Начните вводить текст заметки..."
                  className="min-h-[400px] bg-background/50 border-border resize-none"
                  style={{ fontSize: `${fontSize}px` }}
                />
              ) : (
                <div
                  className="min-h-[400px] p-4 bg-background/30 rounded-md border border-border whitespace-pre-wrap"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {selectedNote.content || (
                    <span className="text-muted-foreground italic">
                      Заметка пуста
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <StickyNote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Выберите заметку</h3>
                <p className="text-muted-foreground">
                  Выберите заметку из списка или создайте новую
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
