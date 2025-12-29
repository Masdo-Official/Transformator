import { GoogleGenAI } from "@google/genai";

// The strict prompt provided by the user
const MIGRATION_SYSTEM_INSTRUCTION = `
Bertindaklah sebagai Senior JavaScript Engineer yang mengkhususkan diri dalam Legacy Code Migration.
Tugas Anda: Mengonversi kode sumber Bot WhatsApp (Node.js) dari CommonJS (CJS) ke ECMAScript Modules (ESM).

Ini adalah operasi KRITIS. Kesalahan kecil dalam penamaan variabel akan merusak sistem.

⚠️ BACA ATURAN BERIKUT DENGAN SANGAT TELITI SEBELUM MENJAWAB ⚠️

### ✅ WAJIB PATUHI INI (MUST DO):
1.  **KONVERSI IMPORT/EXPORT:**
    - Ubah \`const x = require('pkg')\` menjadi \`import x from 'pkg'\`.
    - Ubah \`module.exports = ...\` menjadi \`export default ...\` atau \`export const ...\`.
    - Jika mengimpor file lokal, pastikan ekstensi file tetap ada (contoh: \`import ... from './lib/function.js'\`).

2.  **TAMBAHKAN HEADER KOMPATIBILITAS (Wajib ada di baris paling atas):**
    Salin dan tempel kode ini persis di bagian paling atas file hasil konversi untuk menggantikan fungsi CJS yang hilang:
    \`\`\`javascript
    import { fileURLToPath } from 'url';
    import path from 'path';
    import { createRequire } from 'module';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const require = createRequire(import.meta.url);
    \`\`\`

3.  **PENANGANAN JSON:**
    - Jangan ubah pemanggilan file JSON menjadi \`import\`. Tetap gunakan \`require('./file.json')\` karena kita sudah mendefinisikan \`require\` buatan di header tadi. Ini lebih aman.

### ⛔ JANGAN LAKUKAN INI (STRICTLY FORBIDDEN):
1.  **JANGAN UBAH NAMA VARIABEL APAPUN (SANGAT PENTING!!):**
    - Jika di kode asli tertulis \`DinzBotz.sendMessage\`, BIARKAN TETAP \`DinzBotz\`. JANGAN ubah menjadi \`sock\`, \`conn\`, \`client\`, atau nama lain.
    - Pertahankan nama variabel \`m\`, \`chatUpdate\`, \`store\`, \`isCreator\`, dll persis seperti aslinya.

2.  **JANGAN UBAH STRUKTUR LOGIKA:**
    - Jangan mencoba "merapikan" if/else.
    - Jangan mengubah switch/case.
    - Jangan menghapus komentar kode.
    - Salin logika apa adanya (verbatim).

3.  **JANGAN UBAH PATH FOLDER:**
    - Biarkan path seperti \`./lib/...\`, \`./src/...\`, \`./media/...\` apa adanya. Jangan mencoba memperbaiki path meskipun terlihat aneh.

4.  **JANGAN MENYINGKAT KODE:**
    - Jangan mengubah function biasa menjadi arrow function jika tidak diminta.
    - Berikan kode FULL (jangan dipotong dengan komentar "// ... rest of code").
`;

// Helper to safely get the API key without crashing in environments where process is undefined
const getApiKey = (): string | undefined => {
  try {
    // In Vite (via define), process.env.API_KEY is replaced with the string literal.
    // We check existence first to avoid ReferenceError if process is completely missing.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Silently fail, handled below
    return undefined;
  }
  return undefined;
};

export const convertCode = async (sourceCode: string): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "Configuration Error: API Key is missing. \n\n" +
      "1. For Local: Create a .env file and add API_KEY=your_key.\n" +
      "2. For Vercel: Go to Settings > Environment Variables and add API_KEY."
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using gemini-3-pro-preview for maximum reasoning capability on code logic
    // Using thinkingBudget to ensure the model meticulously checks variable names (Anti-Crash Logic)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: sourceCode,
      config: {
        systemInstruction: MIGRATION_SYSTEM_INSTRUCTION,
        temperature: 0.1, // Low temperature for deterministic code output
        thinkingConfig: { thinkingBudget: 4096 } // Increased budget for "Big Client" complexity
      }
    });

    if (!response.text) {
      throw new Error("The model returned an empty response. Please try again.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Enhanced Error Reporting for "Big Client" clarity
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        throw new Error("Authentication Failed: Your API Key is invalid or expired.");
      }
      if (error.message.includes("429")) {
        throw new Error("Rate Limit Exceeded: The system is under heavy load. Please wait a moment.");
      }
      return `// SYSTEM ERROR: ${error.message}\n// Please check your network or API quota.`;
    }
    
    throw new Error("Unknown error occurred during critical conversion.");
  }
};