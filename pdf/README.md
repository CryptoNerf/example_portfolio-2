# Инструкция по добавлению PDF файлов

## Как добавить ваш PDF документ:

1. Поместите ваш PDF файл в эту папку (`pdf/`)
2. Переименуйте его в `sample.pdf` или измените путь в файле `glava1.html`

Например, если ваш файл называется `portfolio.pdf`, замените в glava1.html строку:

```javascript
const flipbook = new PDFFlipbook('pdf/sample.pdf');
```

на:

```javascript
const flipbook = new PDFFlipbook('pdf/portfolio.pdf');
```

## Для тестирования:

Вы можете скачать бесплатный тестовый PDF с:
- https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
- https://www.africau.edu/images/default/sample.pdf

## Поддерживаемые форматы:
- Любые стандартные PDF файлы
- Рекомендуемый размер: до 50 МБ для лучшей производительности
- Оптимальное количество страниц: 1-200

## Создание дополнительных глав:

Чтобы создать Главу 2, Главу 3 и т.д.:

1. Скопируйте файл `glava1.html`
2. Переименуйте его в `glava2.html`, `glava3.html` и т.д.
3. В каждом файле измените путь к PDF:
   - Глава 2: `const flipbook = new PDFFlipbook('pdf/chapter2.pdf');`
   - Глава 3: `const flipbook = new PDFFlipbook('pdf/chapter3.pdf');`
