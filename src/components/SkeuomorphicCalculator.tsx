import React, { useState } from "react";
import { playClickSound } from "../utils/audio";
import { ArrowLeftRight, HelpCircle } from "lucide-react";

interface CalculatorProps {
  onSendValue: (value: number) => void;
}

export default function SkeuomorphicCalculator({ onSendValue }: CalculatorProps) {
  const [display, setDisplay] = useState<string>("0");
  const [equation, setEquation] = useState<string>("");
  const [isNewInput, setIsNewInput] = useState<boolean>(true);

  const handleKeyPress = (char: string) => {
    playClickSound(600 + Math.random() * 200, 0.04);
    
    if (display === "Error") {
      setDisplay("0");
      setIsNewInput(true);
      return;
    }

    if (/[0-9]/.test(char)) {
      if (isNewInput || display === "0") {
        setDisplay(char);
        setIsNewInput(false);
      } else {
        setDisplay(display + char);
      }
    } else if (char === ".") {
      if (isNewInput) {
        setDisplay("0.");
        setIsNewInput(false);
      } else if (!display.includes(".")) {
        setDisplay(display + ".");
      }
    }
  };

  const handleOperator = (op: string) => {
    playClickSound(500, 0.05);
    const val = parseFloat(display);
    if (isNaN(val)) return;

    setEquation(`${val} ${op} `);
    setIsNewInput(true);
  };

  const handleClear = () => {
    playClickSound(750, 0.06);
    setDisplay("0");
    setEquation("");
    setIsNewInput(true);
  };

  const handleBackspace = () => {
    playClickSound(650, 0.03);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setIsNewInput(true);
    }
  };

  const handleEvaluate = () => {
    playClickSound(900, 0.06);
    if (!equation) return;

    try {
      const parts = equation.trim().split(" ");
      if (parts.length < 2) return;

      const firstVal = parseFloat(parts[0]);
      const op = parts[1];
      const secondVal = parseFloat(display);

      if (isNaN(firstVal) || isNaN(secondVal)) {
        setDisplay("Error");
        return;
      }

      let res = 0;
      switch (op) {
        case "+":
          res = firstVal + secondVal;
          break;
        case "-":
          res = firstVal - secondVal;
          break;
        case "×":
          res = firstVal * secondVal;
          break;
        case "÷":
          if (secondVal === 0) {
            setDisplay("Error");
            setEquation("");
            setIsNewInput(true);
            return;
          }
          res = firstVal / secondVal;
          break;
        default:
          return;
      }

      // Check if integer or needs decimal truncation
      const finalVal = Number(res.toFixed(10)).toString();
      setDisplay(finalVal);
      setEquation("");
      setIsNewInput(true);
    } catch (e) {
      setDisplay("Error");
      setEquation("");
      setIsNewInput(true);
    }
  };

  const handleSendToForm = () => {
    const numericVal = Math.max(0, Math.floor(parseFloat(display)));
    if (!isNaN(numericVal) && numericVal > 0) {
      onSendValue(numericVal);
      playClickSound(1200, 0.1);
    }
  };

  return (
    <div className="relative mt-5 w-full max-w-[270px] mx-auto bg-stone-700 p-4 rounded-xl border-4 border-stone-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_15px_25px_rgba(0,0,0,0.5)] bg-linear-to-b from-stone-700 via-stone-750 to-stone-800" id="skeuo_calc_root">
      {/* Brand Text or Decorative label */}
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-mono tracking-widest text-stone-400 font-bold uppercase select-none">
          CASIO-MATE 1982
        </span>
        
        {/* Skeuomorphic Solar Panel Strip */}
        <div className="flex gap-[2px] bg-amber-950 p-[2px] rounded border border-stone-800 shadow-inner select-none h-4">
          <div className="w-3 bg-amber-900 border-r border-amber-950 opacity-90"></div>
          <div className="w-3 bg-amber-900 border-r border-amber-950 opacity-90"></div>
          <div className="w-3 bg-amber-900 border-r border-amber-950 opacity-90"></div>
          <div className="w-3 bg-amber-900 opacity-90"></div>
        </div>
      </div>

      {/* LCD screen panel */}
      <div className="relative mb-4 bg-emerald-950 p-2.5 rounded-lg border-2 border-stone-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* LCD Reflections / Glass glint */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded"></div>
        
        {/* Mini operator / equation helper */}
        <div className="h-3 text-[10px] font-mono text-emerald-400/60 text-right pr-1 tracking-tight truncate">
          {equation || ""}
        </div>
        
        {/* Main large LCD Display */}
        <div className="text-xl font-mono text-emerald-300 text-right pr-1 select-none font-bold tracking-tight glow-text truncate">
          {parseFloat(display).toLocaleString("id-ID") === "NaN" ? display : parseFloat(display).toLocaleString("id-ID")}
        </div>
      </div>

      {/* Push-button panel */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-10 text-xs font-mono font-bold text-amber-100 bg-amber-800 rounded-md shadow-[0_3px_0_#92400e,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-amber-700 border border-amber-900/40 select-none cursor-pointer"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          className="h-10 text-xs font-mono font-bold text-stone-200 bg-stone-600 rounded-md shadow-[0_3px_0_#3f3f46,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-stone-550 border border-stone-500/20 select-none cursor-pointer"
        >
          DEL
        </button>
        <button
          onClick={() => handleOperator("÷")}
          className="h-10 text-sm font-bold text-sky-200 bg-sky-900 rounded-md shadow-[0_3px_0_#075985,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-sky-850 border border-sky-950 select-none cursor-pointer"
        >
          ÷
        </button>
        <button
          onClick={() => handleOperator("×")}
          className="h-10 text-sm font-bold text-sky-200 bg-sky-900 rounded-md shadow-[0_3px_0_#075985,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-sky-850 border border-sky-950 select-none cursor-pointer"
        >
          ×
        </button>

        {/* Row 2 */}
        {[7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-10 text-sm font-mono font-bold text-stone-100 bg-stone-500 rounded-md shadow-[0_3px_0_#27272a,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-stone-450 border border-stone-600/20 select-none cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator("-")}
          className="h-10 text-sm font-bold text-sky-200 bg-sky-900 rounded-md shadow-[0_3px_0_#075985,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-sky-850 border border-sky-950 select-none cursor-pointer"
        >
          -
        </button>

        {/* Row 3 */}
        {[4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-10 text-sm font-mono font-bold text-stone-100 bg-stone-500 rounded-md shadow-[0_3px_0_#27272a,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-stone-450 border border-stone-600/20 select-none cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator("+")}
          className="h-10 text-sm font-bold text-sky-200 bg-sky-900 rounded-md shadow-[0_3px_0_#075985,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-sky-850 border border-sky-950 select-none cursor-pointer"
        >
          +
        </button>

        {/* Row 4 */}
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-10 text-sm font-mono font-bold text-stone-100 bg-stone-500 rounded-md shadow-[0_3px_0_#27272a,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-stone-450 border border-stone-600/20 select-none cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleEvaluate}
          className="h-22 font-bold text-white bg-indigo-700 rounded-md shadow-[0_3px_0_#3730a3,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-indigo-650 row-span-2 border border-indigo-900 flex items-center justify-center text-lg select-none cursor-pointer"
        >
          =
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleKeyPress("0")}
          className="h-10 text-sm font-mono font-bold text-stone-100 bg-stone-500 rounded-md shadow-[0_3px_0_#27272a,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-stone-450 border border-stone-600/20 col-span-2 select-none cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress(".")}
          className="h-10 text-sm font-mono font-bold text-stone-100 bg-stone-500 rounded-md shadow-[0_3px_0_#27272a,0_4px_6px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-none hover:bg-stone-450 border border-stone-600/20 select-none cursor-pointer"
        >
          .
        </button>
      </div>

      {/* Connect to Cash Book Ribbon Trigger */}
      <button
        onClick={handleSendToForm}
        disabled={display === "0" || display === "Error"}
        className={`w-full mt-3 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border text-[11px] font-mono tracking-tight font-bold transition-all shadow-[0_2px_4px_rgba(0,0,0,0.3)] select-none uppercase cursor-pointer ${
          display !== "0" && display !== "Error"
            ? "bg-amber-100 border-amber-300 text-stone-850 hover:bg-amber-200 hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-inner"
            : "bg-stone-600 border-stone-700 text-stone-400 cursor-not-allowed opacity-55"
        }`}
      >
        <ArrowLeftRight className="w-3.5 h-3.5 animate-pulse" />
        Kirim Nominal ke Form
      </button>
    </div>
  );
}
