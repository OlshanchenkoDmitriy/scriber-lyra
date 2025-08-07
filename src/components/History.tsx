import { useState, useEffect } from "react";
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
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { historyAPI, type HistoryRecord } from "@/lib/storage";

export const History = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"all" | "ru" | "en">(
    "all"
  );
  const [selectedType, setSelectedType] = useState<"all" | "manual">(
    "all"
  );
  const { toast } = useToast();

  // Загружаем историю при монтировании компонента
  useEffect(() => {
    const loadHistory = () => {
      const allRecords = historyAPI.getAll();
      setRecords(allRecords);
    };
    loadHistory();
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" || record.language === selectedLanguage;
    const matchesType = selectedType === "all" || record.type === selectedType;

    return matchesSearch && matchesLanguage && matchesType;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Текст скопирован в буфер обмена",
    });
  };

  const deleteRecord = (id: string) => {
    if (historyAPI.delete(id)) {
      setRecords(records.filter((record) => record.id !== id));
      toast({ title: "Удалено", description: "Запись удалена из истории" });
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "linguascribe-history.json";
    link.click();

    URL.revokeObjectURL(url);
    toast({ title: "Экспорт", description: "История экспортирована в файл" });
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

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
                {searchTerm
                  ? "Попробуйте изменить поисковый запрос"
                  : "История пуста"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-card border-border hover:shadow-md transition-smooth"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {record.language === "ru" ? "🇷🇺 RU" : "🇺🇸 EN"}
                    </Badge>
                    <Badge variant="outline">Текст</Badge>
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
