import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  settingsAPI,
  exportAllData,
  importData,
  type AppSettings,
} from "@/lib/storage";

export const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    fontSize: 14,
    theme: "auto",
    autoSave: true,
    maxHistoryItems: 1000,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = settingsAPI.get();
      setSettings(savedSettings);
    };
    loadSettings();
  }, []);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    settingsAPI.update({ [key]: value });

    // Применяем изменения
    if (key === "fontSize") {
      document.documentElement.style.setProperty(
        "--font-size-base",
        `${value}px`
      );
    }
    if (key === "theme") {
      applyTheme(value);
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (
      theme === "dark" ||
      (theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const exportData = () => {
    const data = exportAllData();
    const dataBlob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `linguascribe-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast({ title: "Экспорт", description: "Все данные экспортированы" });
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = importData(e.target?.result as string);
        if (success) {
          // Перезагружаем настройки
          const savedSettings = settingsAPI.get();
          setSettings(savedSettings);
          toast({
            title: "Импорт",
            description: "Данные успешно импортированы",
          });
          // Перезагружаем страницу для применения изменений
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast({ title: "Ошибка", description: "Неверный формат файла" });
        }
      } catch (error) {
        toast({ title: "Ошибка", description: "Ошибка при импорте данных" });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (
      confirm(
        "Вы уверены, что хотите удалить все данные? Это действие нельзя отменить."
      )
    ) {
      localStorage.clear();
      toast({ title: "Очищено", description: "Все данные удалены" });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Основные настройки */}
      <Card className="bg-gradient-secondary border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <span>Настройки приложения</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Размер шрифта */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Размер шрифта: {settings.fontSize}px</span>
            </Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(value) => updateSetting("fontSize", value[0])}
              max={24}
              min={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Тема */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Тема оформления</span>
            </Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => updateSetting("theme", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4" />
                    <span>Светлая</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4" />
                    <span>Темная</span>
                  </div>
                </SelectItem>
                <SelectItem value="auto">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4" />
                    <span>Авто</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Автосохранение */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Автосохранение</span>
            </Label>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting("autoSave", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Управление данными */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Управление данными</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={exportData}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт всех данных</span>
            </Button>

            <label className="cursor-pointer">
              <Button
                variant="outline"
                asChild
                className="flex items-center space-x-2 w-full"
              >
                <span>
                  <Upload className="w-4 h-4" />
                  <span>Импорт данных</span>
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
            </label>

            <Button
              variant="destructive"
              onClick={clearAllData}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Очистить все данные</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Информация о приложении */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">О приложении</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Text Wizard</strong> - персональное приложение для работы с
            текстом
          </p>
          <p>Версия: 1.1.0</p>
          <p>Все данные хранятся локально на вашем устройстве</p>
          <p>Работает полностью офлайн</p>
        </CardContent>
      </Card>
    </div>
  );
};
