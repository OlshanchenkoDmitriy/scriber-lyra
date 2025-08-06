import os
import shutil

def fix_android_icons():
    """Переименовывает и распределяет иконки из android/new_icons"""
    
    source_base = "android/new_icons"
    target_base = "android/app/src/main/res"
    
    # Маппинг размеров
    size_mapping = {
        "mipmap-mdpi": "mipmap-mdpi",
        "mipmap-hdpi": "mipmap-hdpi", 
        "mipmap-xhdpi": "mipmap-xhdpi",
        "mipmap-xxhdpi": "mipmap-xxhdpi",
        "mipmap-xxxhdpi": "mipmap-xxxhdpi"
    }
    
    print("🚀 Начинаю распределение Android иконок...")
    
    for source_size, target_size in size_mapping.items():
        source_path = os.path.join(source_base, source_size, "lingua_scribe.png")
        target_dir = os.path.join(target_base, target_size)
        
        # Создаем папку назначения
        os.makedirs(target_dir, exist_ok=True)
        
        # Копируем как обычную иконку
        target_path = os.path.join(target_dir, "ic_launcher.png")
        if os.path.exists(source_path):
            shutil.copy2(source_path, target_path)
            print(f"✅ {source_size}/lingua_scribe.png -> {target_size}/ic_launcher.png")
        else:
            print(f"❌ Файл не найден: {source_path}")
        
        # Копируем как круглую иконку
        round_target_path = os.path.join(target_dir, "ic_launcher_round.png")
        if os.path.exists(source_path):
            shutil.copy2(source_path, round_target_path)
            print(f"✅ {source_size}/lingua_scribe.png -> {target_size}/ic_launcher_round.png")
    
    print("\n🎉 Распределение Android иконок завершено!")
    print("\n📋 Следующие шаги:")
    print("1. Пересоберите приложение: npm run build")
    print("2. Синхронизируйте с Android: npx cap sync android")
    print("3. Соберите APK: cd android && .\\gradlew assembleDebug")

if __name__ == "__main__":
    fix_android_icons() 