import os
import shutil

# Пути к иконкам
icon_paths = {
    'ic_launcher-mdpi.png': 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
    'ic_launcher-hdpi.png': 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
    'ic_launcher-xhdpi.png': 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
    'ic_launcher-xxhdpi.png': 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
    'ic_launcher-xxxhdpi.png': 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
}

# Копируем иконки
for source, destination in icon_paths.items():
    if os.path.exists(source):
        # Создаем папку если её нет
        os.makedirs(os.path.dirname(destination), exist_ok=True)
        shutil.copy2(source, destination)
        print(f"Скопировано: {source} -> {destination}")
    else:
        print(f"Файл не найден: {source}")

# Также копируем для круглых иконок
for source, destination in icon_paths.items():
    if os.path.exists(source):
        round_destination = destination.replace('ic_launcher.png', 'ic_launcher_round.png')
        shutil.copy2(source, round_destination)
        print(f"Скопировано: {source} -> {round_destination}")

print("Копирование иконок завершено!") 