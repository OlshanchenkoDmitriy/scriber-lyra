import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  Play,
  Download,
  Save,
  Copy,
  Mic,
  Eye,
  Code,
  CheckCircle,
  AlertCircle,
  Palette,
  Settings,
  FileText,
  Volume2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SunoTag {
  type: "section" | "style" | "effect" | "vocal" | "texture" | "pitch" | "timing" | "dynamics" | "progression" | "element" | "atmosphere" | "instrument" | "quality" | "genre" | "environment";
  name: string;
  description: string;
}

const sunoTags: SunoTag[] = [
  // Song Structure
  { type: 'section', name: '[Intro]', description: 'Вступление' },
  { type: 'section', name: '[Verse]', description: 'Куплет' },
  { type: 'section', name: '[Pre-Chorus]', description: 'Предприпев' },
  { type: 'section', name: '[Chorus]', description: 'Припев' },
  { type: 'section', name: '[Post-Chorus]', description: 'Послеприпев' },
  { type: 'section', name: '[Bridge]', description: 'Переход' },
  { type: 'section', name: '[Drop]', description: 'Дроп' },
  { type: 'section', name: '[Hook]', description: 'Хук' },
  { type: 'section', name: '[Break]', description: 'Брейк' },
  { type: 'section', name: '[Interlude]', description: 'Интерлюдия' },
  { type: 'section', name: '[Outro]', description: 'Концовка' },
  { type: 'section', name: '[Fade In]', description: 'Плавное появление' },
  { type: 'section', name: '[Fade Out]', description: 'Плавное затухание' },
  
  // Vocals
  { type: 'vocal', name: '[Male Vocal]', description: 'Мужской вокал' },
  { type: 'vocal', name: '[Female Vocal]', description: 'Женский вокал' },
  { type: 'vocal', name: '[Spoken Word]', description: 'Разговорная речь' },
  { type: 'vocal', name: '[Harmonies]', description: 'Гармонии' },
  { type: 'vocal', name: '[Whisper]', description: 'Шепот' },
  
  // Vocal Texture
  { type: 'texture', name: '[Airy]', description: 'Воздушный' },
  { type: 'texture', name: '[Breathy]', description: 'Дыхательный' },
  { type: 'texture', name: '[Bright]', description: 'Яркий' },
  { type: 'texture', name: '[Crisp]', description: 'Четкий' },
  { type: 'texture', name: '[Clear]', description: 'Чистый' },
  { type: 'texture', name: '[Deep]', description: 'Глубокий' },
  { type: 'texture', name: '[Dense]', description: 'Плотный' },
  { type: 'texture', name: '[Dry]', description: 'Сухой' },
  { type: 'texture', name: '[Gritty]', description: 'Хриплый' },
  { type: 'texture', name: '[Gravelly]', description: 'Грубый' },
  { type: 'texture', name: '[Raw]', description: 'Сырой' },
  { type: 'texture', name: '[Smooth]', description: 'Плавный' },
  { type: 'texture', name: '[Soft]', description: 'Мягкий' },
  { type: 'texture', name: '[Sharp]', description: 'Резкий' },
  { type: 'texture', name: '[Velvety]', description: 'Бархатистый' },
  { type: 'texture', name: '[Warm]', description: 'Теплый' },
  { type: 'texture', name: '[Raspy]', description: 'Хриплый' },
  { type: 'texture', name: '[Thin]', description: 'Тонкий' },
  { type: 'texture', name: '[Saturated]', description: 'Насыщенный' },
  { type: 'texture', name: '[Smoky]', description: 'Дымчатый' },
  { type: 'texture', name: '[Dreamy]', description: 'Мечтательный' },
  { type: 'texture', name: '[Resonant]', description: 'Резонансный' },
  { type: 'texture', name: '[Nasal]', description: 'Носовой' },
  { type: 'texture', name: '[Brassy]', description: 'Медный' },
  { type: 'texture', name: '[Metallic]', description: 'Металлический' },
  { type: 'texture', name: '[Chilled]', description: 'Охлажденный' },
  { type: 'texture', name: '[Rough-Edged]', description: 'Грубый край' },
  { type: 'texture', name: '[Shimmery]', description: 'Мерцающий' },
  { type: 'texture', name: '[Glassy]', description: 'Стеклянный' },
  { type: 'texture', name: '[Crunchy]', description: 'Хрустящий' },
  { type: 'texture', name: '[Liquid-Like]', description: 'Жидкообразный' },
  { type: 'texture', name: '[Breathy Exhale]', description: 'Дыхательный выдох' },
  
  // Vocal Style
  { type: 'style', name: '[Staccato]', description: 'Стаккато' },
  { type: 'style', name: '[Legato]', description: 'Легато' },
  { type: 'style', name: '[Vibrato-Heavy]', description: 'Сильная вибрация' },
  { type: 'style', name: '[Monotone]', description: 'Монотонный' },
  { type: 'style', name: '[Melismatic]', description: 'Мелизматический' },
  { type: 'style', name: '[Syncopated]', description: 'Синкопированный' },
  { type: 'style', name: '[Operatic]', description: 'Оперный' },
  { type: 'style', name: '[Chanting]', description: 'Напевный' },
  { type: 'style', name: '[Spoken-Word]', description: 'Разговорное слово' },
  { type: 'style', name: '[Growling]', description: 'Рычащий' },
  { type: 'style', name: '[Belting]', description: 'Белтинг' },
  { type: 'style', name: '[Yodeling]', description: 'Йодлинг' },
  { type: 'style', name: '[Humming]', description: 'Гудение' },
  { type: 'style', name: '[Rapping]', description: 'Рэп' },
  { type: 'style', name: '[Scatting]', description: 'Скат' },
  { type: 'style', name: '[Falsetto Runs]', description: 'Фальцетные пассажи' },
  { type: 'style', name: '[Yelping]', description: 'Визг' },
  { type: 'style', name: '[Grunting]', description: 'Ворчание' },
  { type: 'style', name: '[Call-and-Response]', description: 'Вопрос-ответ' },
  
  // Vocal Pitch & Range
  { type: 'pitch', name: '[Low-Pitched]', description: 'Низкий тон' },
  { type: 'pitch', name: '[Mid-Range]', description: 'Средний диапазон' },
  { type: 'pitch', name: '[High-Pitched]', description: 'Высокий тон' },
  { type: 'pitch', name: '[Sub-Bass Vocals]', description: 'Суббасовый вокал' },
  { type: 'pitch', name: '[Falsetto]', description: 'Фальцет' },
  { type: 'pitch', name: '[Baritone]', description: 'Баритон' },
  { type: 'pitch', name: '[Soprano]', description: 'Сопрано' },
  { type: 'pitch', name: '[Tenor]', description: 'Тенор' },
  { type: 'pitch', name: '[Contralto]', description: 'Контральто' },
  { type: 'pitch', name: '[Whispered Falsetto]', description: 'Шепчущий фальцет' },
  { type: 'pitch', name: '[Harmonized Layers]', description: 'Гармонизированные слои' },
  { type: 'pitch', name: '[Dissonant Harmonies]', description: 'Диссонантные гармонии' },
  { type: 'pitch', name: '[Octave Shift Up]', description: 'Сдвиг октавы вверх' },
  { type: 'pitch', name: '[Octave Shift Down]', description: 'Сдвиг октавы вниз' },
  { type: 'pitch', name: '[Pitch-Bent]', description: 'Изогнутый тон' },
  { type: 'pitch', name: '[Modulated Pitch]', description: 'Модулированный тон' },
  { type: 'pitch', name: '[Subtle Detune]', description: 'Тонкая расстройка' },
  { type: 'pitch', name: '[Formant-Shifted]', description: 'Сдвиг формант' },
  
  // Vocal Effects
  { type: 'effect', name: '[Auto-Tuned]', description: 'Автотюн' },
  { type: 'effect', name: '[Distorted]', description: 'Дисторшн' },
  { type: 'effect', name: '[Reverbed]', description: 'Реверберация' },
  { type: 'effect', name: '[Echoed]', description: 'Эхо' },
  { type: 'effect', name: '[Layered]', description: 'Слоистый' },
  { type: 'effect', name: '[Chopped]', description: 'Нарезанный' },
  { type: 'effect', name: '[Pitch-Shifted Up]', description: 'Сдвиг тона вверх' },
  { type: 'effect', name: '[Pitch-Shifted Down]', description: 'Сдвиг тона вниз' },
  { type: 'effect', name: '[Filtered]', description: 'Фильтрованный' },
  { type: 'effect', name: '[Vocoder]', description: 'Вокодер' },
  { type: 'effect', name: '[Robotized]', description: 'Роботизированный' },
  { type: 'effect', name: '[Phased]', description: 'Фейзер' },
  { type: 'effect', name: '[Flanged]', description: 'Фленджер' },
  { type: 'effect', name: '[Time-Stretched]', description: 'Растянутый по времени' },
  { type: 'effect', name: '[Lo-Fi]', description: 'Лоу-фай' },
  { type: 'effect', name: '[Bit-Crushed]', description: 'Бит-краш' },
  { type: 'effect', name: '[Glitched]', description: 'Глитч' },
  { type: 'effect', name: '[Stuttered]', description: 'Заикание' },
  { type: 'effect', name: '[Modulated]', description: 'Модулированный' },
  { type: 'effect', name: '[Panned Left]', description: 'Панорама влево' },
  { type: 'effect', name: '[Panned Right]', description: 'Панорама вправо' },
  { type: 'effect', name: '[Granular]', description: 'Гранулярный' },
  { type: 'effect', name: '[Doubled]', description: 'Удвоенный' },
  { type: 'effect', name: '[Auto-Harmonized]', description: 'Автогармонизация' },
  { type: 'effect', name: '[Saturated]', description: 'Насыщенный' },
  { type: 'effect', name: '[Ring-Modulated]', description: 'Кольцевая модуляция' },
  { type: 'effect', name: '[Detuned]', description: 'Расстроенный' },
  { type: 'effect', name: '[Reverse]', description: 'Реверс' },
  
  // Vocal Timing & Rhythm
  { type: 'timing', name: '[Off-Beat]', description: 'Не в такт' },
  { type: 'timing', name: '[On-Beat]', description: 'В такт' },
  { type: 'timing', name: '[Syncopated]', description: 'Синкопированный' },
  { type: 'timing', name: '[Fast-Paced]', description: 'Быстрый темп' },
  { type: 'timing', name: '[Laid-Back]', description: 'Расслабленный' },
  { type: 'timing', name: '[Polyrhythmic]', description: 'Полиритмичный' },
  { type: 'timing', name: '[Triplets]', description: 'Триоли' },
  { type: 'timing', name: '[Slow-Drawled]', description: 'Медленно протянутый' },
  { type: 'timing', name: '[Quick Stabs]', description: 'Быстрые удары' },
  { type: 'timing', name: '[Rolling]', description: 'Катящийся' },
  { type: 'timing', name: '[Freeform]', description: 'Свободная форма' },
  { type: 'timing', name: '[Rapid-Fire]', description: 'Быстрая стрельба' },
  { type: 'timing', name: '[Loose Phrasing]', description: 'Свободная фразировка' },
  { type: 'timing', name: '[Tight Rhythm]', description: 'Плотный ритм' },
  
  // Dynamics & Volume
  { type: 'dynamics', name: '[Soft-Spoken]', description: 'Тихо сказанный' },
  { type: 'dynamics', name: '[Shouted]', description: 'Крик' },
  { type: 'dynamics', name: '[Building Intensity]', description: 'Нарастание интенсивности' },
  { type: 'dynamics', name: '[Explosive]', description: 'Взрывной' },
  { type: 'dynamics', name: '[Subtle]', description: 'Тонкий' },
  { type: 'dynamics', name: '[Crescendo]', description: 'Крещендо' },
  { type: 'dynamics', name: '[Decrescendo]', description: 'Декрещендо' },
  { type: 'dynamics', name: '[Intense Climax]', description: 'Интенсивная кульминация' },
  { type: 'dynamics', name: '[Dynamic Shifts]', description: 'Динамические сдвиги' },
  { type: 'dynamics', name: '[Fading Vocals]', description: 'Затухающий вокал' },
  { type: 'dynamics', name: '[Reverb Swell]', description: 'Вздутие реверберации' },
  { type: 'dynamics', name: '[Breathy Build-Up]', description: 'Дыхательное нарастание' },
  { type: 'dynamics', name: '[Whispered Vocals]', description: 'Шепчущий вокал' },
  { type: 'dynamics', name: '[Silent Break]', description: 'Тихий брейк' },
  { type: 'dynamics', name: '[Sudden Stop]', description: 'Внезапная остановка' },
  
  // Dynamic Progression
  { type: 'progression', name: '[Climactic]', description: 'Кульминационный' },
  { type: 'progression', name: '[Emotional Swell]', description: 'Эмоциональный подъем' },
  { type: 'progression', name: '[Orchestral Build]', description: 'Оркестровое нарастание' },
  { type: 'progression', name: '[Layered Arrangement]', description: 'Слоистая аранжировка' },
  { type: 'progression', name: '[Stripped Back]', description: 'Упрощенный' },
  { type: 'progression', name: '[Drop]', description: 'Дроп' },
  
  // Specific Elements
  { type: 'element', name: '[Catchy Hook]', description: 'Запоминающийся хук' },
  { type: 'element', name: '[Emotional Bridge]', description: 'Эмоциональный мост' },
  { type: 'element', name: '[Powerful Outro]', description: 'Мощная концовка' },
  { type: 'element', name: '[Soft Intro]', description: 'Мягкое вступление' },
  { type: 'element', name: '[Melodic Interlude]', description: 'Мелодичная интерлюдия' },
  { type: 'element', name: '[Percussion Break]', description: 'Ударный брейк' },
  
  // Atmosphere and Mood
  { type: 'atmosphere', name: '[Eerie Whispers]', description: 'Жуткие шепоты' },
  { type: 'atmosphere', name: '[Ghostly Echoes]', description: 'Призрачные эхо' },
  { type: 'atmosphere', name: '[Ominous Drone]', description: 'Зловещий гул' },
  { type: 'atmosphere', name: '[Spectral Melody]', description: 'Спектральная мелодия' },
  { type: 'atmosphere', name: '[Melancholic Atmosphere]', description: 'Меланхоличная атмосфера' },
  { type: 'atmosphere', name: '[Euphoric Build]', description: 'Эйфорическое нарастание' },
  { type: 'atmosphere', name: '[Tense Underscore]', description: 'Напряженный фон' },
  { type: 'atmosphere', name: '[Serene Ambience]', description: 'Спокойная атмосфера' },
  { type: 'atmosphere', name: '[Nostalgic Tones]', description: 'Ностальгические тона' },
  { type: 'atmosphere', name: '[Sultry]', description: 'Чувственный' },
  { type: 'atmosphere', name: '[Ethereal]', description: 'Эфирный' },
  { type: 'atmosphere', name: '[Melancholic]', description: 'Меланхоличный' },
  { type: 'atmosphere', name: '[Playful]', description: 'Игривый' },
  { type: 'atmosphere', name: '[Aggressive]', description: 'Агрессивный' },
  { type: 'atmosphere', name: '[Haunting]', description: 'Преследующий' },
  { type: 'atmosphere', name: '[Euphoric]', description: 'Эйфорический' },
  { type: 'atmosphere', name: '[Mysterious]', description: 'Таинственный' },
  { type: 'atmosphere', name: '[Hypnotic]', description: 'Гипнотический' },
  { type: 'atmosphere', name: '[Dreamy]', description: 'Мечтательный' },
  { type: 'atmosphere', name: '[Confident]', description: 'Уверенный' },
  { type: 'atmosphere', name: '[Desperate]', description: 'Отчаянный' },
  { type: 'atmosphere', name: '[Tranquil]', description: 'Спокойный' },
  { type: 'atmosphere', name: '[Emotive]', description: 'Эмоциональный' },
  { type: 'atmosphere', name: '[Longing]', description: 'Тоскующий' },
  { type: 'atmosphere', name: '[Angsty]', description: 'Тревожный' },
  { type: 'atmosphere', name: '[Triumphant]', description: 'Торжествующий' },
  { type: 'atmosphere', name: '[Introspective]', description: 'Самоанализирующий' },
  { type: 'atmosphere', name: '[Detached]', description: 'Отстраненный' },
  
  // Instrumentation
  { type: 'instrument', name: '[Piano]', description: 'Пианино' },
  { type: 'instrument', name: '[Soft Piano Layer]', description: 'Мягкий слой пианино' },
  { type: 'instrument', name: '[Acoustic Guitar]', description: 'Акустическая гитара' },
  { type: 'instrument', name: '[Electric Guitar]', description: 'Электрогитара' },
  { type: 'instrument', name: '[Distorted Guitar]', description: 'Дисторшн гитара' },
  { type: 'instrument', name: '[808]', description: '808 бас' },
  { type: 'instrument', name: '[Drums]', description: 'Барабаны' },
  { type: 'instrument', name: '[Punchy Drums]', description: 'Ударные барабаны' },
  { type: 'instrument', name: '[Crisp Percussion]', description: 'Четкая перкуссия' },
  { type: 'instrument', name: '[Bass Guitar]', description: 'Бас-гитара' },
  { type: 'instrument', name: '[Deep Controlled Bass]', description: 'Глубокий контролируемый бас' },
  { type: 'instrument', name: '[Synth]', description: 'Синтезатор' },
  { type: 'instrument', name: '[Sparkling Synths]', description: 'Искрящиеся синтезаторы' },
  { type: 'instrument', name: '[Smooth Pads]', description: 'Гладкие подушки' },
  { type: 'instrument', name: '[Pads]', description: 'Подушки' },
  { type: 'instrument', name: '[Strings]', description: 'Струнные' },
  { type: 'instrument', name: '[Cello]', description: 'Виолончель' },
  { type: 'instrument', name: '[Orchestral Strings]', description: 'Оркестровые струнные' },
  { type: 'instrument', name: '[Bells]', description: 'Колокольчики' },
  { type: 'instrument', name: '[FX Layer]', description: 'Слой эффектов' },
  
  // Sound Quality
  { type: 'quality', name: '[Rich Bass]', description: 'Богатый бас' },
  { type: 'quality', name: '[Bright Highs]', description: 'Яркие верха' },
  { type: 'quality', name: '[Warm Vibrato]', description: 'Теплая вибрация' },
  { type: 'quality', name: '[Soft Reverb]', description: 'Мягкая реверберация' },
  { type: 'quality', name: '[Reverb Heavy]', description: 'Сильная реверберация' },
  { type: 'quality', name: '[Atmospheric Echo]', description: 'Атмосферное эхо' },
  { type: 'quality', name: '[Clean Mix]', description: 'Чистый микс' },
  { type: 'quality', name: '[Deep Tone]', description: 'Глубокий тон' },
  { type: 'quality', name: '[Dynamic Range]', description: 'Динамический диапазон' },
  { type: 'quality', name: '[Wide Stereo Spread]', description: 'Широкая стерео база' },
  { type: 'quality', name: '[Emotional Vocal]', description: 'Эмоциональный вокал' },
  { type: 'quality', name: '[Detailed Articulation]', description: 'Детальная артикуляция' },
  { type: 'quality', name: '[Analog Warmth]', description: 'Аналоговое тепло' },
  { type: 'quality', name: '[Transparent Vocals]', description: 'Прозрачный вокал' },
  { type: 'quality', name: '[Vintage Tape Effect]', description: 'Винтажный эффект ленты' },
  { type: 'quality', name: '[Low Noise Floor]', description: 'Низкий уровень шума' },
  { type: 'quality', name: '[Balanced Mastering]', description: 'Сбалансированный мастеринг' },
  { type: 'quality', name: '[Shimmering Cymbals]', description: 'Мерцающие тарелки' },
  { type: 'quality', name: '[Subtle Compression]', description: 'Тонкая компрессия' },
  { type: 'quality', name: '[Stereo Wide]', description: 'Широкая стерео' },
  { type: 'quality', name: '[Gritty Texture]', description: 'Грубая текстура' },
  { type: 'quality', name: '[Dynamic and Clean Mix]', description: 'Динамичный и чистый микс' },
  
  // Genres and Styles (основные)
  { type: 'genre', name: '[Pop]', description: 'Поп' },
  { type: 'genre', name: '[Rock]', description: 'Рок' },
  { type: 'genre', name: '[Hip-Hop]', description: 'Хип-хоп' },
  { type: 'genre', name: '[Trap]', description: 'Трэп' },
  { type: 'genre', name: '[R&B]', description: 'R&B' },
  { type: 'genre', name: '[Soul]', description: 'Соул' },
  { type: 'genre', name: '[EDM]', description: 'EDM' },
  { type: 'genre', name: '[House]', description: 'Хаус' },
  { type: 'genre', name: '[Drum & Bass]', description: 'Драм-н-бейс' },
  { type: 'genre', name: '[Jazz]', description: 'Джаз' },
  { type: 'genre', name: '[Indie]', description: 'Инди' },
  { type: 'genre', name: '[Ambient]', description: 'Эмбиент' },
  { type: 'genre', name: '[Cinematic]', description: 'Кинематографичный' },
  { type: 'genre', name: '[Orchestral]', description: 'Оркестровый' },
  { type: 'genre', name: '[Funk]', description: 'Фанк' },
  { type: 'genre', name: '[Reggae]', description: 'Регги' },
  { type: 'genre', name: '[Experimental]', description: 'Экспериментальный' },
  { type: 'genre', name: '[Lo-Fi]', description: 'Лоу-фай' },
  { type: 'genre', name: '[Synthwave]', description: 'Синтвейв' },
  { type: 'genre', name: '[Atmospheric]', description: 'Атмосферный' },
  { type: 'genre', name: '[Dark]', description: 'Темный' },
  { type: 'genre', name: '[Acoustic]', description: 'Акустический' },
  { type: 'genre', name: '[Avant-garde]', description: 'Авангард' },
  { type: 'genre', name: '[Electroacoustic]', description: 'Электроакустический' },
  { type: 'genre', name: '[Industrial]', description: 'Индастриал' },
  { type: 'genre', name: '[Noise]', description: 'Нойз' },
  { type: 'genre', name: '[Progressive]', description: 'Прогрессивный' },
  { type: 'genre', name: '[Psychedelic]', description: 'Психоделический' },
  { type: 'genre', name: '[Chicago Blues]', description: 'Чикаго блюз' },
  { type: 'genre', name: '[Delta Blues]', description: 'Дельта блюз' },
  { type: 'genre', name: '[Electric Blues]', description: 'Электрический блюз' },
  { type: 'genre', name: '[Gospel Blues]', description: 'Госпел блюз' },
  { type: 'genre', name: '[Rhythm and Blues]', description: 'Ритм-н-блюз' },
  { type: 'genre', name: '[Bluegrass]', description: 'Блюграсс' },
  { type: 'genre', name: '[Country Blues]', description: 'Кантри блюз' },
  { type: 'genre', name: '[Country Pop]', description: 'Кантри поп' },
  { type: 'genre', name: '[Country Rock]', description: 'Кантри рок' },
  { type: 'genre', name: '[Nashville Sound]', description: 'Нашвилл саунд' },
  { type: 'genre', name: '[Adult Contemporary]', description: 'Взрослый современный' },
  { type: 'genre', name: '[Elevator Music]', description: 'Лифтовая музыка' },
  { type: 'genre', name: '[Lounge]', description: 'Лаунж' },
  { type: 'genre', name: '[Soft Rock]', description: 'Софт рок' },
  { type: 'genre', name: '[Breakbeat]', description: 'Брейкбит' },
  { type: 'genre', name: '[Dub]', description: 'Даб' },
  { type: 'genre', name: '[Electro]', description: 'Электро' },
  { type: 'genre', name: '[Techno]', description: 'Техно' },
  { type: 'genre', name: '[Trance]', description: 'Транс' },
  { type: 'genre', name: '[Americana]', description: 'Американа' },
  { type: 'genre', name: '[Celtic]', description: 'Кельтский' },
  { type: 'genre', name: '[Folk Rock]', description: 'Фолк рок' },
  { type: 'genre', name: '[Indie Folk]', description: 'Инди фолк' },
  { type: 'genre', name: '[Singer-Songwriter]', description: 'Автор-исполнитель' },
  { type: 'genre', name: '[Alternative Hip-Hop]', description: 'Альтернативный хип-хоп' },
  { type: 'genre', name: '[Gangsta Rap]', description: 'Гангста рэп' },
  { type: 'genre', name: '[UK Drill]', description: 'UK дрилл' },
  { type: 'genre', name: '[Bebop]', description: 'Бибоп' },
  { type: 'genre', name: '[Big Band]', description: 'Биг бэнд' },
  { type: 'genre', name: '[Cool Jazz]', description: 'Кул джаз' },
  { type: 'genre', name: '[Jazz Fusion]', description: 'Джаз фьюжн' },
  { type: 'genre', name: '[Smooth Jazz]', description: 'Смуз джаз' },
  { type: 'genre', name: '[Dance-Pop]', description: 'Данс поп' },
  { type: 'genre', name: '[Electropop]', description: 'Электропоп' },
  { type: 'genre', name: '[Indie Pop]', description: 'Инди поп' },
  { type: 'genre', name: '[K-Pop]', description: 'K-поп' },
  { type: 'genre', name: '[Synth-Pop]', description: 'Синт поп' },
  { type: 'genre', name: '[Contemporary R&B]', description: 'Современный R&B' },
  { type: 'genre', name: '[Neo Soul]', description: 'Нео соул' },
  { type: 'genre', name: '[Quiet Storm]', description: 'Тихая буря' },
  { type: 'genre', name: '[Alternative Rock]', description: 'Альтернативный рок' },
  { type: 'genre', name: '[Classic Rock]', description: 'Классический рок' },
  { type: 'genre', name: '[Hard Rock]', description: 'Хард рок' },
  { type: 'genre', name: '[Indie Rock]', description: 'Инди рок' },
  { type: 'genre', name: '[Black Metal]', description: 'Блэк метал' },
  { type: 'genre', name: '[Death Metal]', description: 'Дэт метал' },
  { type: 'genre', name: '[Heavy Metal]', description: 'Хэви метал' },
  { type: 'genre', name: '[Industrial Metal]', description: 'Индастриал метал' },
  { type: 'genre', name: '[Power Metal]', description: 'Пауэр метал' },
  { type: 'genre', name: '[Anarcho Punk]', description: 'Анархо панк' },
  { type: 'genre', name: '[Hardcore Punk]', description: 'Хардкор панк' },
  { type: 'genre', name: '[Pop Punk]', description: 'Поп панк' },
  { type: 'genre', name: '[Skate Punk]', description: 'Скейт панк' },
  { type: 'genre', name: '[Samba]', description: 'Самба' },
  { type: 'genre', name: '[Bossa Nova]', description: 'Босса нова' },
  { type: 'genre', name: '[Dancehall]', description: 'Дансхолл' },
  { type: 'genre', name: '[Afrobeat]', description: 'Афробит' },
  { type: 'genre', name: '[Highlife]', description: 'Хайлайф' },
  { type: 'genre', name: '[J-Pop]', description: 'J-поп' },
  { type: 'genre', name: '[Alternative Metal]', description: 'Альтернативный метал' },
  { type: 'genre', name: '[Alternative Pop]', description: 'Альтернативный поп' },
  { type: 'genre', name: '[Atlanta Rap]', description: 'Атланта рэп' },
  { type: 'genre', name: '[Ballad]', description: 'Баллада' },
  { type: 'genre', name: '[Baroque]', description: 'Барокко' },
  { type: 'genre', name: '[Boom Bap]', description: 'Бум бап' },
  { type: 'genre', name: '[Chill]', description: 'Чилл' },
  { type: 'genre', name: '[Christian]', description: 'Христианский' },
  { type: 'genre', name: '[Christmas]', description: 'Рождественский' },
  { type: 'genre', name: '[Girl Group]', description: 'Гёрл групп' },
  { type: 'genre', name: '[Hardcore Rap]', description: 'Хардкор рэп' },
  { type: 'genre', name: '[Post-Hardcore]', description: 'Пост-хардкор' },
  { type: 'genre', name: '[Pop-Rock]', description: 'Поп-рок' },
  { type: 'genre', name: '[Romantic]', description: 'Романтический' },
  { type: 'genre', name: '[Synth]', description: 'Синт' },
  
  // Environment and Sound Effects
  { type: 'environment', name: '[Applause]', description: 'Аплодисменты' },
  { type: 'environment', name: '[Audience Laughing]', description: 'Смех аудитории' },
  { type: 'environment', name: '[Announcer]', description: 'Диктор' },
  { type: 'environment', name: '[Female Narrator]', description: 'Женский рассказчик' },
  { type: 'environment', name: '[Man]', description: 'Мужчина' },
  { type: 'environment', name: '[Woman]', description: 'Женщина' },
  { type: 'environment', name: '[Boy]', description: 'Мальчик' },
  { type: 'environment', name: '[Girl]', description: 'Девочка' },
  { type: 'environment', name: '[Reporter]', description: 'Репортер' },
  { type: 'environment', name: '[Barking]', description: 'Лай' },
  { type: 'environment', name: '[Beeping]', description: 'Писк' },
  { type: 'environment', name: '[Bell Dings]', description: 'Звонки колокольчиков' },
  { type: 'environment', name: '[Birds Chirping]', description: 'Пение птиц' },
  { type: 'environment', name: '[Bleep]', description: 'Блип' },
  { type: 'environment', name: '[Cheering]', description: 'Приветствия' },
  { type: 'environment', name: '[Clapping]', description: 'Хлопки' },
  { type: 'environment', name: '[Cough]', description: 'Кашель' },
  { type: 'environment', name: '[Groaning]', description: 'Стон' },
  { type: 'environment', name: '[Phone Ringing]', description: 'Звонок телефона' },
  { type: 'environment', name: '[Ringing]', description: 'Звон' },
  { type: 'environment', name: '[Screams]', description: 'Крики' },
  { type: 'environment', name: '[Sighs]', description: 'Вздохи' },
  { type: 'environment', name: '[Squawking]', description: 'Крик' },
  { type: 'environment', name: '[Whispers]', description: 'Шепот' },
  { type: 'environment', name: '[Whistling]', description: 'Свист' },
  { type: 'environment', name: '[Chuckles]', description: 'Хихиканье' },
  { type: 'environment', name: '[Clears Throat]', description: 'Прочистка горла' },
  { type: 'environment', name: '[Censored]', description: 'Цензурировано' },
  { type: 'environment', name: '[Silence]', description: 'Тишина' },
  { type: 'environment', name: '[Static]', description: 'Статика' }
];

const popularStyles = [
  { name: "Pop", description: "Поп музыка" },
  { name: "Rock", description: "Рок музыка" },
  { name: "Happy", description: "Радостное настроение" },
  { name: "Sad", description: "Грустное настроение" },
  { name: "Energetic", description: "Энергичная" },
  { name: "Calm", description: "Спокойная" },
  { name: "Romantic", description: "Романтичная" },
  { name: "Dramatic", description: "Драматичная" },
];

export const SunoEditor = () => {
  const [lyrics, setLyrics] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [styleDescription, setStyleDescription] = useState("");
  const [excludeStyles, setExcludeStyles] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [weirdness, setWeirdness] = useState([50]);
  const [styleInfluence, setStyleInfluence] = useState([70]);
  const [audioInfluence, setAudioInfluence] = useState([30]);
  const [activeField, setActiveField] = useState<'lyrics' | 'style' | 'exclude'>('lyrics');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const styleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const excludeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Статистика
  const characterCount = lyrics.length;
  const wordCount = lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0;
  const lineCount = lyrics.trim() ? lyrics.split('\n').filter(line => line.trim()).length : 0;
  const tagCount = (lyrics.match(/\[.*?\]/g) || []).length;

  const insertTag = (tag: string, targetField?: 'lyrics' | 'style' | 'exclude') => {
    const field = targetField || activeField;
    
    // Извлекаем название тега без квадратных скобок
    const tagName = tag.replace(/^\[|\]$/g, '');
    
    if (field === 'lyrics') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // В Lyrics вставляем с квадратными скобками
      const tagToInsert = tag.startsWith('[') ? tag : `[${tagName}]`;
      const newText = lyrics.substring(0, start) + tagToInsert + '\n' + lyrics.substring(end);
      
      setLyrics(newText);
      
      // Устанавливаем курсор после вставленного тега
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tagToInsert.length + 1, start + tagToInsert.length + 1);
      }, 0);
    } else if (field === 'style') {
      const textarea = styleTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // В Style вставляем без квадратных скобок
      const tagToInsert = tagName;
      const newText = styleDescription.substring(0, start) + tagToInsert + ' ' + styleDescription.substring(end);
      
      setStyleDescription(newText);
      
      // Устанавливаем курсор после вставленного тега
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tagToInsert.length + 1, start + tagToInsert.length + 1);
      }, 0);
    } else if (field === 'exclude') {
      const input = excludeInputRef.current;
      if (!input) return;

      const currentValue = excludeStyles;
      // В Exclude вставляем без квадратных скобок
      const tagToInsert = tagName;
      const newValue = currentValue ? currentValue + ', ' + tagToInsert : tagToInsert;
      setExcludeStyles(newValue);
      
      // Устанавливаем курсор в конец
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(newValue.length, newValue.length);
      }, 0);
    }
  };

  const getSuggestedField = (tagType: string): 'lyrics' | 'style' | 'exclude' => {
    // Секции всегда идут в lyrics
    if (tagType === 'section') return 'lyrics';
    
    // Жанры и стили могут идти в style или exclude
    if (tagType === 'genre' || tagType === 'style') return 'style';
    
    // Эффекты и инструменты обычно идут в lyrics
    if (tagType === 'effect' || tagType === 'instrument') return 'lyrics';
    
    // Остальные теги по умолчанию в lyrics
    return 'lyrics';
  };

  const addStyleToDescription = (style: string) => {
    // Убираем квадратные скобки если они есть
    const cleanStyle = style.replace(/^\[|\]$/g, '');
    const currentStyles = styleDescription.split(',').map(s => s.trim()).filter(s => s);
    if (!currentStyles.includes(cleanStyle)) {
      const newDescription = currentStyles.length > 0 
        ? styleDescription + ', ' + cleanStyle 
        : cleanStyle;
      setStyleDescription(newDescription);
    }
  };

  const validateStructure = () => {
    const errors: string[] = [];
    const lines = lyrics.split("\n");

    // Проверка основной структуры
    const hasSections = lines.some((line) =>
      /^\[Verse\]|^\[Chorus\]/.test(line.trim())
    );
    if (!hasSections && lyrics.trim()) {
      errors.push("Рекомендуется добавить секции [Verse] или [Chorus]");
    }

    // Проверка пустых секций
    let currentSection = "";
    let sectionContent = "";

    for (const line of lines) {
      if (line.trim().startsWith("[") && line.trim().endsWith("]")) {
        if (currentSection && !sectionContent.trim()) {
          errors.push(`Секция ${currentSection} пустая`);
        }
        currentSection = line.trim();
        sectionContent = "";
      } else {
        sectionContent += line + "\n";
      }
    }

    // Проверка последней секции
    if (currentSection && !sectionContent.trim()) {
      errors.push(`Секция ${currentSection} пустая`);
    }

    // Проверка баланса секций
    const verseCount = (lyrics.match(/\[Verse\]/g) || []).length;
    const chorusCount = (lyrics.match(/\[Chorus\]/g) || []).length;
    if (verseCount > 0 && chorusCount === 0) {
      errors.push("Рекомендуется добавить припев [Chorus]");
    }
    if (chorusCount > 0 && verseCount === 0) {
      errors.push("Рекомендуется добавить куплет [Verse]");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  useEffect(() => {
    if (lyrics.trim()) {
      validateStructure();
    } else {
      setValidationErrors([]);
    }
  }, [lyrics]);

  const exportSuno = () => {
    if (!validateStructure()) {
      toast({
        title: "Ошибка валидации",
        description: "Исправьте ошибки перед экспортом",
        variant: "destructive",
      });
      return;
    }

    const sunoFormat = {
      title: songTitle || "Untitled Song",
      artist: artist || "Unknown Artist",
      lyrics: lyrics,
      styleDescription: styleDescription,
      excludeStyles: excludeStyles,
      advancedOptions: {
        weirdness: weirdness[0],
        styleInfluence: styleInfluence[0],
        audioInfluence: audioInfluence[0],
      },
      metadata: {
        created: new Date().toISOString(),
        format: "SUNO",
        version: "1.0",
        statistics: {
          characters: characterCount,
          words: wordCount,
          lines: lineCount,
          tags: tagCount,
        },
      },
    };

    const dataStr = JSON.stringify(sunoFormat, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${songTitle || "song"}-suno.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast({ title: "Экспорт", description: "Файл для SUNO экспортирован" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lyrics);
    toast({ title: "Скопировано", description: "Текст песни скопирован" });
  };

  const startVoiceInput = () => {
    toast({
      title: "Голосовой ввод",
      description: "Функция будет доступна после интеграции с модулем Speech",
    });
  };

  const previewLyrics = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const renderPreview = () => {
    const lines = lyrics.split("\n");
    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
            // Секция
            const tagType =
              sunoTags.find((tag) => tag.name === trimmedLine)?.type ||
              "section";
            return (
              <div key={index} className="flex items-center space-x-2 my-4">
                <Badge
                  variant={
                    tagType === "section"
                      ? "default"
                      : tagType === "style"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {trimmedLine}
                </Badge>
              </div>
            );
          } else if (trimmedLine) {
            // Текст песни
            return (
              <p key={index} className="text-foreground leading-relaxed pl-4">
                {line}
              </p>
            );
          } else {
            // Пустая строка
            return <div key={index} className="h-2"></div>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <Card className="bg-gradient-secondary border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-primary" />
            <span>Suno Editor - Редактор для создания песен</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Создавайте тексты песен с использованием системы тегов для структуры
            и стилизации. Приложение работает полностью офлайн, и все данные
            хранятся локально на вашем устройстве.
          </p>
        </CardContent>
      </Card>

      {/* Основные разделы */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Левая колонка - Редактор/Превью */}
        <div className="lg:col-span-2 space-y-6">
          {/* Блок текста песни */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">
                    {isPreviewMode ? "Превью" : "LYRICS BLOCK"}
                  </h3>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Статистика */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{characterCount} символов</span>
                    <span>•</span>
                    <span>{wordCount} слов</span>
                    <span>•</span>
                    <span>{lineCount} строк</span>
                    <span>•</span>
                    <span>{tagCount} тегов</span>
                  </div>

                  {validationErrors.length > 0 ? (
                    <Badge
                      variant="destructive"
                      className="flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.length} ошибок</span>
                    </Badge>
                  ) : lyrics.trim() ? (
                    <Badge
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Валидно</span>
                    </Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPreviewMode ? (
                <div className="min-h-[400px] p-4 bg-background/30 rounded-md border border-border">
                  {lyrics.trim() ? (
                    renderPreview()
                  ) : (
                    <p className="text-muted-foreground italic">
                      Введите текст песни для превью
                    </p>
                  )}
                </div>
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Введите текст песни с SUNO-тегами...

Пример:
[Verse]
Первый куплет
Текст песни

[Chorus]
Припев
Запоминающиеся слова

[Bridge]
Переходная часть"
                  className="min-h-[400px] bg-background/50 border-border font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>

          {/* Описание стиля */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-medium">STYLE DESCRIPTION</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                ref={styleTextareaRef}
                value={styleDescription}
                onChange={(e) => setStyleDescription(e.target.value)}
                placeholder="Опишите желаемый стиль музыки, настроение, особенности вокала, влияние различных жанров..."
                className="min-h-[100px] bg-background/50 border-border"
              />

              {/* Популярные стили */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Популярные стили:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {popularStyles.map((style) => (
                    <Button
                      key={style.name}
                      variant="outline"
                      size="sm"
                      onClick={() => addStyleToDescription(style.name)}
                      className="text-xs"
                    >
                      {style.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Расширенные настройки */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-secondary-foreground" />
                <h3 className="text-lg font-medium">ADVANCED OPTIONS</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weirdness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Weirdness (Странность)
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {weirdness[0]}%
                  </span>
                </div>
                <Slider
                  value={weirdness}
                  onValueChange={setWeirdness}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Настройка степени экспериментальности или необычности
                  генерируемой музыки
                </p>
              </div>

              {/* Style Influence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Style Influence (Влияние стиля)
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {styleInfluence[0]}%
                  </span>
                </div>
                <Slider
                  value={styleInfluence}
                  onValueChange={setStyleInfluence}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Настройка силы влияния указанного описания стиля на генерацию
                </p>
              </div>

              {/* Audio Influence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Audio Influence (Влияние аудио)
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {audioInfluence[0]}%
                  </span>
                </div>
                <Slider
                  value={audioInfluence}
                  onValueChange={setAudioInfluence}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Настройка влияния аудио-референсов (для будущей интеграции)
                </p>
              </div>

              {/* Exclude Styles */}
              <div className="space-y-2">
                <Label htmlFor="excludeStyles" className="text-sm font-medium">
                  Exclude Styles (Исключить стили)
                </Label>
                <Input
                  ref={excludeInputRef}
                  id="excludeStyles"
                  value={excludeStyles}
                  onChange={(e) => setExcludeStyles(e.target.value)}
                  placeholder="Укажите теги стилей, которые НЕ должны быть использованы"
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Позволяет указать теги стилей, которые НЕ должны быть
                  использованы при генерации
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные опции */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-medium">MORE OPTIONS</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название песни</Label>
                  <Input
                    id="title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Введите название песни"
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="artist">Исполнитель</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Введите имя исполнителя"
                    className="bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - Панели */}
        <div className="space-y-6">
          {/* Панель инструментов */}
          <Card className="bg-card border-border">
            <CardHeader>
              <h3 className="text-lg font-medium">Панель инструментов</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="w-full justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Копировать текст
              </Button>
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={previewLyrics}
                className="w-full justify-start"
              >
                {isPreviewMode ? (
                  <Code className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isPreviewMode ? "Редактор" : "Превью SUNO"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportSuno}
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Экспорт SUNO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceInput}
                className="w-full justify-start"
                disabled
              >
                <Mic className="w-4 h-4 mr-2" />
                Голосовой ввод
              </Button>
            </CardContent>
          </Card>

          {/* Панель SUNO Тегов */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">SUNO Теги</h3>
                <div className="flex space-x-1">
                  <Button
                    variant={activeField === 'lyrics' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveField('lyrics')}
                    className="text-xs px-2"
                  >
                    Lyrics
                  </Button>
                  <Button
                    variant={activeField === 'style' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveField('style')}
                    className="text-xs px-2"
                  >
                    Style
                  </Button>
                  <Button
                    variant={activeField === 'exclude' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveField('exclude')}
                    className="text-xs px-2"
                  >
                    Exclude
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 <strong>Как использовать:</strong> Выберите поле (Lyrics/Style/Exclude) и кликните на тег. 
                Или правый клик для вставки в рекомендуемое поле. 
                <br />
                <span className="text-xs opacity-75">
                  • <strong>Lyrics:</strong> Секции, эффекты, инструменты, вокал <span className="text-primary">[с квадратными скобками]</span>
                  • <strong>Style:</strong> Жанры, стили, атмосфера, качество звука <span className="text-accent">без скобок</span>
                  • <strong>Exclude:</strong> Стили и жанры для исключения <span className="text-secondary-foreground">без скобок</span>
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Секции */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-primary">Секции</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'section').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Вокал */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-blue-500">Вокал</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'vocal').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Текстура вокала */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-500">Текстура вокала</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'texture').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Стили вокала */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-purple-500">Стили вокала</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'style').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Тон и диапазон */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-orange-500">Тон и диапазон</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'pitch').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Эффекты вокала */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-500">Эффекты вокала</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'effect').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Ритм и время */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-teal-500">Ритм и время</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'timing').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Динамика */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-pink-500">Динамика</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'dynamics').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Прогрессия */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-indigo-500">Прогрессия</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'progression').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Элементы */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-cyan-500">Элементы</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'element').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Атмосфера */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-yellow-500">Атмосфера</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'atmosphere').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Инструменты */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-lime-500">Инструменты</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'instrument').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Качество звука */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-emerald-500">Качество звука</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'quality').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Жанры */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-rose-500">Жанры</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'genre').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Окружение */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-slate-500">Окружение</h4>
                <div className="grid grid-cols-1 gap-1">
                  {sunoTags.filter(tag => tag.type === 'environment').map((tag) => {
                    const suggestedField = getSuggestedField(tag.type);
                    return (
                      <Button
                        key={tag.name}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8 group"
                        onClick={() => insertTag(tag.name)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          insertTag(tag.name, suggestedField);
                        }}
                      >
                        <span className="font-mono mr-2">{tag.name}</span>
                        <span className="text-muted-foreground flex-1 text-left">{tag.description}</span>
                        <Badge variant="outline" className="ml-2 text-xs opacity-60">
                          {suggestedField}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ошибки валидации */}
          {validationErrors.length > 0 && (
            <Card className="bg-card border-destructive">
              <CardHeader>
                <h3 className="text-sm font-medium text-destructive flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Ошибки валидации</span>
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-destructive flex items-start space-x-2"
                    >
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
