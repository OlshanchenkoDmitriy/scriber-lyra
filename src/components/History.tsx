import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  History as HistoryIcon,
  Search,
  Download,
  Trash2,
  Copy,
  Calendar,
  Globe,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistoryRecord {
  id: string;
  text: string;
  language: "ru" | "en";
  timestamp: Date;
  type: "speech" | "manual";
}

// Мок данные для истории
const mockHistory: HistoryRecord[] = [
  {
    id: "1",
    text: "Привет, это тестовое сообщение на русском языке. Сегодня мы изучаем новые возможности приложения для распознавания речи.",
    language: "ru",
    timestamp: new Date("2024-01-15T10:30:00"),
    type: "speech"
  },
  {
    id: "2", 
    text: "Hello, this is a test message in English language. Today we are exploring new features of the speech recognition application.",
    language: "en",
    timestamp: new Date("2024-01-15T09:15:00"),
    type: "speech"
  },
  {
    id: "3",
    text: "Важная заметка о работе с текстом. Нужно не забыть проверить все функции редактора.",
    language: "ru",
    timestamp: new Date("2024-01-14T16:45:00"),
    type: "manual"
  },
  {
    id: "4",
    text: "Meeting notes: Discuss project timeline and deliverables for next quarter.",
    language: "en", 
    timestamp: new Date("2024-01-14T14:20:00"),
    type: "manual"
  },
  {
    id: "5",
    text: "Список покупок: молоко, хлеб, фрукты, овощи для приготовления ужина.",
    language: "ru",
    timestamp: new Date("2024-01-13T12:00:00"),
    type: "speech"
  }
];

export const History = () => {
  const [records] = useState<HistoryRecord[]>(mockHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"all" | "ru" | "en">("all");
  const [selectedType, setSelectedType] = useState<"all" | "speech" | "manual">("all");
  const { toast } = useToast();

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === "all" || record.language === selectedLanguage;
    const matchesType = selectedType === "all" || record.type === selectedType;
    
    return matchesSearch && matchesLanguage && matchesType;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано", description: "Текст скопирован в буфер обмена" });
  };

  const deleteRecord = (id: string) => {
    // В реальном приложении здесь будет удаление из базы данных
    toast({ title: "Удалено", description: "Запись удалена из истории" });
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'linguascribe-history.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast({ title: "Экспорт", description: "История экспортирована в файл" });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-secondary border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HistoryIcon className="w-5 h-5 text-primary" />
            <span>История записей</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Панель поиска и фильтров */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Поиск по содержанию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Язык:</span>
                <Badge 
                  variant={selectedLanguage === "all" ? "default" : "outline"}
                  className="cursor-pointer transition-smooth"
                  onClick={() => setSelectedLanguage("all")}
                >
                  Все
                </Badge>
                <Badge 
                  variant={selectedLanguage === "ru" ? "default" : "outline"}
                  className="cursor-pointer transition-smooth"
                  onClick={() => setSelectedLanguage("ru")}
                >
                  🇷🇺 RU
                </Badge>
                <Badge 
                  variant={selectedLanguage === "en" ? "default" : "outline"}
                  className="cursor-pointer transition-smooth"
                  onClick={() => setSelectedLanguage("en")}
                >
                  🇺🇸 EN
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Тип:</span>
                <Badge 
                  variant={selectedType === "all" ? "default" : "outline"}
                  className="cursor-pointer transition-smooth"
                  onClick={() => setSelectedType("all")}
                >
                  Все
                </Badge>
                <Badge 
                  variant={selectedType === "speech" ? "default" : "outline"}
                  className="cursor-pointer transition-smooth"
                  onClick={() => setSelectedType("speech")}
                >
                  Речь
                </Badge>
                <Badge 
                  variant={selectedType === "manual" ? "default" : "outline"}
                  className="cursor-pointer transition-smooth"
                  onClick={() => setSelectedType("manual")}
                >
                  Текст
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Найдено записей: {filteredRecords.length}
              </p>
              <Button variant="outline" size="sm" onClick={exportHistory}>
                <Download className="w-4 h-4 mr-1" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список записей */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Записи не найдены</p>
              <p className="text-muted-foreground">
                {searchTerm ? "Попробуйте изменить поисковый запрос" : "История пуста"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="bg-card border-border hover:shadow-md transition-smooth">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {record.language === "ru" ? "🇷🇺 RU" : "🇺🇸 EN"}
                    </Badge>
                    <Badge variant={record.type === "speech" ? "secondary" : "outline"}>
                      {record.type === "speech" ? "Речь" : "Текст"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(record.text)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-foreground mb-3 leading-relaxed">
                  {truncateText(record.text)}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(record.timestamp)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};