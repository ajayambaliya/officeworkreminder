'use client';

import { useState } from 'react';
import {
    FileUp,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { createTask } from '@/services/tasks';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            let successCount = 0;
            let failedCount = 0;

            for (const row of json as any[]) {
                try {
                    await createTask({
                        title: row.Title,
                        description: row.Description,
                        task_type: row.Type || 'OTHER',
                        status: 'PENDING',
                        start_date: row.StartDate || new Date().toISOString().split('T')[0],
                        due_date: row.DueDate,
                        department: row.Department,
                        reference_no: row.RefNo,
                        vendor: row.Vendor,
                        amount: row.Amount,
                        reminder_rules: {
                            daily: true,
                            before_days: [30, 15, 7, 1],
                            on_due_date: true,
                            overdue: true,
                            time_of_day: '09:00'
                        }
                    });
                    successCount++;
                } catch (err) {
                    console.error('Import Row Error:', err);
                    failedCount++;
                }
            }

            setResults({ success: successCount, failed: failedCount });
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { Title: 'MRI Maintenance', Description: 'Annual checkup', Type: 'AMC', StartDate: '2026-01-01', DueDate: '2026-12-31', Department: 'Radiology', RefNo: 'R-001', Vendor: 'GE Healthcare', Amount: 50000 }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Task_Import_Template.xlsx");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <Link
                    href="/tasks"
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Repository
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bulk Task Import</h1>
                <p className="text-slate-500">Upload Excel (.xlsx) files to migrate large datasets into the system.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto">
                    <FileUp className="w-10 h-10 text-blue-600" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Spreadsheet</h3>
                    <p className="text-sm text-slate-400">Drag and drop your file here, or click to browse</p>
                </div>

                <div className="flex flex-col items-center">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                        {file ? file.name : 'Choose File'}
                    </label>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-center gap-4">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                    >
                        <Download className="w-4 h-4" />
                        Download Sample Template
                    </button>
                </div>
            </div>

            {results && (
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">Import Complete</p>
                            <p className="text-sm text-slate-500">Successfully imported {results.success} tasks. {results.failed} failed.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/tasks')}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl"
                    >
                        View Tasks
                    </button>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleImport}
                    disabled={!file || loading}
                    className="flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Security-Verified Import'}
                </button>
            </div>
        </div>
    );
}
