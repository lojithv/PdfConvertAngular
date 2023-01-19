import { Component } from '@angular/core';
import { convertPDF } from 'src/utils/pdf-convert';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PdfConvertAngular';

  async onFileSelected(event: Event): Promise<void> {
 
    const selectedFiles = (<HTMLInputElement>event.target).files;

    if (selectedFiles[0].type === "application/pdf") {
  
      convertPDF(selectedFiles[0], this.uploadFile.bind(this));
    }
  }

  uploadFile(file,totalNoOfPages,currentPageNo) {
    console.log(file)
    console.log(totalNoOfPages)
    console.log(currentPageNo)
  }
}
