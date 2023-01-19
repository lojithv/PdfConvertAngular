declare var require: any;
import Canvas from "canvas";
const assert = require("assert")
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export function convertPDF(file,uploadFile) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "//cdn.jsdelivr.net/npm/pdfjs-dist@3.2.146/build/pdf.worker.js";
  if (file) {
    let currentPageNo = 1;
    file.arrayBuffer().then((buff) => {
      function NodeCanvasFactory() {}
      NodeCanvasFactory.prototype = {
        create: function NodeCanvasFactory_create(width, height) {
          assert(width > 0 && height > 0, "Invalid canvas size");
          const canvas = Canvas.createCanvas(width, height);
          const context = canvas.getContext("2d");
          return {
            canvas,
            context,
          };
        },

        reset: function NodeCanvasFactory_reset(
          canvasAndContext,
          width,
          height
        ) {
          assert(canvasAndContext.canvas, "Canvas is not specified");
          assert(width > 0 && height > 0, "Invalid canvas size");
          canvasAndContext.canvas.width = width;
          canvasAndContext.canvas.height = height;
        },

        destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
          assert(canvasAndContext.canvas, "Canvas is not specified");

          // Zeroing the width and height cause Firefox to release graphics
          // resources immediately, which can greatly reduce memory consumption.
          canvasAndContext.canvas.width = 0;
          canvasAndContext.canvas.height = 0;
          canvasAndContext.canvas = null;
          canvasAndContext.context = null;
        },
      };

      // Some PDFs need external cmaps.
      const CMAP_URL = "../../../node_modules/pdfjs-dist/cmaps/";
      const CMAP_PACKED = true;

      // Where the standard fonts are located.
      const STANDARD_FONT_DATA_URL =
        "../../../node_modules/pdfjs-dist/standard_fonts/";

      // Loading file from file system into typed array.
      const pdfPath = "./test1.pdf";
      const data = new Uint8Array(buff);

      // Load the PDF file.
      const loadingTask = pdfjsLib.getDocument({
        data,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
        standardFontDataUrl: STANDARD_FONT_DATA_URL,
      });

      function convertPage(pdfDocument, i, numPages) {
        pdfDocument.getPage(i).then(async (page) => {
          // Render the page on a Node canvas with 100% scale.
          const viewport = page.getViewport({ scale: 1.0 });
          const canvasFactory = new NodeCanvasFactory();
          const canvasAndContext = canvasFactory.create(
            viewport.width,
            viewport.height
          );
          const renderContext = {
            canvasContext: canvasAndContext.context,
            viewport,
            canvasFactory,
          };

          const renderTask = page.render(renderContext);
          renderTask.promise.then(() => {
            // Convert the canvas to an image buffer.
            
            canvasAndContext.canvas.toBlob((blob) => {
              let convertedFile = new File([blob], `${file.name.toString().split(".")[0]+"_"+i.toString()}.png`, { type: "image/png" })
              uploadFile(convertedFile, numPages,currentPageNo)
              currentPageNo++;
            }, 'image/png');
            
            page.cleanup();
            if(numPages>i){
              convertPage(pdfDocument,i+1,numPages)
            }
            // Release page resources.
          });
        });
      }

      (async function () {
        try {
          loadingTask.promise.then((pdfDocument) => {

            // Get the first page.
            convertPage(pdfDocument, 1, pdfDocument.numPages);
          });
        } catch (reason) {
          console.log(reason);
        }
      })();
    });
  }
}
