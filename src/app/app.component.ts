import { Component, ViewChild } from '@angular/core';
import { HighlightTextareaComponent } from './components/highlight-textarea/highlight-textarea.component';
import { RichTextEditorComponent } from './components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HighlightTextareaComponent, RichTextEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild(RichTextEditorComponent) richEditor!: RichTextEditorComponent;

  title = 'Angular 富文本编辑器 & 高亮 Textarea';
  textValue = '你好 {{name}}，欢迎来到 {{place}}！\n\n今天是 {{date}}，天气 {{weather}}。\n\n请在文本中使用 {{变量名}} 的格式来高亮显示内容。';
  richTextValue = '你好 {{name}}，欢迎使用富文本编辑器！\n\n这是基于 contenteditable 实现的编辑器。';

  onTextChange(newValue: string) {
    this.textValue = newValue;
    console.log('Textarea 文本已更新:', newValue);
  }

  onRichTextChange(newValue: string) {
    this.richTextValue = newValue;
    console.log('富文本已更新:', newValue);
  }

  // 富文本编辑器操作方法
  selectAllText() {
    this.richEditor?.selectAll();
  }

  getSelectedText() {
    const selected = this.richEditor?.getSelectedText();
    alert(`选中的文本: ${selected || '无'}`);
  }

  insertSampleText() {
    this.richEditor?.insertText(' {{新变量}} ');
  }

  clearEditor() {
    if (confirm('确定要清空编辑器吗？')) {
      this.richEditor?.clear();
    }
  }
}
