"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Award, BarChart3, ChevronRight, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';

// 定義資料型別
interface PaaItem {
  PAA: string;
  TIMES: number;
  ANSWER: string;
}

export default function Dashboard() {
  const [data, setData] = useState<PaaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const brands = ["老協珍", "田原香", "娘家", "芳茲", "農純鄉"];

  // --- 核心邏輯：直接讀取 CSV ---
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/paa.csv'); // 讀取 public/paa.csv
        const reader = response.body?.getReader();
        const result = await reader?.read();
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result?.value);
        
        // 使用 PapaParse 解析
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // 自動將 TIMES 轉為數字
          complete: (results) => {
            setData(results.data as PaaItem[]);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('讀取 CSV 失敗:', error);
        setLoading(false);
      }
    };

    fetchCSV();
  }, []);

  // 條件 1：排序前五名的 PAA
  const topFivePAA = useMemo(() => {
    return [...data].sort((a, b) => b.TIMES - a.TIMES).slice(0, 5);
  }, [data]);

  // 條件 2：根據品牌分類
  const getBrandData = (brandName: string) => {
    return data.filter(item => item.PAA.includes(brandName));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
          <p className="text-slate-500 font-medium">正在解析 CSV 數據...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* 導覽列與主內容 (與之前相同，僅 data 變為動態) */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-1.5 rounded-lg text-white"><BarChart3 size={20} /></div>
            <span className="font-bold text-xl tracking-tight">MarketInsights <span className="text-amber-500">PAA</span></span>
          </div>
          <div className="text-sm text-slate-400">動態 CSV 模式</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 品牌區塊 (必要條件 2) */}
          <div className="lg:col-span-8 space-y-10">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Award className="text-amber-600" /> 品牌專屬洞察</h2>
            <div className="grid grid-cols-1 gap-6">
              {brands.map((brand) => {
                const brandItems = getBrandData(brand);
                return (
                  <section key={brand} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-700">{brand}</h3>
                      <span className="px-3 py-1 bg-white text-xs font-semibold rounded-full border border-slate-200 text-slate-500">{brandItems.length} 則問詢</span>
                    </div>
                    <div className="p-6 space-y-4">
                      {brandItems.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                            <MessageSquare size={14} className="text-blue-400" />{item.PAA}
                          </h4>
                          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap pl-6">{item.ANSWER}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          {/* 最常見 PAA (必要條件 1) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="text-amber-400" />
                <h2 className="text-xl font-bold">最常見 PAA</h2>
              </div>
              <div className="space-y-8">
                {topFivePAA.map((item, index) => (
                  <div key={index} className="group cursor-default">
                    <div className="text-amber-400 text-xs font-black mb-1">0{index + 1}</div>
                    <div className="font-medium group-hover:text-amber-200 transition-colors">{item.PAA}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">搜尋頻次: {item.TIMES}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}