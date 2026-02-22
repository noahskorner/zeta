# Markdown Rendering Test Document

This document is designed to test **all common Markdown features** supported by modern editors.

---

## Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---

## Text Formatting

**Bold text**  
_Italic text_  
**_Bold + Italic_**  
~~Strikethrough~~
Inline `code` example.
Superscript: X^2^  
Subscript: H~2~O

---

## Blockquotes

> This is a **blockquote**.

---

## Lists

### Unordered List

- Item A
- Item B
  - Sub-item B1
  - Sub-item B2
    - Sub-sub-item

### Ordered List

1. First item
2. Second item
   1. Sub-item
   2. Sub-item
3. Third item

### Mixed List

- Bullet item
  1. Numbered sub-item
  2. Numbered sub-item
- Bullet item

### Checklist

- [ ] Task 1
- [x] Task 2 (completed)

---

## Links & Images

### Links

- [Inline link](https://example.com)
- [Link with title](https://example.com 'Example Title')
- <https://example.com> (auto-link)

### Reference Links

This is a [reference link][ref].

[ref]: https://example.com 'Reference Example'

### Images

![Alt text](https://via.placeholder.com/150)

![Alt text with title](https://via.placeholder.com/150 'Image Title')

---

## Table of Contents

- [Headings](#headings)
- [Text Formatting](#text-formatting)
- [Blockquotes](#blockquotes)
- [Lists](#lists)
- [Links & Images](#links--images)
- [Code](#code)
- [Tables](#tables)
- [Task Lists](#task-lists)
- [Footnotes](#footnotes)
- [Horizontal Rules](#horizontal-rules)
- [HTML](#html)
- [Escaping Characters](#escaping-characters)
- [Emoji](#emoji)
- [Math (Optional)](#math-optional)

---

## Code

### Inline Code

Use the `console.log()` function.

### Code Block (No Language)

```

function hello() {
return "Hello, world!";
}

```

### Code Block (JavaScript)

```js
const sum = (a, b) => a + b;
console.log(sum(2, 3));
```

### Code Block (JSON)

```json
{
  "name": "Markdown Test",
  "version": 1,
  "features": ["headings", "tables", "code"]
}
```

### Code Block (Bash)

```bash
npm install
npm run dev
```

---

## Tables

| Column A | Column B | Column C |
| -------- | -------- | -------- |
| Left     | Center   | Right    |
| Text     | **Bold** | `Code`   |
| 123      | 456      | 789      |

### Alignment

| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| A            |       B        |             C |
| 1            |       2        |             3 |

---

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

  - [x] Nested completed
  - [ ] Nested incomplete

---

## Footnotes

Here is a sentence with a footnote.[^1]

[^1]: This is the footnote content.

---

## Horizontal Rules

---

---

---

---

## HTML

<div style="padding:10px; border:1px solid #ccc;">
  <strong>Inline HTML</strong> inside Markdown.
</div>

---

## Escaping Characters

_Not italic_
**Not bold**

# Not a heading

---

## Emoji

😀 😎 🚀 🔥
:+1: :tada: :warning:

---

## Math (Optional)

Inline math: $E = mc^2$

Block math:

$$
\int_0^\infty e^{-x} dx = 1
$$

---

## Callouts / Admonitions (Editor-Specific)

> **Note**
> This is a note-style callout.

> **Warning**
> This is a warning-style callout.

---

## End

If all of the above renders correctly, your Markdown editor is in great shape. 🎉
