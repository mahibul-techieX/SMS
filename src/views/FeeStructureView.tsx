import React, { useState } from 'react';
import { Layers, Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { db } from '../services/db';
import { FeeCategory, FeeStructureItem, SchoolClass, ALL_CLASSES } from '../types';

export const FeeStructureView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('ANKUR');
  const [feeItems, setFeeItems] = useState<FeeStructureItem[]>(db.getFeeStructure());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // New category inputs
  const [newCategory, setNewCategory] = useState<FeeCategory>('Other Fee');
  const [newFeeType, setNewFeeType] = useState<'one-time' | 'monthly' | 'annual'>('annual');
  const [newAmount, setNewAmount] = useState<number>(1000);

  const currentClassItems = feeItems.filter((f) => String(f.classNum) === String(selectedClass));

  const handleAmountChange = (id: string, newAmt: number) => {
    setFeeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: newAmt } : item))
    );
  };

  const handleAddCategory = () => {
    const newItem: FeeStructureItem = {
      id: `FS-C${selectedClass}-${Date.now().toString().slice(-4)}`,
      classNum: selectedClass,
      feeCategory: newCategory,
      feeType: newFeeType,
      amount: newAmount
    };
    setFeeItems((prev) => [...prev, newItem]);
  };

  const handleRemoveCategory = (id: string) => {
    setFeeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveChanges = () => {
    db.updateFeeStructure(feeItems);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Class-wise Fee Structure Master</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-mono font-semibold px-2 py-0.5 rounded border border-blue-200">
              ANKUR, MUKUL & Classes 1 - 10
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional fee heads, monthly recurring tariffs, and annual examination levies
          </p>
        </div>

        <button
          onClick={handleSaveChanges}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>SAVE STRUCTURE CHANGES</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Fee structure matrix updated and committed to offline ledger successfully!</span>
        </div>
      )}

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto text-xs">
        {ALL_CLASSES.map((c) => (
          <button
            key={String(c)}
            onClick={() => setSelectedClass(c as SchoolClass)}
            className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
              selectedClass === c
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {typeof c === 'string' ? c : `Class ${c}`}
          </button>
        ))}
      </div>

      {/* Fee Table for Selected Class */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Assigned Fees for {typeof selectedClass === 'string' ? `Class ${selectedClass}` : `Class ${selectedClass}`}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {currentClassItems.length} Categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Fee Category</th>
                  <th className="py-2.5 px-4">Cadence / Type</th>
                  <th className="py-2.5 px-4 text-right">Standard Amount (₹)</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.feeCategory}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium capitalize">
                        {item.feeType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-slate-400 font-mono">₹</span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleAmountChange(item.id, Number(e.target.value))}
                          className="w-28 text-right font-mono font-bold border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-600 tabular-nums"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleRemoveCategory(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Fee Category to this Class */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Add Category to Class {selectedClass}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FeeCategory)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="Admission Fee">Admission Fee</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Book Fee">Book Fee</option>
                <option value="Examination Fee">Examination Fee</option>
                <option value="Uniform Fee">Uniform Fee</option>
                <option value="Transport Fee">Transport Fee</option>
                <option value="Computer Lab Fee">Computer Lab Fee</option>
                <option value="Other Fee">Other Fee</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Cadence</label>
              <select
                value={newFeeType}
                onChange={(e) => setNewFeeType(e.target.value as any)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="monthly">Monthly (April - March)</option>
                <option value="annual">Annual (Session Fee)</option>
                <option value="one-time">One-Time (Admission)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Tariff Amount (₹)
              </label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold"
              />
            </div>

            <button
              onClick={handleAddCategory}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
