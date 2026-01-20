import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-highlight-textarea',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './highlight-textarea.component.html',
  styleUrl: './highlight-textarea.component.css'
})
export class HighlightTextareaComponent implements AfterViewInit {
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('highlight') highlightRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    // 组件初始化后的操作
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  }

  onScroll() {
    if (this.textareaRef && this.highlightRef) {
      this.highlightRef.nativeElement.scrollTop = this.textareaRef.nativeElement.scrollTop;
      this.highlightRef.nativeElement.scrollLeft = this.textareaRef.nativeElement.scrollLeft;
    }
  }

  getHighlightedHtml(): string {
    if (!this.value) {
      return `<span class="placeholder">${this.placeholder}</span>`;
    }

    // 将文本按行分割
    const lines = this.value.split('\n');

    // 处理每一行
    const processedLines = lines.map(line => {
      // 正则匹配 {{...}}
      const regex = /(\{\{[^}]*\}\})/g;
      let processed = line;

      // 替换所有匹配的 {{}} 为高亮的 span
      processed = processed.replace(regex, (match) => {
        return `<span class="highlight">${match}</span>`;
      });

      return processed;
    });

    // 用 <br> 连接各行
    return processedLines.join('<br>');
  }
}
