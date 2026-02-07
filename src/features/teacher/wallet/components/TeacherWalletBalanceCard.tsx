import { motion } from 'framer-motion';
import { Wallet, Clock, DollarSign } from 'lucide-react';

interface TeacherWalletBalanceCardProps {
    balance: number;
    totalEarnings: number;
    pendingWithdrawals: number;
}

export function TeacherWalletBalanceCard({ balance, totalEarnings, pendingWithdrawals }: TeacherWalletBalanceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)]"
        >
            {/* Atmospheric Background Decor */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white blur-[100px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                {/* Main Balance Info */}
                <div className="flex items-center gap-8 text-center md:text-right">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-2xl">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/80 font-black uppercase tracking-widest text-sm">الرصيد المتاح للسحب</p>
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-lg">
                            {balance.toLocaleString()} <span className="text-2xl md:text-3xl font-bold opacity-80">ج.م</span>
                        </h3>
                    </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
                    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 group hover:bg-white/20 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                            <DollarSign className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-wider">إجمالي الأرباح</p>
                            <p className="text-xl font-black">{totalEarnings.toLocaleString()} ج.م</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 group hover:bg-white/20 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <Clock className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-wider">طلبات معلقة</p>
                            <p className="text-xl font-black">{pendingWithdrawals.toLocaleString()} ج.م</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
