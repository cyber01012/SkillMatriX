
// app/api/export-pdf/route.ts
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { origin, state } = await req.json() as { origin: string; state: string };
    if (!origin || !state) return new Response(JSON.stringify({ error: 'Missing origin/state' }), { status: 400 });

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'shell',
    });
    const page = await browser.newPage();

    // Seed localStorage (fixes 431)
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.evaluate((st) => localStorage.setItem('resumePrintState', st), state);

    // Ensure print media rules apply
    await page.emulateMediaType('print');

    await page.goto(`${origin}/print`, { waitUntil: 'networkidle0' });



// Ensure fonts + pagination completed before PDF
type DocumentWithFonts = Document & { fonts?: FontFaceSet };

await page.evaluate(() => {
  const doc = document as DocumentWithFonts;
  return doc.fonts?.ready ?? Promise.resolve();
});

await page.waitForFunction(() => {
  const root = document.getElementById('resume-preview-print');
  return !!root && root.querySelectorAll('.page').length >= 1; // set >= 2 if you expect 2+
}, { polling: 'mutation' });

 
    const raw = await page.pdf({    
    // width: '210mm',            // custom page width
    // height: '297mm',           // custom page height
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }, // 🔥 important
    // margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    }); // Uint8Array

    // ✅ Ensure we have a pure ArrayBuffer (not SharedArrayBuffer)
    const arrayBuffer: ArrayBuffer = new Uint8Array(raw).buffer;

    return new Response(arrayBuffer, {
    headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Cache-Control': 'no-store',
    },
    });


  } catch (err) {
    console.error('Export PDF error:', err);
    return new Response(JSON.stringify({ error: 'Failed to export PDF' }), { status: 500 });
  }
}
