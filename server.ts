import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom User-Agent as instructed in the gemini-api skill
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. AI features will use fallback mock parser.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// API Endpoint 1: Parse unstructured Indonesian finance log/notes using Gemini
app.post("/api/ai/parse", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Input teks tidak valid." });
  }

  if (!ai) {
    // Elegant localized fallback if API key is not present, parsing simple "makanan 10000" etc.
    return res.json({
      fallback: true,
      items: mockParseLocal(text)
    });
  }

  try {
    const prompt = `Analisis teks catatan pengeluaran/pendapatan keuangan harian dalam bahasa Indonesia berikut ini:
"${text}"

Ekstrak semua item pengeluaran dan pendapatan yang disebutkan. Hitung nominalnya dengan benar. Ambil angka atau kalkulasi yang tertera. 
Contoh: "Beli bakso 2 porsi total 35rb dan teh anget 5rb" -> item 1: "Bakso 2 porsi" nominal 35000 (expense), item 2: "Teh anget" nominal 5000 (expense).
Contoh: "gajian 4.5 juta" -> item: "Gaji" nominal 4500000 (income).
Contoh: "ongkos ojek 12.000 dapet kembalian 3000" -> item: "Ojek" nominal 12000 (expense), "Kembalian ojek" nominal 3000 (income) jika relevan, atau langsung potong bersih.

Kategorikan setiap transaksi ke salah satu dari kategori berikut: "Makanan", "Transportasi", "Belanja", "Hiburan", "Tagihan", "Kesehatan", "Investasi", "Gaji", "Lainnya".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten keuangan pribadi yang sangat teliti, ahli mengekstrak nominal uang rupiah dari teks informal Indonesia (seperti '25rb', '1,5 juta', 'seceng', 'goceng'). Selalu kembalikan dalam schema JSON yang ditentukan.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: {
                    type: Type.STRING,
                    description: "Penjelasan pendek tentang item transaksi (contoh: 'Bakso', 'Gaji Bulanan', 'Bensin')"
                  },
                  amount: {
                    type: Type.NUMBER,
                    description: "Nominal transaksi dalam angka bulat rupiah (contoh: 25000, 1500000)"
                  },
                  type: {
                    type: Type.STRING,
                    description: "Tipe transaksi: 'expense' untuk pengeluaran, 'income' untuk pendapatan harian"
                  },
                  category: {
                    type: Type.STRING,
                    description: "Kategori transaksi yang disarankan"
                  }
                },
                required: ["description", "amount", "type", "category"]
              }
            }
          },
          required: ["items"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini parse error:", err);
    res.status(500).json({
      error: "Gagal memproses dengan AI, mengaktifkan penganalisis cadangan otomatis.",
      items: mockParseLocal(text)
    });
  }
});

// API Endpoint 2: Provide personalized weekly analytics & recommendations (weekly financial coach)
app.post("/api/ai/coach", async (req, res) => {
  const { transactions } = req.body;
  
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: "Daftar transaksi tidak boleh kosong." });
  }

  // Calculate high-level stats for the AI Context
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryBreakdown = transactions.reduce((acc: any, t) => {
    if (t.type === "expense") {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  const contextStr = `Statistik Keuangan Saat Ini:
- Total Pendapatan: Rp ${totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
- Sisa Saldo: Rp ${balance.toLocaleString('id-ID')}
- Detail Pengeluaran per Kategori: ${JSON.stringify(categoryBreakdown)}
- Riwayat Transaksi Lengkap: ${JSON.stringify(transactions.map(t => `${t.date || "Harian"} - ${t.description}: Rp ${t.amount} (${t.type === 'income' ? 'Masuk' : 'Keluar'})`))}`;

  if (!ai) {
    return res.json({
      fallback: true,
      score: balance >= 0 ? 80 : 45,
      summary: `Analisis Dompet Anda: Pendapatan Rp ${totalIncome.toLocaleString('id-ID')}, Pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}. Saldo Anda saat ini ${balance >= 0 ? 'Surplus' : 'Defisit'}.`,
      tips: [
        "Catat pengeluaran Anda tepat setelah berbelanja agar buku kas tetap akurat.",
        balance < 0 ? "Kurangi pengeluaran kategori makanan & gaya hidup mewah minggu ini." : "Pertahankan rasio tabungan Anda dengan mengalokasikan surplus langsung ke rekening investasi.",
        "Siapkan anggaran cadangan tak terduga untuk berjaga-jaga dari pengeluaran mendadak."
      ],
      weeklyOutlook: balance >= 0 ? "Stabil" : "Perlu Waspada"
    });
  }

  try {
    const prompt = `Analisis situasi keuangan pribadi berikut ini dan berikan nasihat finansial minggu ini secara santun, menyemangati, dan praktis dalam bahasa Indonesia yang ramah:

${contextStr}

Berikan skor kesehatan keuangan (1-100), ringkasan kondisi dompet saat ini, 3 tips penghematan taktis yang dipersonalisasi berdasarkan pengeluaran terbesar mereka, serta outlook umum untuk minggu depan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah Coach Keuangan Pribadi Indonesia yang bijak, ramah, dan solutif. Bantu pengguna memahami pola pengeluarannya secara positif tanpa menghakimi, memberikan anjuran taktis hemat pangkal kaya dalam nuansa buku harian.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Skor kesehatan keuangan dari 1 s.d 100 berdasarkan surplus, hemat, dan kategori"
            },
            summary: {
              type: Type.STRING,
              description: "Ringkasan kondisi saat ini (maksimal 2 kalimat)"
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar 3 buah saran hemat taktis spesifik berbahasa Indonesia"
            },
            weeklyOutlook: {
              type: Type.STRING,
              description: "Outlook minggu depan: harus bertuliskan 'Sangat Hemat', 'Stabil', 'Boros', atau 'Perlu Waspada'"
            }
          },
          required: ["score", "summary", "tips", "weeklyOutlook"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Gemini coach error:", err);
    res.status(500).json({
      error: "Gagal memproses dengan AI.",
      score: balance >= 0 ? 80 : 45,
      summary: "Kondisi keuangan Anda tampak stabil dengan pencatatan yang teratur.",
      tips: [
        "Pertahankan kebiasaan mencatat arus kas harian Anda.",
        "Cobalah membagi budget bulanan dengan metode 50/30/20.",
        "Gunakan kalkulator skeuomorfik kami untuk membatasi belanja sebelum bayar kasir."
      ],
      weeklyOutlook: "Stabil"
    });
  }
});

// Helper: Simple local parser fallback if Gemini API is disabled/failed
function mockParseLocal(text: string) {
  const items: any[] = [];
  const lowercase = text.toLowerCase();

  // Try to find numbers
  const numberRegex = /(\d+[\d\.,]*)/g;
  const numbersMatched = lowercase.match(numberRegex) || [];
  
  // Custom simple parsing heuristic for local Indonesian text
  // e.g. "bensin 20000 makan siang 45000"
  const phrases = lowercase.split(/,|dan|kemudian|lalu/);
  
  for (const phrase of phrases) {
    const trimmed = phrase.trim();
    if (!trimmed) continue;
    
    // Check type
    const isIncome = trimmed.includes("gaji") || trimmed.includes("pendapatan") || trimmed.includes("masuk") || trimmed.includes("gajian") || trimmed.includes("dapat") || trimmed.includes("bonus") || trimmed.includes("transfer");
    
    // Try to extract nominal
    let nominal = 0;
    // Replace localized suffixes e.g., "rb" or "k" to thousands, "juta" to millions
    let cleanText = trimmed;
    if (trimmed.includes("rb") || trimmed.includes("ribu")) {
      const match = trimmed.match(/(\d+[\d\.,]*)\s*(?:rb|ribu)/);
      if (match) {
        nominal = parseFloat(match[1].replace(",", ".")) * 1000;
        cleanText = cleanText.replace(match[0], "");
      }
    } else if (trimmed.includes("jt") || trimmed.includes("juta")) {
      const match = trimmed.match(/(\d+[\d\.,]*)\s*(?:jt|juta)/);
      if (match) {
        nominal = parseFloat(match[1].replace(",", ".")) * 1000000;
        cleanText = cleanText.replace(match[0], "");
      }
    } else if (trimmed.includes("k")) {
      const match = trimmed.match(/(\d+[\d\.,]*)\s*k/);
      if (match) {
        nominal = parseFloat(match[1].replace(",", ".")) * 1000;
        cleanText = cleanText.replace(match[0], "");
      }
    } else {
      // Ordinary number extraction
      const match = trimmed.match(/(\d+[\d\.]*)/);
      if (match) {
        const rawNumString = match[1].replace(/\./g, ""); // strip dots (Indonesian thousand format)
        nominal = parseInt(rawNumString, 10) || 0;
        cleanText = cleanText.replace(match[0], "");
      }
    }

    if (nominal === 0) {
      // Default placeholder if none found
      nominal = 15000;
    }

    // Determine clean label
    let description = cleanText
      .replace(/[\d.,r|b|k|juta|ribu|jt]/g, "")
      .replace(/\brp\b/g, "")
      .trim();
    
    description = description ? description.charAt(0).toUpperCase() + description.slice(1) : (isIncome ? "Pendapatan Lain" : "Pengeluaran Lain");
    
    // Guess category
    let category = "Lainnya";
    if (trimmed.includes("makan") || trimmed.includes("minum") || trimmed.includes("kopi") || trimmed.includes("bakso") || trimmed.includes("pecel") || trimmed.includes("sate")) category = "Makanan";
    else if (trimmed.includes("ojek") || trimmed.includes("bensin") || trimmed.includes("gojek") || trimmed.includes("grab") || trimmed.includes("parkir") || trimmed.includes("tol") || trimmed.includes("mobil") || trimmed.includes("motor")) category = "Transportasi";
    else if (trimmed.includes("belanja") || trimmed.includes("baju") || trimmed.includes("pakaian") || trimmed.includes("sabun") || trimmed.includes("shampoo")) category = "Belanja";
    else if (trimmed.includes("bioskop") || trimmed.includes("game") || trimmed.includes("topup") || trimmed.includes("nonton") || trimmed.includes("liburan") || trimmed.includes("jalan")) category = "Hiburan";
    else if (trimmed.includes("listrik") || trimmed.includes("pdam") || trimmed.includes("wifi") || trimmed.includes("indihome") || trimmed.includes("pulsa") || trimmed.includes("tagihan")) category = "Tagihan";
    else if (trimmed.includes("obat") || trimmed.includes("dokter") || trimmed.includes("sakit") || trimmed.includes("vitamin") || trimmed.includes("klinik")) category = "Kesehatan";
    else if (trimmed.includes("gaji") || trimmed.includes("gajian") || trimmed.includes("bonus") || trimmed.includes("omset")) category = "Gaji";

    items.push({
      description,
      amount: nominal,
      type: isIncome ? "income" : "expense",
      category
    });
  }

  return items.length > 0 ? items : [{ description: "Pengeluaran Manual", amount: 12000, type: "expense", category: "Lainnya" }];
}

// Serve Vite middleware or built production site asset bundle
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Buku Kas Harian server running on http://localhost:${PORT}`);
  });
}

startServer();
