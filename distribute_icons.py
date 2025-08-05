#!/usr/bin/env python3
"""
Скрипт для автоматического распределения иконок из папки icons
Автоматически находит и копирует иконки в соответствующие папки проекта
"""

import os
import shutil
import glob
from pathlib import Path

def distribute_icons():
    """Распределяет иконки из папки icons по соответствующим папкам"""
    
    icons_folder = "icons"
    
    if not os.path.exists(icons_folder):
        print("❌ Папка 'icons' не найдена!")
        print("📋 Создайте папку 'icons' и поместите туда скачанные иконки")
        return False
    
    # Проверяем наличие файлов в папке icons
    icon_files = glob.glob(f"{icons_folder}/*.png")
    
    if not icon_files:
        print("❌ В папке 'icons' не найдены PNG файлы!")
        print("📋 Поместите скачанные иконки в папку 'icons'")
        return False
    
    print(f"🎨 Найдено {len(icon_files)} иконок в папке 'icons'")
    
    # Маппинг иконок на целевые папки
    icon_mappings = {
        # Android иконки
        "icon-mipmap-mdpi-48x48.png": "android/app/src/main/res/mipmap-mdpi/ic_launcher.png",
        "icon-mipmap-hdpi-72x72.png": "android/app/src/main/res/mipmap-hdpi/ic_launcher.png", 
        "icon-mipmap-xhdpi-96x96.png": "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png",
        "icon-mipmap-xxhdpi-144x144.png": "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png",
        "icon-mipmap-xxxhdpi-192x192.png": "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
        
        # Веб иконки
        "icon-Favicon-32x32.png": "public/favicon.ico",
        "icon-Web Icon-192x192.png": "public/icon-192.png",
        
        # Play Store иконка (сохраняем в корень для будущего использования)
        "icon-Play Store-512x512.png": "play-store-icon.png"
    }
    
    print("\n🔄 Распределение иконок...")
    
    distributed_count = 0
    not_found = []
    
    for icon_name, target_path in icon_mappings.items():
        source_path = os.path.join(icons_folder, icon_name)
        
        if os.path.exists(source_path):
            try:
                # Создаем папку если её нет
                target_dir = os.path.dirname(target_path)
                if target_dir:
                    os.makedirs(target_dir, exist_ok=True)
                
                # Копируем иконку
                shutil.copy2(source_path, target_path)
                print(f"✅ {icon_name} → {target_path}")
                distributed_count += 1
                
            except Exception as e:
                print(f"❌ Ошибка при копировании {icon_name}: {e}")
        else:
            not_found.append(icon_name)
    
    # Выводим статистику
    print(f"\n📊 Статистика:")
    print(f"✅ Распределено: {distributed_count} иконок")
    print(f"⚠️  Не найдено: {len(not_found)} иконок")
    
    if not_found:
        print(f"\n📋 Не найденные иконки:")
        for icon in not_found:
            print(f"   - {icon}")
    
    # Проверяем Android проект
    if os.path.exists("android"):
        print(f"\n📱 Android проект найден!")
        print(f"🎯 Иконки Android готовы к использованию")
    else:
        print(f"\n⚠️  Android проект не найден")
        print(f"📋 Выполните: npx cap add android")
    
    return distributed_count > 0

def create_web_manifest():
    """Создает или обновляет web app manifest с новыми иконками"""
    
    manifest_path = "public/manifest.json"
    
    manifest_content = {
        "name": "LinguaScribe",
        "short_name": "LinguaScribe", 
        "description": "Универсальный редактор текстов и песен",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#1a1a1a",
        "theme_color": "#4a9eff",
        "icons": [
            {
                "src": "/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            }
        ]
    }
    
    try:
        import json
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest_content, f, indent=2, ensure_ascii=False)
        print(f"✅ Web App Manifest обновлен: {manifest_path}")
    except Exception as e:
        print(f"❌ Ошибка при создании manifest: {e}")

def update_index_html():
    """Обновляет index.html для подключения иконок"""
    
    index_path = "index.html"
    
    if not os.path.exists(index_path):
        print(f"⚠️  index.html не найден")
        return
    
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем наличие ссылок на иконки
        icon_links = [
            '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
            '<link rel="apple-touch-icon" href="/icon-192.png">',
            '<link rel="manifest" href="/manifest.json">'
        ]
        
        updated = False
        for link in icon_links:
            if link not in content:
                # Добавляем в head
                if '<head>' in content and '</head>' in content:
                    head_start = content.find('<head>') + 6
                    content = content[:head_start] + '\n    ' + link + content[head_start:]
                    updated = True
        
        if updated:
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ index.html обновлен с иконками")
        else:
            print(f"✅ index.html уже содержит ссылки на иконки")
            
    except Exception as e:
        print(f"❌ Ошибка при обновлении index.html: {e}")

def main():
    """Основная функция"""
    
    print("🎨 LinguaScribe - Автоматическое распределение иконок")
    print("=" * 60)
    
    # Распределяем иконки
    success = distribute_icons()
    
    if success:
        # Обновляем веб-часть
        create_web_manifest()
        update_index_html()
        
        print(f"\n🚀 Следующие шаги:")
        print(f"1. Соберите проект: npm run build")
        print(f"2. Синхронизируйте Android: npx cap sync android") 
        print(f"3. Откройте в Android Studio: npx cap open android")
        print(f"4. Проверьте иконки в браузере: npm run dev")
        
        print(f"\n🎯 Иконки готовы к использованию!")
        print(f"📱 Android: иконки в папках mipmap-*")
        print(f"🌐 Web: favicon.ico и icon-192.png")
        print(f"📦 Play Store: play-store-icon.png")
    else:
        print(f"\n❌ Не удалось распределить иконки")
        print(f"📋 Убедитесь, что иконки находятся в папке 'icons'")

if __name__ == "__main__":
    main() 