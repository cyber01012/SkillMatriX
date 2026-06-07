
import puppeteer, { type Browser } from "puppeteer";

import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let browser: Browser | null = null;

  try {
    const { html, fileName } = await req.json();

    if (!html) {
      return new Response(JSON.stringify({ error: "Missing HTML" }), { status: 400 });
    }

    browser = await puppeteer.launch({
      headless: "shell", // or "new" depending on your env
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    // Puppeteer returns a Uint8Array (often Node Buffer, but typed as Uint8Array here)
    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: false,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    
// Choose a server-side folder to persist the PDF
    const EXPORT_ROOT =
      process.env.EXPORT_DIR || path.join(process.cwd(), "public", "exports");
    await fs.mkdir(EXPORT_ROOT, { recursive: true });

    const safeName = `${(fileName || "report.pdf")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-")}`.replace(/\.pdf$/i, "") + ".pdf";

    const serverPath = path.join(EXPORT_ROOT, safeName);
    await fs.writeFile(serverPath, pdfBytes);

    // const publicUrl = `/exports/${safeName}`
    // If saved under Next.js "public", this will be served statically
    const publicUrlBase = "/exports";
    const publicUrl = `${publicUrlBase}/${safeName}`;

    // Return JSON containing both values so the client can open it
    return new Response(JSON.stringify({ publicUrl, savedPath: serverPath }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "PDF export failed" }), { status: 500 });
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

//     // ✅ Create a fresh ArrayBuffer (no SharedArrayBuffer in the type)
//     const ab = new ArrayBuffer(pdfBytes.byteLength);
//     new Uint8Array(ab).set(pdfBytes); // copy bytes

//     return new Response(ab, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${fileName || "report.pdf"}"`,
//         "Cache-Control": "no-store",
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "PDF export failed" }), { status: 500 });
//   } finally {
//     if (browser) {
//       try { await browser.close(); } catch {}
//     }
//   }
// }
