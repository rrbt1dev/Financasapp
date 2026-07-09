import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Heart, ShoppingCart, Home, Utensils, Car, Gift, Briefcase,
  GraduationCap, Plane, Dumbbell, Smartphone, Music, Film, PawPrint,
  Baby, Wallet, TrendingUp, PiggyBank, Building2, Fuel, Shirt,
  Gamepad2, Coffee, Plus, X, Pencil, Trash2, Sprout, ArrowUpRight,
  ArrowDownRight, Check, Landmark
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const ICONS = {
  Heart, ShoppingCart, Home, Utensils, Car, Gift, Briefcase,
  GraduationCap, Plane, Dumbbell, Smartphone, Music, Film, PawPrint,
  Baby, Wallet, TrendingUp, PiggyBank, Building2, Fuel, Shirt,
  Gamepad2, Coffee, Landmark
};
const ICON_KEYS = Object.keys(ICONS);

const COLORS = [
  "#0FA968", "#F0645C", "#F4B740", "#4A90D9", "#9B6BD9",
  "#F2994A", "#14B8A6", "#E85D9A", "#6B7FD7", "#5B7A6E"
];

const uid = () => Math.random().toString(36).slice(2, 10);

const fmt = (n) =>
  (n < 0 ? "-" : "") +
  "R$ " +
  Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthLabel = (d) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

const DEFAULT_CATEGORIES = [
  { id: "saude", name: "Saúde", icon: "Heart", color: "#F0645C", type: "expense", locked: true },
  { id: "mercado", name: "Mercado", icon: "ShoppingCart", color: "#4A90D9", type: "expense", locked: true },
  { id: "casa", name: "Casa", icon: "Home", color: "#9B6BD9", type: "expense", locked: true },
  { id: "cafe", name: "Café", icon: "Coffee", color: "#F4B740", type: "expense", locked: true },
  { id: "lazer", name: "Lazer", icon: "Gamepad2", color: "#F2994A", type: "expense", locked: false },
  { id: "salario", name: "Salário", icon: "Briefcase", color: "#0FA968", type: "income", locked: true },
  { id: "freela", name: "Freelance", icon: "Landmark", color: "#14B8A6", type: "income", locked: true },
  { id: "outros_r", name: "Outros", icon: "Gift", color: "#6B7FD7", type: "income", locked: false }
];

const STORAGE_KEY = "financas:data";

function Ring({ value, max, color, size = 168, stroke = 16, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EAF6EF" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - pct * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function IconTile({ name, size = 22, color = "#0B2B22" }) {
  const Cmp = ICONS[name] || Wallet;
  return <Cmp size={size} color={color} strokeWidth={2.1} />;
}

function CategoryEditor({ initial, onCancel, onSave, onDelete, type }) {
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || ICON_KEYS[0]);
  const [color, setColor] = useState(initial?.color || COLORS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-[#0B2B22]">
            {initial ? "Editar categoria" : "Nova categoria"}
          </h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-[#F3FBF7]">
            <X size={20} color="#5B7A6E" />
          </button>
        </div>

        <label className="text-xs font-semibold text-[#5B7A6E] uppercase tracking-wide">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Transporte"
          className="w-full mt-1.5 mb-4 px-4 py-3 rounded-2xl bg-[#F3FBF7] border border-[#E1F0E7] outline-none focus:border-[#0FA968] text-[#0B2B22]"
        />

        <label className="text-xs font-semibold text-[#5B7A6E] uppercase tracking-wide">Ícone</label>
        <div className="grid grid-cols-6 gap-2 mt-1.5 mb-4">
          {ICON_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setIcon(k)}
              className={`aspect-square rounded-xl flex items-center justify-center border-2 transition ${
                icon === k ? "border-[#0FA968] bg-[#E8F8F0]" : "border-transparent bg-[#F3FBF7]"
              }`}
            >
              <IconTile name={k} size={18} color={icon === k ? "#0FA968" : "#5B7A6E"} />
            </button>
          ))}
        </div>

        <label className="text-xs font-semibold text-[#5B7A6E] uppercase tracking-wide">Cor</label>
        <div className="flex flex-wrap gap-2 mt-1.5 mb-5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-8 h-8 rounded-full flex items-center justify-center ring-offset-2 ${
                color === c ? "ring-2 ring-[#0B2B22]" : ""
              }`}
            >
              {color === c && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {initial && !initial.locked && (
            <button
              onClick={() => onDelete(initial.id)}
              className="p-3 rounded-2xl bg-[#FDEEEE] text-[#F0645C]"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            disabled={!name.trim()}
            onClick={() => onSave({ id: initial?.id || uid(), name: name.trim(), icon, color, type, locked: false })}
            className="flex-1 py-3 rounded-2xl bg-[#0FA968] text-white font-semibold disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTransaction({ type, categories, onCancel, onSave }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const cat = categories.find((c) => c.id === categoryId);

  const handleDigit = (d) => setValue((v) => (v.length > 9 ? v : v + d));
  const handleBackspace = () => setValue((v) => v.slice(0, -1));
  const numeric = value ? parseInt(value, 10) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-[#0B2B22]">
            {type === "expense" ? "Nova despesa" : "Nova renda"}
          </h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-[#F3FBF7]">
            <X size={20} color="#5B7A6E" />
          </button>
        </div>

        <div className="text-center py-3">
          <div className="text-4xl font-display font-extrabold text-[#0B2B22] tabular-nums">
            {fmt(numeric)}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-2xl border-2 ${
                categoryId === c.id ? "border-[#0FA968] bg-[#E8F8F0]" : "border-transparent bg-[#F3FBF7]"
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.color + "22" }}>
                <IconTile name={c.icon} size={17} color={c.color} />
              </div>
              <span className="text-[11px] font-medium text-[#0B2B22] whitespace-nowrap">{c.name}</span>
            </button>
          ))}
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)"
          className="w-full mb-3 px-4 py-2.5 rounded-2xl bg-[#F3FBF7] border border-[#E1F0E7] outline-none focus:border-[#0FA968] text-sm text-[#0B2B22]"
        />

        <div className="grid grid-cols-3 gap-2 mb-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"].map((k) =>
            k === "back" ? (
              <button
                key={k}
                onClick={handleBackspace}
                className="py-3 rounded-2xl bg-[#F3FBF7] flex items-center justify-center text-[#5B7A6E] font-semibold"
              >
                ⌫
              </button>
            ) : (
              <button
                key={k}
                onClick={() => handleDigit(k)}
                className="py-3 rounded-2xl bg-[#F3FBF7] text-[#0B2B22] font-semibold text-lg"
              >
                {k}
              </button>
            )
          )}
        </div>

        <button
          disabled={numeric <= 0 || !cat}
          onClick={() =>
            onSave({ id: uid(), categoryId, value: numeric, date: todayISO(), type, note: note.trim() })
          }
          className="w-full py-3.5 rounded-2xl text-white font-semibold disabled:opacity-40"
          style={{ background: type === "expense" ? "#F0645C" : "#0FA968" }}
        >
          Adicionar {type === "expense" ? "despesa" : "renda"}
        </button>
      </div>
    </div>
  );
}

export default function FinanceApp() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState("despesas");
  const [showAddTx, setShowAddTx] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [savePercent, setSavePercent] = useState(10);
  const [investPercent, setInvestPercent] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const loadedRef = useRef(false);

  // Load saved data once when the app opens
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const data = JSON.parse(res.value);
          if (data.categories) setCategories(data.categories);
          if (data.transactions) setTransactions(data.transactions);
          if (typeof data.savePercent === "number") setSavePercent(data.savePercent);
          if (typeof data.investPercent === "number") setInvestPercent(data.investPercent);
        }
      } catch (e) {
        // no saved data yet, defaults stay in place
      } finally {
        loadedRef.current = true;
        setLoading(false);
      }
    })();
  }, []);

  // Autosave whenever data changes (skips the initial load)
  useEffect(() => {
    if (!loadedRef.current) return;
    (async () => {
      try {
        const result = await window.storage.set(
          STORAGE_KEY,
          JSON.stringify({ categories, transactions, savePercent, investPercent }),
          false
        );
        setSaveError(!result);
      } catch (e) {
        setSaveError(true);
      }
    })();
  }, [categories, transactions, savePercent, investPercent]);

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0),
    [transactions]
  );
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;

  const breakdown = (type, cats) => {
    const total = type === "expense" ? totalExpense : totalIncome;
    return cats
      .map((c) => {
        const sum = transactions.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.value, 0);
        return { ...c, sum, pct: total > 0 ? Math.round((sum / total) * 100) : 0 };
      })
      .filter((c) => c.sum > 0)
      .sort((a, b) => b.sum - a.sum);
  };

  const expenseBreakdown = useMemo(() => breakdown("expense", expenseCats), [transactions, categories]);
  const incomeBreakdown = useMemo(() => breakdown("income", incomeCats), [transactions, categories]);

  const activeType = tab === "renda" ? "income" : "expense";
  const activeCats = activeType === "expense" ? expenseCats : incomeCats;
  const activeBreakdown = activeType === "expense" ? expenseBreakdown : incomeBreakdown;
  const activeTotal = activeType === "expense" ? totalExpense : totalIncome;

  const saveAmount = (totalIncome * savePercent) / 100;
  const investAmount = (totalIncome * investPercent) / 100;
  const freeAmount = balance - saveAmount - investAmount;
  const health = totalIncome > 0 ? Math.max(0, Math.min(1, balance / totalIncome)) : 0;
  const healthColor = health > 0.35 ? "#0FA968" : health > 0.1 ? "#F4B740" : "#F0645C";

  const saveCategory = (cat) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      return exists ? prev.map((c) => (c.id === cat.id ? cat : c)) : [...prev, cat];
    });
    setShowCategoryEditor(false);
    setEditingCategory(null);
  };
  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTransactions((prev) => prev.filter((t) => t.categoryId !== id));
    setShowCategoryEditor(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3FBF7] flex items-center justify-center" style={{ fontFamily: "Inter, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
        <div className="flex flex-col items-center gap-3 text-[#0FA968]">
          <Sprout size={32} className="animate-pulse" />
          <span className="text-sm font-medium text-[#5B7A6E]">Carregando seus dados…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3FBF7]" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Manrope', sans-serif; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      {saveError && (
        <div className="bg-[#FDEEEE] text-[#F0645C] text-xs font-medium text-center py-1.5">
          Não foi possível salvar agora. Suas últimas alterações podem não ter sido guardadas.
        </div>
      )}

      {/* Header */}
      <div
        className="px-5 pt-8 pb-16 rounded-b-[32px] relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B7A4C 0%, #0FA968 60%, #14B8A6 100%)" }}
      >
        <div className="flex items-center justify-between text-white/90 mb-1">
          <span className="text-xs font-medium capitalize">{monthLabel(todayISO())}</span>
          <button onClick={() => setShowResetConfirm(true)} className="p-1 -m-1">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="text-white/70 text-xs font-medium mb-1">Saldo do mês</div>
        <div className="font-display text-4xl font-extrabold text-white tabular-nums">{fmt(balance)}</div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-white/90 text-sm">
            <ArrowUpRight size={15} /> <span className="font-semibold">{fmt(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 text-sm">
            <ArrowDownRight size={15} /> <span className="font-semibold">{fmt(totalExpense)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 -mt-9">
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm">
          {[
            { id: "despesas", label: "Despesas" },
            { id: "renda", label: "Renda" },
            { id: "guardar", label: "Guardar & Investir" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                tab === t.id ? "bg-[#0FA968] text-white" : "text-[#5B7A6E]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Despesas / Renda content */}
      {(tab === "despesas" || tab === "renda") && (
        <div className="px-5 mt-5 pb-28">
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-center py-2">
              {activeBreakdown.length > 0 ? (
                <div className="relative" style={{ width: 180, height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeBreakdown}
                        dataKey="sum"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {activeBreakdown.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] text-[#5B7A6E] font-medium">
                      {activeType === "expense" ? "Total gasto" : "Total recebido"}
                    </span>
                    <span className="font-display font-extrabold text-xl text-[#0B2B22] tabular-nums">
                      {fmt(activeTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-[#5B7A6E] text-sm">
                  Nenhum lançamento ainda. Toque em + para adicionar.
                </div>
              )}
            </div>

            {activeBreakdown.length > 0 && (
              <div className="mt-3 space-y-1">
                {activeBreakdown.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 border-t border-[#F3FBF7]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: c.color + "20" }}
                      >
                        <IconTile name={c.icon} size={16} color={c.color} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#0B2B22]">{c.name}</div>
                        <div className="text-xs text-[#5B7A6E]">{c.pct}%</div>
                      </div>
                    </div>
                    <span className="font-semibold text-[#0B2B22] tabular-nums text-sm">{fmt(c.sum)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category management grid */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-semibold text-[#0B2B22]">Categorias</span>
            <span className="text-xs text-[#5B7A6E]">toque para editar</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {activeCats.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setEditingCategory(c);
                  setShowCategoryEditor(true);
                }}
                className="bg-white rounded-2xl py-3 flex flex-col items-center gap-1.5 shadow-sm relative"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: c.color + "20" }}
                >
                  <IconTile name={c.icon} size={18} color={c.color} />
                </div>
                <span className="text-[11px] font-medium text-[#0B2B22] truncate w-full text-center px-1">
                  {c.name}
                </span>
                {!c.locked && (
                  <Pencil size={10} className="absolute top-2 right-2" color="#B8CFC5" />
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryEditor(true);
              }}
              className="rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[#CBE8D8] text-[#0FA968]"
            >
              <Plus size={20} />
              <span className="text-[11px] font-medium">Nova</span>
            </button>
          </div>
        </div>
      )}

      {/* Guardar e Investir */}
      {tab === "guardar" && (
        <div className="px-5 mt-5 pb-28">
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 flex items-center gap-4">
            <Ring value={health} max={1} color={healthColor} size={110} stroke={12}>
              <Sprout size={16 + health * 26} color={healthColor} strokeWidth={2} />
            </Ring>
            <div>
              <div className="text-xs font-medium text-[#5B7A6E] mb-0.5">Saúde financeira do mês</div>
              <div className="font-display font-extrabold text-lg text-[#0B2B22]">
                {health > 0.35 ? "Ótima 🌱" : health > 0.1 ? "Atenção ⚠️" : "Apertada"}
              </div>
              <div className="text-xs text-[#5B7A6E] mt-1">
                Sobra {fmt(balance)} de {fmt(totalIncome)} recebidos
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank size={18} color="#F4B740" />
              <span className="font-semibold text-[#0B2B22]">Guardar por mês</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#5B7A6E]">{savePercent}% da renda</span>
              <span className="font-display font-bold text-[#0B2B22]">{fmt(saveAmount)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={savePercent}
              onChange={(e) => setSavePercent(Number(e.target.value))}
              className="w-full accent-[#F4B740]"
            />
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} color="#0FA968" />
              <span className="font-semibold text-[#0B2B22]">Investir por mês</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#5B7A6E]">{investPercent}% da renda</span>
              <span className="font-display font-bold text-[#0B2B22]">{fmt(investAmount)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={investPercent}
              onChange={(e) => setInvestPercent(Number(e.target.value))}
              className="w-full accent-[#0FA968]"
            />
          </div>

          <div
            className="rounded-3xl p-5 text-white"
            style={{
              background:
                freeAmount >= 0
                  ? "linear-gradient(135deg, #0B7A4C, #0FA968)"
                  : "linear-gradient(135deg, #C2453F, #F0645C)"
            }}
          >
            <div className="text-xs font-medium opacity-90 mb-1">
              {freeAmount >= 0 ? "Livre para gastar" : "Você passou do orçamento em"}
            </div>
            <div className="font-display font-extrabold text-2xl tabular-nums">{fmt(freeAmount)}</div>
            <div className="text-xs opacity-80 mt-2">
              Renda {fmt(totalIncome)} − Despesas {fmt(totalExpense)} − Guardado {fmt(saveAmount)} − Investido {fmt(investAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Floating action button */}
      {(tab === "despesas" || tab === "renda") && (
        <button
          onClick={() => setShowAddTx(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-40"
          style={{ background: activeType === "expense" ? "#F0645C" : "#0FA968" }}
        >
          <Plus size={26} />
        </button>
      )}

      {showAddTx && (
        <AddTransaction
          type={activeType}
          categories={activeCats}
          onCancel={() => setShowAddTx(false)}
          onSave={(tx) => {
            setTransactions((prev) => [...prev, tx]);
            setShowAddTx(false);
          }}
        />
      )}

      {showCategoryEditor && (
        <CategoryEditor
          initial={editingCategory}
          type={activeType}
          onCancel={() => {
            setShowCategoryEditor(false);
            setEditingCategory(null);
          }}
          onSave={saveCategory}
          onDelete={deleteCategory}
        />
      )}

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-3xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-[#0B2B22] mb-2">Limpar todos os dados?</h3>
            <p className="text-sm text-[#5B7A6E] mb-5">
              Isso vai apagar todos os seus lançamentos e categorias personalizadas. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-[#F3FBF7] text-[#0B2B22] font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCategories(DEFAULT_CATEGORIES);
                  setTransactions([]);
                  setSavePercent(10);
                  setInvestPercent(10);
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#F0645C] text-white font-semibold"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
