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

![Alt text](https://placehold.co/150x150)

![Alt text with title](https://placehold.co/150x150 'Image Title')

---

## Horizontal Rules

---

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

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
  - [x] Nested completed
  - [ ] Nested incomplete

---

## End

If all of the above renders correctly, your Markdown editor is in great shape. 🎉
