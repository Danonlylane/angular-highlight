import { Component } from '@angular/core';
import { HighlightTextareaComponent } from './components/highlight-textarea/highlight-textarea.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HighlightTextareaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Angular 高亮 Textarea 组件';
  textValue = '你好 {{name}}，欢迎来到 {{place}}！\n\n今天是 {{date}}，天气 {{weather}}。\n\n请在文本中使用 {{变量名}} 的格式来高亮显示内容。';

  onTextChange(newValue: string) {
    this.textValue = newValue;
    console.log('文本已更新:', newValue);
  }
}
