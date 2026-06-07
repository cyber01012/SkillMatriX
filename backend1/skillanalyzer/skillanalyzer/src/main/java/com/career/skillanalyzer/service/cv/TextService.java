package com.career.skillanalyzer.service.cv;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TextService {

    // ---------- PDF ----------
    public String extractText(MultipartFile file) throws Exception {

        PDDocument document =
                PDDocument.load(file.getInputStream());

        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);

        document.close();
        return text;
    }

    // ---------- WORD (.docx) ----------
    public String extractText(XWPFDocument document) throws Exception {

        XWPFWordExtractor extractor =
                new XWPFWordExtractor(document);

        return extractor.getText();
    }
}
