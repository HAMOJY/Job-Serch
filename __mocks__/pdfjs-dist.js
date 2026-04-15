// Manual mock for pdfjs-dist/legacy/build/pdf.mjs
// Tests override this via jest.mock() or directly via this stub
module.exports = {
  getDocument: jest.fn(),
}
