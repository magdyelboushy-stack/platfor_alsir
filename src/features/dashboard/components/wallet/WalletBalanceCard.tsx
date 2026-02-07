import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface WalletBalanceCardProps {
    balance: number;
    totalDeposits: number;
    totalSpent: number;
}

export function WalletBalanceCard({ balance, totalDeposits, totalSpent }: WalletBalanceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white shadow-brand-500/40"
        >
            {/* Atmospheric Background Decor */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white blur-[100px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                {/* Main Balance Info */}
                <div className="flex items-center gap-8 text-center md:text-right">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/80 font-black uppercase tracking-widest text-sm">الرصيد المتاح</p>
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-lg">
                            {balance} <span className="text-2xl md:text-3xl font-bold opacity-80">ج.م</span>
                        </h3>
                    </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 group hover:bg-white/20 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <ArrowDownLeft className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-wider">إجمالي الشحن</p>
                            <p className="text-xl font-black">{totalDeposits} ج.م</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 group hover:bg-white/20 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                            <ArrowUpRight className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-wider">إجمالي الشراء</p>
                            <p className="text-xl font-black">{totalSpent} ج.م</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
