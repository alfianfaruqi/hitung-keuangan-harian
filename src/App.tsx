import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  RefreshCw,
  Calculator as CalcIcon,
  Award,
  ChevronRight,
  Info
} from "lucide-react";
import { Transaction, AICoachResponse, CategoryType } from "./types";
import { playClickSound, playPageTurnSound, playCashRegisterSound } from "./utils/audio";
import SkeuomorphicCalculator from "./components/SkeuomorphicCalculator";

// Mock preset transactions for native Indonesia vibe, so app looks pre-filled & populated
const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    description: "Gaji Freelance Desain",
    amount: 3500000,
    type: "income",
    category: "Gaji",
    date: "2026-06-15",
    note: "Alhamdulillah denda keterlambatan nihil"
  },
  {
    id: "tx-2",
    description: "Belanja Bulanan Indomaret",
    amount: 245000,
    type: "expense",
    category: "Belanja",
    date: "2026-06-15",
    note: "Sabun, minyak goreng kemasan, sikat gigi"
  },
  {
    id: "tx-3",
    description: "Bensin Vespa Harian",
    amount: 50000,
    type: "expense",
    category: "Transportasi",
    date: "2026-06-16",
    note: "Pertamax full tank"
  },
  {
    id: "tx-4",
    description: "Nasi Padang + Es Teh Jumbo",
    amount: 35000,
    type: "expense",
    category: "Makanan",
    date: "2026-06-16",
    note: "Lauk tunjang kepala kakap nikmat"
  },
  {
    id: "tx-5",
    description: "Topup Langganan Wifi",
    amount: 315000,
    type: "expense",
    category: "Tagihan",
    date: "2026-06-17",
    note: "Indihome paket belajar ceria"
  },
  {
    id: "tx-6",
    description: "Bonus Omset Jualan Kaos",
    amount: 750000,
    type: "income",
    category: "Gaji",
    date: "2026-06-17",
    note: "Laku keras 15 pcs"
  },
  {
    id: "tx-7",
    description: "Kopi Gula Aren Kekinian",
    amount: 22000,
    type: "expense",
    category: "Makanan",
    date: "2026-06-17",
    note: "Jangan sering-sering demi ginjal"
  }
];

const CATEGORY_ICONS: Record<string, string> = {
  Makanan: "☕",
  Transportasi: "🛵",
  Belanja: "🛒",
  Hiburan: "🕹️",
  Tagihan: "🔌",
  Kesehatan: "💊",
  Investasi: "📈",
  Gaji: "💰",
  Lainnya: "🧩"
};

const CATEGORY_COLORS: Record<string, string> = {
  Makanan: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Transportasi: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Belanja: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Hiburan: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Tagihan: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Kesehatan: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Investasi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Gaji: "bg-green-500/10 text-green-400 border-green-500/20",
  Lainnya: "bg-stone-500/10 text-stone-400 border-stone-500/20"
};

const FUN_MOTIVATIONS = [
  "Uang memang bukan segalanya, tapi segalanya butuh uang. Apalagi boba dingin siang bolong! 🥤",
  "Gajian itu bagaikan mantan terindah: sempat datang menyapa, lalu pergi menyisakan kenangan indah... 💸",
  "Hematlah dari sekarang sebelum kamu terpaksa makan mie instan rasa kuah soto duka cita! 🍜",
  "Dompetmu itu seperti bawang merah: kalau dibuka bawaannya pengen nangis tersedu-sedu! 🧅",
  "Jangan suka larping jadi orang kaya kalau saldo m-banking aslinya tinggal sisa batas minimal penarikan! 💳",
  "Pepatah bilang 'hemat pangkal kaya', tapi kenyataan bilang 'hemat pangkal dititipin temen beli kopi'! ☕",
  "Uang tidak bisa membeli kebahagiaan, tapi nangis di dalam mobil ber-AC jauh lebih mending daripada nangis di boncengan gojek kehujanan! 🚗",
  "Tarik nafas dalam-dalam... hembuskan... sekarang liat saldo kasmu... lalu tarik nafas sedih kembali... 😤",
  "Rencana masa depan: Kaya raya tanpa harus bangun pagi & bekerja keras. Semoga beruntung! 🌟"
];

const PIGGY_SPEECHES_HAPPY = [
  "Oink! Kasmu surplus gagah perkasa! Celenganku gemuk, tidurnya pun nyenyak! 🐷✨",
  "Wih mantap bos! Kemarin jajan hemat kan? Sini masukin koinnya lagi! 🪙",
  "Tabungan melimpah ruah! Bolehlah sore ini beli boba ukuran super-extra-large! 🥤",
  "Buku kasnya rapi bener, pasti karena asisten Pena AI! Oink!",
  "Status keuangan sehat! Dompet tebal, senyuman pun lebar! 😁"
];

const PIGGY_SPEECHES_SAD = [
  "Oink... kok saldonya makin tipis ya? Aku mulai kelaparan koin... 😭",
  "Aduh bos! Kurangi jajan kopi susu manis gula aren itu, dompet nangis oink oink!",
  "Loh loh loh... ini pengeluaran kok lebih tinggi dari gajimu? Jangan menyerah, ayo hemat! 🚨",
  "Hati-hati akhir bulan makan promag sirup dicampur kuah kaldu! 🤢",
  "Kondisi kritis! Saatnya aktifkan mode meditasi hemat maksimal oink!"
];

export default function App() {
  // State Initialization from LocalStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("BUKU_KAS_TRANSACTIONS");
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("BUKU_KAS_SOUND");
    return saved !== "false";
  });

  // UI state managers
  const [activeTab, setActiveTab] = useState<"semua" | "pemasukan" | "pengeluaran">("semua");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // New transaction input state
  const [desc, setDesc] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<CategoryType>("Makanan");
  const [noteText, setNoteText] = useState<string>("");

  // AI interactive prompt input state
  const [aiInputText, setAiInputText] = useState<string>("");
  const [aiParsing, setAiParsing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Personal Coach state indicators
  const [aiCoachResponse, setAiCoachResponse] = useState<AICoachResponse | null>(null);
  const [aiCoachLoading, setAiCoachLoading] = useState<boolean>(false);
  const [coachFallback, setCoachFallback] = useState<boolean>(false);

  // Modal or Side Desk Drawer toggles
  const [showCalculator, setShowCalculator] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Playful fun states
  const [funnyQuoteIndex, setFunnyQuoteIndex] = useState<number>(() => Math.floor(Math.random() * FUN_MOTIVATIONS.length));
  const [piggySpeech, setPiggySpeech] = useState<string>("");
  const [isPiggyShaking, setIsPiggyShaking] = useState<boolean>(false);

  // Persist State to Local Storage
  useEffect(() => {
    localStorage.setItem("BUKU_KAS_TRANSACTIONS", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("BUKU_KAS_SOUND", soundEnabled.toString());
  }, [soundEnabled]);

  // Request AI coach breakdown on load or transaction modification
  useEffect(() => {
    requestAICoachInsight();
  }, [transactions.length]);

  // Sound triggering decorator
  const triggerSound = (type: "click" | "page" | "cash", pitch = 800) => {
    if (!soundEnabled) return;
    if (type === "click") playClickSound(pitch);
    if (type === "page") playPageTurnSound();
    if (type === "cash") playCashRegisterSound();
  };

  // Run AI parsing of raw conversational prompt
  const handleAITransactionParse = async () => {
    if (!aiInputText.trim()) return;
    triggerSound("page");
    setAiParsing(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiInputText })
      });

      if (!response.ok) {
        throw new Error("Respon server bermasalah");
      }

      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        // Map parsed AI items into actual Transaction payload
        const newTxs: Transaction[] = data.items.map((item: any, idx: number) => ({
          id: `tx-ai-${Date.now()}-${idx}`,
          description: item.description || "Transaksi AI",
          amount: Math.max(100, Math.floor(Number(item.amount) || 0)),
          type: item.type === "income" ? "income" : "expense",
          category: item.category || "Lainnya",
          date: selectedDate,
          note: `Diproses otomatis via Pena AI: "${aiInputText.substring(0, 35)}..."`
        }));

        setTransactions(prev => [newTxs[0], ...prev]); // Prepend fresh parsed item to state
        setAiInputText("");
        triggerSound("cash");
        
        // Let's display a success message momentarily
        setAiError("✓ Tersimpan!");
        setTimeout(() => setAiError(null), 2500);
      } else {
        setAiError("AI tidak dapat mendeteksi nominal keuangan. Coba ketik lebih detail.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError("Gagal memanggil asisten AI. Silakan input manual.");
    } finally {
      setAiParsing(false);
    }
  };

  // Manual transaction logging
  const handleAddNewTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.floor(parseFloat(cashAmount.replace(/[^0-9.-]+/g, "")));
    if (!desc.trim() || isNaN(val) || val <= 0) {
      triggerSound("click", 300);
      return;
    }

    const newTx: Transaction = {
      id: `tx-manual-${Date.now()}`,
      description: desc.trim(),
      amount: val,
      type: txType,
      category: category,
      date: selectedDate,
      note: noteText.trim() || undefined
    };

    setTransactions(prev => [newTx, ...prev]);
    triggerSound("cash");

    // Reset fields
    setDesc("");
    setCashAmount("");
    setNoteText("");
  };

  // Send calculated value to the manual transaction amount field
  const handleReceiveValue = (num: number) => {
    setCashAmount(num.toString());
    triggerSound("click", 1100);
  };

  const handleDeleteTransaction = (id: string) => {
    triggerSound("click", 400);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Erase all customization and reload original Indonesian dataset
  const handleResetData = () => {
    if (confirm("Apakah Anda ingin menghapus seluruh riwayat kas dan memuat kembali data contoh harian?")) {
      triggerSound("page");
      setTransactions(DEFAULT_TRANSACTIONS);
      setAiInputText("");
      setAiCoachResponse(null);
    }
  };

  // Fetch AI Financial analyst recommendations based on current logs
  const requestAICoachInsight = async () => {
    setAiCoachLoading(true);
    setCoachFallback(false);
    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions })
      });
      if (response.ok) {
        const data = await response.json();
        setAiCoachResponse(data);
        if (data.fallback) {
          setCoachFallback(true);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      // Local graceful fallback calculations
      const totalInc = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
      const totalExp = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
      const balance = totalInc - totalExp;
      setAiCoachResponse({
        score: balance >= 0 ? 75 : 40,
        summary: "Pencatatan kas Anda berjalan lancar. Jaga agar tidak lebih besar pasak daripada tiang.",
        tips: [
          "Biasakan langsung mencatat pengeluaran begitu selesai berbelanja agar akurat.",
          "Pisahkan tabungan darurat sebelum mencicil pembelian sekunder.",
          "Gunakan asisten Pena AI kami untuk mencatat pengeluaran saat di jalan."
        ],
        weeklyOutlook: balance >= 0 ? "Stabil" : "Perlu Waspada"
      });
      setCoachFallback(true);
    } finally {
      setAiCoachLoading(false);
    }
  };

  // Date and filter-based variables
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === "semua") return true;
    return tx.type === (activeTab === "pemasukan" ? "income" : "expense");
  });

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const rollFunnyQuote = () => {
    triggerSound("page");
    let nextIdx = Math.floor(Math.random() * FUN_MOTIVATIONS.length);
    if (nextIdx === funnyQuoteIndex) {
      nextIdx = (nextIdx + 1) % FUN_MOTIVATIONS.length;
    }
    setFunnyQuoteIndex(nextIdx);
  };

  const handlePokePiggy = () => {
    setIsPiggyShaking(true);
    triggerSound("click", 1100);
    const list = netSavings >= 0 ? PIGGY_SPEECHES_HAPPY : PIGGY_SPEECHES_SAD;
    const randomSpeech = list[Math.floor(Math.random() * list.length)];
    setPiggySpeech(randomSpeech);
    setTimeout(() => {
      setIsPiggyShaking(false);
    }, 600);
  };

  // Group current values for weekly/monthly view percentages (SVG hand-draw graph)
  const categorySummary = transactions.reduce((acc: Record<string, number>, t) => {
    if (t.type === "expense") {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  const totalCategoriesValue = (Object.values(categorySummary) as number[]).reduce((s, v) => s + v, 0) || 1;

  return (
    <div 
      className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden text-stone-200 p-2 sm:p-4 md:p-6 transition-all duration-1000 relative" 
      style={{
        backgroundColor: "#161311",
        backgroundImage: "radial-gradient(#2d231b 1.5px, transparent 1.5px), radial-gradient(#2d231b 1.5px, #161311 1.5px)",
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 16px 16px"
      }}
      id="app_desk_background"
    >
      {/* Decorative coffee spill / wooden flat lay stains */}
      <div className="absolute top-24 left-[3%] w-28 h-28 bg-[#2d1c10] rounded-full blur-xl pointer-events-none select-none mix-blend-color-burn opacity-70 transform -rotate-12"></div>
      <div className="absolute top-28 left-[4%] w-20 h-20 bg-[#1f160e] rounded-full pointer-events-none select-none border border-amber-950/15 transform rotate-45 flex items-center justify-center opacity-40">
        <span className="text-[8px] font-mono text-amber-950/50 tracking-widest uppercase">COFFEE STAIN</span>
      </div>

      {/* Cute Interactive Sticky Post-it note of Funny Financial quotes */}
      <div className="w-full max-w-6xl mx-auto mb-6 relative z-10 transition-all hover:scale-[1.005]">
        <div className="bg-gradient-to-tr from-amber-250 via-amber-100 to-yellow-200 text-stone-900 p-4 rounded-b-lg rounded-tr-3xl shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_0_-8px_16px_rgba(230,190,40,0.15)] border-l-4 border-amber-400 font-serif relative overflow-hidden">
          {/* Tape rendering */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-white/40 shadow-sm backdrop-blur-xs transform -rotate-2 origin-center -translate-y-2 pointer-events-none"></div>
          
          {/* Pin rendering */}
          <div className="absolute top-2 right-4 w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm flex items-center justify-center text-[7px] text-white select-none">📌</div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-1.5PL">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-bold flex items-center gap-1.5 select-none">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Nasihat Kocak Anti Miskin Hari Ini</span>
              </span>
              <p className="text-xs md:text-sm font-medium italic text-stone-850 leading-relaxed pl-1.5 border-l-2 border-amber-400">
                &ldquo;{FUN_MOTIVATIONS[funnyQuoteIndex]}&rdquo;
              </p>
            </div>
            
            <button 
              onClick={rollFunnyQuote}
              className="px-3.5 py-1.5 bg-stone-900 text-amber-300 hover:bg-stone-850 rounded-lg text-[10px] font-mono font-bold tracking-tight uppercase shadow-sm select-none transition-all cursor-pointer hover:shadow-md shrink-0 flex items-center gap-1 active:scale-95"
            >
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Ganti Nasihat (Kocok!)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Brass Settings Header Over the Oak Desk */}
      <header className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-stone-900 border-2 border-stone-850 px-5 py-4 rounded-2xl mb-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.6)] gap-4" id="brass_executive_header">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 skeu-button rounded-full flex items-center justify-center text-amber-500 border border-stone-800 shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),2px_3px_5px_rgba(0,0,0,0.5)]">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-100 uppercase">BUKU KAS HARIAN</h1>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                Skeuo-v2
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono tracking-wider font-semibold">
              KESEIMBANGAN ARUS KEUANGAN DIGITAL • ASISTEN PENA AI
            </p>
          </div>
        </div>

        {/* Tactile Control Panel Controls (Brass Switches/Status bulbs) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sound toggle button */}
          <button 
            onClick={() => {
              const nextVal = !soundEnabled;
              setSoundEnabled(nextVal);
              if (nextVal) {
                // Play immediate feedback sound
                setTimeout(() => playClickSound(950, 0.08), 50);
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
              soundEnabled 
                ? "bg-amber-950/40 border-amber-800 text-amber-400 shadow-[inset_0_1px_3px_rgba(245,158,11,0.2)]" 
                : "bg-stone-800 border-stone-700 text-stone-500"
            }`}
            title="Aktifkan efek suara kertas & kas registers"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>Efek Suara ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Mute</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              triggerSound("page");
              setShowCalculator(!showCalculator);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              showCalculator 
                ? "bg-sky-950/40 border-sky-850 text-sky-400 shadow-[inset_0_1px_3px_rgba(14,165,233,0.3)]"
                : "bg-stone-800 border-stone-700 text-stone-400"
            }`}
          >
            <CalcIcon className="w-4 h-4" />
            <span>Kalkulator 1982</span>
          </button>

          {/* Guide Modal Toggle */}
          <button
            onClick={() => {
              triggerSound("click", 700);
              setShowGuideModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-850 border border-stone-750 text-stone-300 hover:bg-stone-800 rounded-lg text-xs font-mono font-bold cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-stone-400" />
            <span>Panduan</span>
          </button>

          {/* Refetch or reset button data */}
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-850 border border-red-950 hover:bg-red-950/20 text-red-400 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
            title="Mulai Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>
      </header>

      {/* Main Ledger Executive Table Layout */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="main_skeuomorphic_binder">
        
        {/* Left Hand: Calculator or Floating Widget Panel (Takes 3 columns if visible) */}
        {showCalculator && (
          <div className="lg:col-span-3 flex flex-col gap-4 bg-stone-900 p-4 rounded-2xl border-2 border-stone-850 shadow-[0_15px_30px_rgba(0,0,0,0.5)] lg:sticky lg:top-4" id="calculator_sidebar_panel">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                <h3 className="text-xs font-bold text-stone-300 font-mono uppercase tracking-tight">Alat Berhitung</h3>
              </div>
              <button 
                onClick={() => { triggerSound("click", 500); setShowCalculator(false); }}
                className="text-stone-500 hover:text-stone-300 font-bold font-mono text-[10px] uppercase tracking-tighter"
              >
                [Sembunyi]
              </button>
            </div>
            
            <p className="text-[10px] text-stone-400 leading-normal font-mono select-none px-1">
              Gunakan kalkulator saku klasik untuk bantuan menghitung bon belanjaan Anda. Hasil akhir dapat dikirim instan ke form utama.
            </p>

            <SkeuomorphicCalculator onSendValue={handleReceiveValue} />

            <div className="separator mt-4"></div>
            
            {/* Interactive Celengan Babi (Piggy Bank) Widget for Fun Engagement */}
            <div className="p-3.5 bg-gradient-to-b from-rose-950/20 to-pink-950/10 border border-pink-900/30 rounded-2xl relative overflow-hidden text-center shadow-md">
              <div className="text-[9px] font-mono font-bold text-pink-400 uppercase tracking-widest text-left mb-1 flex items-center justify-between">
                <span>CELENGAN HARIAN 🐷</span>
                <span className="animate-pulse text-xs">● Live</span>
              </div>
              
              <div 
                onClick={handlePokePiggy}
                className={`text-5xl my-3 mx-auto w-16 h-16 flex items-center justify-center cursor-pointer select-none transition-all duration-300 ${isPiggyShaking ? 'scale-125 rotate-6 animate-bounce' : 'hover:scale-110 active:scale-95'}`}
                title="Senggol celengan untuk suara oink!"
              >
                {netSavings >= 1000000 ? "🐷" : netSavings >= 0 ? "🐽" : "😰"}
              </div>

              {/* Talk bubble */}
              <div className="bg-stone-950/80 p-2.5 rounded-lg border border-pink-900/10 text-[10px] font-mono text-stone-200 min-h-[46px] flex items-center justify-center">
                {piggySpeech ? (
                  <span className="italic text-stone-100">&ldquo;{piggySpeech}&rdquo;</span>
                ) : (
                  <span className="text-stone-500 italic">Senggol babi celengan untuk oink-oink wejangan keuangan!</span>
                )}
              </div>

              <div className="mt-2.5 flex justify-between items-center text-[9px] font-mono text-stone-500 border-t border-stone-850 pt-2">
                <span>Saldo Bersih:</span>
                <span className={`font-bold font-mono ${netSavings >= 0 ? 'text-emerald-450' : 'text-rose-400'}`}>
                  Rp {netSavings.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-950/40 rounded-xl border border-stone-800/60 mt-1">
              <p className="text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Panduan Cepat:</p>
              <ul className="text-[10px] font-mono text-stone-500 space-y-1">
                <li>1. Ketik nilai / perkalian di kalkulator</li>
                <li>2. Klik &ldquo;Kirim Nominal ke Form&rdquo;</li>
                <li>3. Isi keterangan transaksi dan simpan</li>
              </ul>
            </div>
          </div>
        )}

        {/* Right Columns: Double page physical binder layout (Pads remaining columns) */}
        <div className={`${showCalculator ? 'lg:col-span-9' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 bg-[#1b1917] rounded-3xl border-4 border-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden relative`} id="leather_book_interior">
          
          {/* Cover stitching visual decoration borders */}
          <div className="absolute inset-0 border-[3px] border-dashed border-stone-800/60 pointer-events-none rounded-3xl m-[3px]"></div>
          
          {/* Centered realistic ring binder divide columns structure */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-6 -ml-3 bg-gradient-to-r from-stone-950/40 via-stone-900 to-stone-950/40 z-30 pointer-events-none border-l border-r border-stone-900 flex flex-col justify-around py-10 items-center">
            {/* Skeuomorphic Ring binder hooks decoration */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-4 rounded-lg bg-gradient-to-b from-stone-400 via-stone-200 to-stone-500 border border-stone-600 shadow-[2px_4px_6px_rgba(0,0,0,0.8)] opacity-95 relative -left-1">
                <div className="absolute top-1/2 left-1 text-[8px] text-stone-700/60 font-mono leading-none -translate-y-1/2 font-bold select-none">◉</div>
              </div>
            ))}
          </div>

          {/* ========================================== */}
          {/* PAGE 1 (LEFT): EXECUTIVE LEDGER SUMMARY PAGE */}
          {/* ========================================== */}
          <div className="p-6 md:pr-10 bg-[#22201e] border-b md:border-b-0 md:border-r border-stone-950 relative" id="book_page_left">
            
            {/* Soft ruled lines pattern background for notebook look */}
            <div className="absolute inset-0 bg-ruled-mask opacity-10 pointer-events-none"></div>

            {/* Subheader Title block resembling traditional bank passbook */}
            <div className="relative mb-6 pb-2 border-b-2 border-amber-900/40">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-amber-500 font-mono tracking-widest font-bold uppercase select-none">
                  HALAMAN PERTAMA • LAPORAN & COACH AI
                </span>
                <span className="text-[10px] font-mono text-stone-400 italic">
                  No. Buku: BK-2026/06
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-100 tracking-tight font-serif mt-1">
                Ikhtisar Buku Kas & Rekomendasi
              </h2>
            </div>

            {/* Glowing Fluorescent Vault Balance Display (Branded CRT LCD Style) */}
            <div className="relative mb-6 p-4 rounded-xl border border-stone-800 bg-stone-950 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_4px_10px_rgba(0,0,0,0.4)] overflow-hidden" id="liquid_balance_display">
              {/* Retro phosphor light shine/glare overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.04] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-mono tracking-widest text-emerald-500/70 uppercase">
                  SALDO BERSIH SAAT INI (KAS AKTIF)
                </span>
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] font-mono text-emerald-400">AMAN</span>
                </div>
              </div>

              {/* Central net balance with indonesian localized numeric symbols */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-serif text-emerald-500/80 mr-2">Rp</span>
                <span className={`text-2xl font-mono font-bold tracking-tight glow-text-emerald truncate ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netSavings >= 0 ? "+" : ""}{netSavings.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Sub components inside glass view: total incoming & expenses */}
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-emerald-950/80">
                <div>
                  <p className="text-[9px] font-mono text-stone-400 uppercase">PENDAPATAN (IN)</p>
                  <p className="text-sm font-mono text-emerald-400/90 font-bold truncate">
                    Rp {totalIncome.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-stone-400 uppercase">PENGELUARAN (OUT)</p>
                  <p className="text-sm font-mono text-rose-400/90 font-bold truncate">
                    Rp {totalExpense.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Hand-Drawn Styled Category Bar Charts */}
            <div className="skeu-base p-4 rounded-xl border border-stone-800 bg-stone-900/80 shadow-md mb-6 relative">
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Alokasi Pengeluaran Terbesar</span>
              </h3>

              {Object.keys(categorySummary).length === 0 ? (
                <div className="py-8 text-center bg-stone-950/25 rounded-lg border border-stone-850">
                  <p className="text-stone-500 text-xs font-mono">Belum ada catatan pengeluaran minggu ini.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(Object.entries(categorySummary) as [string, number][])
                    .sort((a, b) => b[1] - a[1]) // Sort desc
                    .slice(0, 4) // Show top 4
                    .map(([cat, val]) => {
                      const percentage = Math.round((val / totalCategoriesValue) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="flex items-center gap-1">
                              <span>{CATEGORY_ICONS[cat] || "🧩"}</span>
                              <span className="text-stone-300 font-medium">{cat}</span>
                            </span>
                            <span className="text-stone-400 text-[11px]">
                              Rp {val.toLocaleString("id-ID")} ({percentage}%)
                            </span>
                          </div>
                          
                          {/* Skeuomorphic tactile progress track bar */}
                          <div className="h-2 rounded bg-stone-950 shadow-inner overflow-hidden flex">
                            <div 
                              className="h-full rounded bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-700"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Glowing AI Finance Coach Interactive Desk Terminal (Weekly recommendations) */}
            <div className="relative p-5 rounded-2xl border border-blue-900/40 bg-linear-to-b from-stone-900 to-stone-950/90 shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(59,130,246,0.15)] overflow-hidden" id="ai_advisor_section">
              {/* Small LED active indicators */}
              <div className="absolute top-4 right-4 flex gap-1 items-center">
                <span className={`w-2 h-2 rounded-full ${aiCoachLoading ? 'bg-amber-500 animate-ping' : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'}`}></span>
                <span className="text-[8px] font-mono tracking-widest text-[#60a5fa] font-bold">KONEKSI AI</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <h3 className="text-xs font-bold text-blue-400 font-mono tracking-wider uppercase">
                  Weekly Coach Advisor AI (Indonesian)
                </h3>
              </div>

              {/* Analytical Output Interface */}
              <div className="rounded-lg bg-[#14181f] p-3 border border-blue-950 min-h-[140px] flex flex-col justify-between">
                {aiCoachLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mb-2" />
                    <p className="text-xs font-mono text-blue-400/90 animate-pulse">
                      Sedang menatap buku kas Anda, menganalisis nominal...
                    </p>
                  </div>
                ) : aiCoachResponse ? (
                  <div className="space-y-3">
                    {/* Health score and badge */}
                    <div className="flex justify-between items-center bg-blue-950/20 px-2.5 py-1.5 rounded border border-blue-900/30">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-yellow-550" />
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Kesehatan Finansial:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-200">
                          {aiCoachResponse.score} / 100
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border ${
                          aiCoachResponse.weeklyOutlook === "Sangat Hemat" || aiCoachResponse.weeklyOutlook === "Stabil"
                            ? "bg-emerald-950/80 border-emerald-800 text-emerald-400"
                            : "bg-rose-955/80 border-rose-800 text-rose-450"
                        }`}>
                          Outlook: {aiCoachResponse.weeklyOutlook}
                        </span>
                      </div>
                    </div>

                    {/* Summary text */}
                    <p className="text-xs font-serif text-stone-300 italic leading-relaxed pl-2 border-l-2 border-blue-400">
                      &ldquo;{aiCoachResponse.summary}&rdquo;
                    </p>

                    {/* Tips and steps list */}
                    <div className="space-y-1 mt-2">
                      <p className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest pl-1">
                        Saran Taktis Penghematan:
                      </p>
                      <ul className="space-y-1">
                        {aiCoachResponse.tips.map((tip, index) => (
                          <li key={index} className="text-[10px] font-mono text-stone-400 flex items-start gap-1">
                            <span className="text-blue-500 font-bold select-none">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-stone-500 font-mono mb-2">Belum ada statistik analis termuat.</p>
                    <button 
                      onClick={() => { triggerSound("click", 850); requestAICoachInsight(); }}
                      className="px-4 py-1.5 bg-blue-900/30 border border-blue-800 text-blue-400 hover:bg-blue-900/50 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      Buka Analisa Coach AI
                    </button>
                  </div>
                )}
                
                {coachFallback && (
                  <div className="mt-2 text-right">
                    <span className="text-[8px] font-mono text-stone-500 italic bg-stone-900 px-1.5 py-0.5 rounded">
                      Mode lokal aktif
                    </span>
                  </div>
                )}
              </div>

              {/* Trigger insight re-fetch */}
              <button
                disabled={aiCoachLoading}
                onClick={requestAICoachInsight}
                className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-300 text-[10px] font-mono tracking-tight font-bold rounded-lg uppercase select-none transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: aiCoachLoading ? '1s' : '0s' }} />
                Minta Rekomendasi Terkini
              </button>
            </div>

            {/* Signature and watermark logo */}
            <div className="mt-8 text-center select-none opacity-20">
              <span className="font-serif italic text-xs text-stone-500">Buku Register Kas Kulit - Alfian Faruqi &copy; 2026</span>
            </div>
          </div>

          {/* ========================================== */}
          {/* PAGE 2 (RIGHT): RECENT TRANSACTIONS & INPUTS */}
          {/* ========================================== */}
          <div className="p-6 md:pl-10 bg-[#252321] relative flex flex-col justify-between" id="book_page_right">
            
            {/* Ruled lines pattern overlay */}
            <div className="absolute inset-0 bg-ruled-mask opacity-10 pointer-events-none"></div>

            {/* Ruled lines margin vertical red line (classic ledger page styling) */}
            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-rose-900/30 pointer-events-none block"></div>

            <div>
              {/* Header registry */}
              <div className="relative mb-4 pb-2 border-b-2 border-stone-800">
                <div className="flex justify-between items-center pl-4">
                  <h3 className="text-[10px] text-amber-500 font-mono tracking-widest font-bold uppercase select-none">
                    HALAMAN KEDUA • TRANSAKSI HARIAN
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        triggerSound("click", 800);
                        setSelectedDate(e.target.value);
                      }}
                      className="bg-stone-900 border border-stone-800 rounded font-mono text-[10px] text-stone-300 px-1.5 py-0.5 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* TABS SELECTOR (Skeuomorphic folder notches) */}
              <div className="flex gap-1.5 pl-4 mb-4 select-none">
                {(["semua", "pemasukan", "pengeluaran"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      triggerSound("click", 900);
                      setActiveTab(tab);
                    }}
                    className={`px-3 py-1 text-[10px] font-mono tracking-tight font-bold rounded-t-md border-t border-x uppercase transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-[#252321] border-stone-800 text-stone-100 shadow-none -mb-[1px] z-10"
                        : "bg-stone-900 border-stone-850/60 text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    {tab === "semua" ? "Semua Kas" : tab === "pemasukan" ? "Pemasukan (+)" : "Pengeluaran (-)"}
                  </button>
                ))}
              </div>

              {/* THE PHYSICAL RULLED REGISTER (Alternating blue/green ruled ledger journal lines) */}
              <div className="pl-4 pr-1 mb-6">
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-850 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                  <div className="flex justify-between items-center text-[9px] font-mono text-stone-500 uppercase tracking-wider pb-1.5 border-b border-stone-850 mb-2">
                    <span>Butir Deskripsi & Kategori</span>
                    <span className="pr-8">Nominal Rupiah</span>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center text-stone-500 font-mono text-xs italic">
                      Riwayat transaksi kosong untuk filter ini. Let&apos;s tulis dengan Pena AI di bawah!
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 select-text scrollbar-thin">
                      {filteredTransactions.map((tx) => (
                        <div 
                          key={tx.id}
                          className="flex justify-between items-center p-2 rounded hover:bg-stone-900/50 transition-colors group relative border-b border-stone-900/40"
                        >
                          <div className="flex items-center gap-2.5 max-w-[65%]">
                            {/* Short icon badge */}
                            <span 
                              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs border ${
                                CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Lainnya
                              }`}
                              title={tx.category}
                            >
                              {CATEGORY_ICONS[tx.category] || "🧩"}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-serif font-semibold text-stone-100 truncate flex items-center gap-1.5">
                                {tx.description}
                                {tx.note && (
                                  <span className="text-[9px] text-stone-500 italic font-mono truncate" title={tx.note}>
                                    ({tx.note})
                                  </span>
                                )}
                              </p>
                              <p className="text-[9px] text-stone-500 font-mono">
                                {tx.date} • {tx.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono">
                            <span className={`text-[11px] font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.type === 'income' ? '+' : '-'}Rp{tx.amount.toLocaleString('id-ID')}
                            </span>
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-stone-850 text-[10px] font-mono text-stone-400 pl-1">
                    <span>Arus Kas Tersaring:</span>
                    <span className="font-bold pr-2 bg-stone-900/60 px-2 py-0.5 rounded text-stone-200">
                      {filteredTransactions.length} baris ledger
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* THE DUAL MANUAL & ADVANCED INTERACTIVE AI INPUT MODULE */}
            <div className="pl-4 mt-auto">
              
              {/* PENA AI (COGNITIVE AUTOMATION PROMPT WRITER VIEW) */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl mb-4 relative" id="ai_cognitive_module">
                {/* Decorative retro laser glow pin */}
                <div className="absolute top-2.5 right-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  <p className="text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-widest pl-1 select-none">PENA AI AKTIF</p>
                </div>

                <label className="block text-[10px] font-mono text-indigo-300/90 uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Ketik Catatan Keuangan Bebas (Pena AI)</span>
                </label>

                {/* AI Input Textbox resembling a paper typewriter note */}
                <div className="p-2 mb-2 bg-[#10131a] rounded-lg border border-indigo-950 shadow-inner flex gap-2">
                  <input
                    type="text"
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                    placeholder="Contoh: Makan rawon 25rb, beli eskrim cone 15000, bayar parkir ojol 2k"
                    className="flex-1 bg-transparent text-xs text-stone-200 focus:outline-none placeholder-indigo-300/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAITransactionParse();
                    }}
                  />
                  
                  {/* Micro guide link */}
                  <div className="tooltip-container relative flex items-center">
                    <Info className="w-3.5 h-3.5 text-indigo-400/50 cursor-help" />
                    <span className="tooltip-txt hidden absolute bg-stone-900 text-[9px] p-2 leading-tight rounded-md border border-indigo-900 w-44 -top-24 right-0 z-50">
                      Masukkan kalimat Indonesia bebas seperti &ldquo;Makan bubur ayam 12 ribu dapet diskon dapet cashback 1500&rdquo;, AI akan menghitung nominal bersihnya.
                    </span>
                  </div>
                </div>

                {/* Parse buttons & diagnostic outputs */}
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-mono text-stone-400">
                    {aiError ? (
                      <span className="text-amber-400 font-semibold">{aiError}</span>
                    ) : (
                      "AI otomatis menghitung nominal Rupiah"
                    )}
                  </p>
                  
                  <button
                    disabled={aiParsing || !aiInputText.trim()}
                    onClick={handleAITransactionParse}
                    className={`px-3 py-1 rounded-md text-[10px] font-mono tracking-wide font-bold uppercase transition-all select-none cursor-pointer border flex items-center gap-1 ${
                      aiInputText.trim()
                        ? "bg-indigo-900/80 border-indigo-700 text-indigo-200 hover:bg-indigo-850 active:scale-95"
                        : "bg-stone-800 border-stone-750 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    {aiParsing ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Memproses AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                        <span>Proses Nominal dengan AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MANUAL TRANSACTION WORKBENCH */}
              <form onSubmit={handleAddNewTransaction} className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 shadow-md">
                <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2.5 select-none font-bold">
                  Atau Catat Manual di Sini:
                </p>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  {/* Toggle income vs expense */}
                  <div>
                    <label className="block text-[9px] font-mono text-stone-500 uppercase mb-1">Tipe Kas</label>
                    <div className="flex h-7 rounded overflow-hidden p-[1px] bg-stone-950 border border-stone-800 shadow-inner">
                      <button
                        type="button"
                        onClick={() => { triggerSound("click", 600); setTxType("expense"); }}
                        className={`flex-1 text-[9px] font-mono tracking-tight font-bold rounded cursor-pointer ${
                          txType === "expense" 
                            ? "bg-rose-955/65 border border-rose-900/40 text-rose-400 shadow-md" 
                            : "text-stone-550 hover:text-stone-400"
                        }`}
                      >
                        Keluar (-)
                      </button>
                      <button
                        type="button"
                        onClick={() => { triggerSound("click", 850); setTxType("income"); }}
                        className={`flex-1 text-[9px] font-mono tracking-tight font-bold rounded cursor-pointer ${
                          txType === "income" 
                            ? "bg-emerald-950/65 border border-emerald-900/40 text-emerald-400 shadow-md" 
                            : "text-stone-550 hover:text-stone-400"
                        }`}
                      >
                        Masuk (+)
                      </button>
                    </div>
                  </div>

                  {/* Category dropdown choices */}
                  <div>
                    <label className="block text-[9px] font-mono text-stone-500 uppercase mb-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        triggerSound("click", 750);
                        setCategory(e.target.value as CategoryType);
                      }}
                      className="w-full h-7 bg-stone-950 border border-stone-800 rounded font-mono text-[10px] text-stone-300 px-1 focus:outline-none focus:border-amber-600 shadow-inner"
                    >
                      <option value="Makanan">☕ Makanan & Kopi</option>
                      <option value="Transportasi">🛵 Ojek & Bensin</option>
                      <option value="Belanja">🛒 Shopping & Belanja</option>
                      <option value="Hiburan">🕹️ Hiburan & Santai</option>
                      <option value="Tagihan">🔌 Wifi, Listrik, Air</option>
                      <option value="Kesehatan">💊 Obat & Vitamin</option>
                      <option value="Investasi">📈 Investasi & Emas</option>
                      <option value="Gaji">💰 Gaji & Bonus</option>
                      <option value="Lainnya">🧩 Kebutuhan Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  {/* Desription */}
                  <div>
                    <label className="block text-[9px] font-mono text-stone-500 uppercase mb-1">Butir Keterangan</label>
                    <input
                      type="text"
                      required
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="contoh: Gaji bulanan, Kopi Starbucks"
                      className="w-full h-7 bg-stone-950 border border-stone-800 rounded font-mono text-[10px] text-stone-200 px-2 focus:outline-none focus:border-amber-600 shadow-inner"
                    />
                  </div>

                  {/* Cash Amount */}
                  <div>
                    <label className="block text-[9px] font-mono text-stone-500 uppercase mb-1">Nominal (Rupiah)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Rp..."
                      className="w-full h-7 bg-stone-950 border border-stone-800 rounded font-mono text-[10px] text-stone-200 px-2 focus:outline-none focus:border-amber-600 shadow-inner"
                    />
                  </div>
                </div>

                {/* Sub notes noteText item */}
                <div className="mb-3">
                  <label className="block text-[9px] font-mono text-stone-500 uppercase mb-0.5">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Contoh: Dibayar pake uvo, bon kembalian"
                    className="w-full h-7 bg-stone-950 border border-stone-800 rounded font-mono text-[10px] text-stone-200 px-2 focus:outline-none focus:border-amber-600 shadow-inner"
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-655 border border-amber-800/80 hover:bg-amber-600 active:scale-98 transition-all hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] text-stone-900 font-mono text-xs font-black rounded-lg uppercase tracking-wider select-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-stone-900 stroke-[3]" />
                  <span>Simpan Baris Buku Kas</span>
                </button>
              </form>

            </div>
          </div>
        </div>

      </main>

      {/* FOOTER NAV DESK WRITING SURFACE INFO */}
      <footer className="w-full max-w-6xl mx-auto mt-6 bg-stone-900/60 p-3.5 border border-stone-850 rounded-2xl flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 font-mono gap-3 text-center md:text-left select-none shadow-inner" id="executive_desk_footer">
        <div>
          <p className="font-semibold text-stone-400">STATUS BUKU KAS HARIAN:</p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Menghitung otomatis • Penyimpanan Cloud Sandbox Terkendali • Fitur suara dialirkan via Web Audio API. 
          </p>
        </div>
        <div>
          <button 
            onClick={() => {
              triggerSound("click", 1200);
              alert("Buku Kas Harian v2.0 - Didesain khusus menggunakan visual skeuomorphic untuk kenyamanan pencatatan keuangan premium. Semua data disimpan secara lokal pada peramban Anda.");
            }}
            className="text-amber-500/80 hover:text-amber-400 hover:underline cursor-pointer"
          >
            Sistem Kebijakan Privasi & Desain &rarr;
          </button>
        </div>
      </footer>

      {/* PANDUAN MODAL DIALOG POPUP */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" id="guide_modal_container">
          <div className="bg-stone-900 rounded-2xl border-2 border-stone-800 p-6 max-w-md w-full relative shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
            <h3 className="text-lg font-bold text-stone-100 font-serif mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>Panduan Buku Kas Harian</span>
            </h3>
            
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Selamat datang di asisten keuangan harian berpenampilan premium. Anda dapat menggunakannya setiap hari untuk merapikan finansial dengan asisten kecerdasan buas:
            </p>

            <div className="space-y-3 font-mono text-xs text-stone-300">
              <div className="p-2.5 bg-stone-950 rounded border border-stone-800">
                <p className="text-amber-450 font-bold mb-1">1. Pena AI:</p>
                <p className="text-[11px] text-stone-450">
                  Ketik kalimat bebas seperti &ldquo;Makan siang 23rb sama ojek motor 10.000 dapet bonus 50000&rdquo;, lalu tekan enter. AI akan mengekstrak nominal bersih secara otomatis dan mendaftarkannya ke kas.
                </p>
              </div>

              <div className="p-2.5 bg-stone-950 rounded border border-stone-800">
                <p className="text-blue-400 font-bold mb-1">2. Coach Finansial AI:</p>
                <p className="text-[11px] text-stone-450">
                  Setiap kali transaksi baru dicatat, Coach kami secara otomatis meneliti rasio kas, pengeluaran terbesar, dan memberi tips praktis mingguan di terminal monitor kiri.
                </p>
              </div>

              <div className="p-2.5 bg-stone-950 rounded border border-stone-800">
                <p className="text-pink-400 font-bold mb-1">3. Kalkulator Tactile 1982:</p>
                <p className="text-[11px] text-stone-450">
                  Gunakan untuk menjumlahkan bon fisik. Hasilkan total perhitungan dengan tombol &ldquo;=&rdquo;, lantas klik &ldquo;Kirim Nominal ke Form&rdquo; untuk langsung mengisi nominal manual tanpa repot mengetik ulang.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerSound("click", 1000);
                setShowGuideModal(false);
              }}
              className="mt-5 w-full py-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 hover:text-white text-stone-200 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer uppercase tracking-wider"
            >
              Saya Mengerti, Mulai Mencatat!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
