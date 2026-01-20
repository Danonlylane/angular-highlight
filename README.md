# Angular 高亮 Textarea 组件

一个功能强大的 Angular 组件，可以像 textarea 一样编辑文本，同时自动高亮 `{{}}` 包裹的变量名。

## ✨ 核心特性

- 🎯 **自动高亮**：自动识别并高亮 `{{变量名}}` 格式的文本
- 👁️ **隐藏花括号**：在显示层隐藏 `{{}}` 符号，只显示变量名
- ✏️ **完整编辑功能**：像普通 textarea 一样可以输入、删除、复制粘贴
- 🔄 **滚动同步**：高亮层和输入层完美同步
- 📝 **多行支持**：支持多行文本编辑
- 🎨 **可自定义样式**：轻松修改高亮颜色和样式

## 🎬 效果演示

**编辑区域：**
```
你好 name，欢迎来到 place！
      ↑            ↑
   (高亮显示)   (高亮显示)
```

**实际输入内容：**
```
你好 {{name}}，欢迎来到 {{place}}！
```

## 🚀 快速开始

### 安装依赖并运行

```bash
cd highlight-textarea-app
npm install
ng serve
```

打开浏览器访问 `http://localhost:4200/`

### 使用组件

1. **导入组件**

```typescript
import { HighlightTextareaComponent } from './components/highlight-textarea/highlight-textarea.component';

@Component({
  standalone: true,
  imports: [HighlightTextareaComponent],
  // ...
})
export class YourComponent {
  text = 'Hello {{name}}!';

  onTextChange(newValue: string) {
    this.text = newValue;
    console.log('文本更新:', newValue);
  }
}
```

2. **在模板中使用**

```html
<app-highlight-textarea
  [value]="text"
  (valueChange)="onTextChange($event)"
  [placeholder]="'输入文本...'"
  [rows]="5"
  [disabled]="false"
></app-highlight-textarea>
```

## 📋 组件 API

### 输入属性 (Inputs)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 文本内容 |
| `placeholder` | `string` | `''` | 占位符文本 |
| `rows` | `number` | `4` | 文本框行数 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### 输出事件 (Outputs)

| 事件 | 参数类型 | 说明 |
|------|----------|------|
| `valueChange` | `string` | 文本变化时触发 |

## 🎨 自定义样式

### 修改高亮颜色

编辑 [highlight-textarea.component.css:47-53](src/app/components/highlight-textarea/highlight-textarea.component.css#L47-L53)

```css
/* 当前是黄色高亮 */
.highlight-layer ::ng-deep .highlight {
  background-color: #fef08a;  /* 背景色 */
  color: #854d0e;             /* 文字颜色 */
  font-weight: 600;
  border-radius: 3px;
  padding: 0 4px;
}

/* 可以改成蓝色 */
.highlight-layer ::ng-deep .highlight {
  background-color: #dbeafe;
  color: #1e40af;
  font-weight: 600;
  border-radius: 3px;
  padding: 0 4px;
}
```

### 修改边框和焦点样式

编辑 [highlight-textarea.component.css:40-44](src/app/components/highlight-textarea/highlight-textarea.component.css#L40-L44)

```css
.input-layer:focus {
  outline: none;
  border-color: #3b82f6;      /* 焦点边框颜色 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);  /* 焦点阴影 */
}
```

## 🔧 技术实现

组件采用双层结构：

```
┌─────────────────────────────────┐
│  高亮显示层 (div)               │ ← 显示高亮文本（花括号隐藏）
│  z-index: 1                    │ ← 不可交互
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  输入层 (textarea)              │ ← 透明文字，光标可见
│  z-index: 2                    │ ← 可交互
└─────────────────────────────────┘
```

**关键技术点：**
1. 使用正则表达式匹配 `{{...}}` 模式
2. 高亮层通过 `opacity: 0` 隐藏花括号，但保留占位
3. 输入层使用透明文字 (`color: transparent`) 但保留光标 (`caret-color: black`)
4. 通过滚动事件同步两层的滚动位置

## 📁 项目结构

```
src/app/
├── components/
│   └── highlight-textarea/
│       ├── highlight-textarea.component.ts      # 组件逻辑
│       ├── highlight-textarea.component.html    # 组件模板
│       └── highlight-textarea.component.css     # 组件样式
├── app.component.ts                             # 主应用（示例）
├── app.component.html                           # 主应用模板
└── app.component.css                            # 主应用样式
```

## 🧪 构建项目

```bash
# 开发构建
ng build

# 生产构建
ng build --configuration production
```

## 📝 开发说明

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.0.

### 开发服务器
运行 `ng serve` 启动开发服务器，访问 `http://localhost:4200/`。修改源文件后应用会自动重新加载。

### 代码生成
运行 `ng generate component component-name` 生成新组件。也可以使用 `ng generate directive|pipe|service|class|guard|interface|enum|module`。

### 运行单元测试
运行 `ng test` 通过 [Karma](https://karma-runner.github.io) 执行单元测试。

## 📄 License

MIT

---

Made with ❤️ using Angular
