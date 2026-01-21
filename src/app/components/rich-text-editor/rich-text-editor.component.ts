import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CaretPosition {
  node: Node | null;
  offset: number;
}

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.css'
})
export class RichTextEditorComponent implements AfterViewInit, OnDestroy {
  @Input() value: string = '';
  @Input() placeholder: string = '输入文本...';
  @Input() minHeight: string = '200px';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  private isComposing = false; // IME 输入状态
  private isUpdating = false; // 标记是否正在更新 DOM，避免循环

  ngAfterViewInit() {
    // 初始化内容
    if (this.value) {
      this.updateContent(this.value);
    }
  }

  ngOnDestroy() {
    // 清理
  }

  /**
   * 处理输入事件
   */
  onInput(event: Event) {
    if (this.isComposing || this.isUpdating) {
      return;
    }

    this.isUpdating = true;

    try {
      // 遍历所有文本节点，应用高亮
      this.highlightTextNodes();

      // 触发值变化事件
      const text = this.getPlainText();
      this.valueChange.emit(text);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 高亮所有文本节点
   */
  private highlightTextNodes() {
    const editor = this.editorRef.nativeElement;
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // 保存光标位置（全局偏移量）
    let caretOffset = 0;
    if (range) {
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }

    // 遍历所有文本节点
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToProcess: { node: Text, parent: Node }[] = [];
    let node: Node | null;

    while (node = walker.nextNode()) {
      if (node.parentNode && node.textContent) {
        nodesToProcess.push({ node: node as Text, parent: node.parentNode });
      }
    }

    // 处理每个文本节点
    for (const { node, parent } of nodesToProcess) {
      const text = node.textContent || '';

      // 检查是否包含 {{}}
      if (/\{\{[^}]*\}\}/.test(text)) {
        // 需要高亮，创建新的 HTML 结构
        const highlighted = text.replace(/(\{\{[^}]*\}\})/g, '<span class="highlight">$1</span>');

        // 创建临时容器
        const temp = document.createElement('span');
        temp.innerHTML = highlighted;

        // 替换文本节点
        if (parent && node.parentNode === parent) {
          // 将临时容器的所有子节点插入到原位置
          while (temp.firstChild) {
            parent.insertBefore(temp.firstChild, node);
          }
          parent.removeChild(node);
        }
      }
    }

    // 使用全局偏移量恢复光标位置
    if (selection && caretOffset >= 0) {
      this.restoreCaretPosition({ node: null, offset: caretOffset });
    }
  }

  /**
   * 处理粘贴事件
   */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    // 获取纯文本
    const text = event.clipboardData?.getData('text/plain') || '';

    // 插入文本
    document.execCommand('insertText', false, text);
  }

  /**
   * IME 开始输入
   */
  onCompositionStart() {
    this.isComposing = true;
  }

  /**
   * IME 输入结束
   */
  onCompositionEnd(event: Event) {
    this.isComposing = false;
    this.onInput(event);
  }

  /**
   * 获取纯文本内容
   */
  private getPlainText(): string {
    const editor = this.editorRef.nativeElement;
    // 使用 textContent 而不是 innerText，因为 innerText 可能会忽略某些换行
    let text = editor.textContent || '';

    // 清理多余的换行符（contenteditable 可能会添加额外的换行）
    // 移除开头和结尾的换行
    text = text.replace(/^\n+|\n+$/g, '');

    return text;
  }

  /**
   * 应用高亮
   */
  private applyHighlight(text: string): string {
    if (!text || text.trim() === '') {
      return '';
    }

    // 分割成行
    const lines = text.split('\n');

    // 处理每一行，所有行都用 div 包装，保持一致性
    const processedLines = lines.map(line => {
      // 转义 HTML 特殊字符
      const escaped = this.escapeHtml(line);

      // 高亮 {{}} 变量
      const highlighted = escaped.replace(/(\{\{[^}]*\}\})/g, '<span class="highlight">$1</span>');

      // 空行也用 div 包装，但内部放一个 br 保持高度
      if (line === '') {
        return '<div><br></div>';
      }

      // 非空行用 div 包装
      return `<div>${highlighted}</div>`;
    });

    // 直接连接
    return processedLines.join('');
  }

  /**
   * 转义 HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 保存光标位置
   */
  private saveCaretPosition(): CaretPosition {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { node: null, offset: 0 };
    }

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(this.editorRef.nativeElement);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const offset = preCaretRange.toString().length;

    return { node: range.endContainer, offset };
  }

  /**
   * 恢复光标位置
   */
  private restoreCaretPosition(caretPos: CaretPosition) {
    const editor = this.editorRef.nativeElement;
    const selection = window.getSelection();

    if (!selection) return;

    try {
      const range = this.createRangeFromOffset(editor, caretPos.offset);
      if (range) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (e) {
      // 光标恢复失败，放置在末尾
      this.placeCaretAtEnd();
    }
  }

  /**
   * 从偏移量创建 Range
   */
  private createRangeFromOffset(root: Node, offset: number): Range | null {
    const range = document.createRange();
    let currentOffset = 0;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    while (node = walker.nextNode()) {
      const textLength = node.textContent?.length || 0;

      if (currentOffset + textLength >= offset) {
        range.setStart(node, offset - currentOffset);
        range.setEnd(node, offset - currentOffset);
        return range;
      }

      currentOffset += textLength;
    }

    // 如果没有找到，放在末尾
    return null;
  }

  /**
   * 将光标放在末尾
   */
  private placeCaretAtEnd() {
    const editor = this.editorRef.nativeElement;
    const selection = window.getSelection();

    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * 更新内容（编程方式）
   */
  updateContent(text: string) {
    if (!text || text.trim() === '') {
      this.editorRef.nativeElement.innerHTML = '';
      return;
    }

    this.isUpdating = true;

    try {
      const highlighted = this.applyHighlight(text);
      this.editorRef.nativeElement.innerHTML = highlighted;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 全选
   */
  selectAll() {
    const editor = this.editorRef.nativeElement;
    const selection = window.getSelection();

    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * 获取选中的文本
   */
  getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() || '';
  }

  /**
   * 插入文本到光标位置
   */
  insertText(text: string) {
    document.execCommand('insertText', false, text);
  }

  /**
   * 清空内容
   */
  clear() {
    this.editorRef.nativeElement.innerHTML = '';
    this.valueChange.emit('');
  }

  /**
   * 获取当前文本
   */
  getText(): string {
    return this.getPlainText();
  }
}
