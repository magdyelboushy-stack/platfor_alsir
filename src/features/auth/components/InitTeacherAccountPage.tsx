import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type Status = 'idle' | 'running' | 'success' | 'already_exists' | 'error';

export function InitTeacherAccountPage() {
    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState<string>('');
    const { registerStaff } = useAuthStore();

    const runInit = async () => {
        if (status === 'running') return;
        setStatus('running');
        setMessage('');

        try {
            // 1) Prepare form data with fixed teacher credentials
            const form = new FormData();
            form.append('name', 'Super Admin');
            form.append('email', 'admin@App.com');
            form.append('password', 'Admin@123456');
            form.append('phone', '01000000001');
            form.append('role', 'admin');
            form.append('bio', 'Admin Account');

            // Add dummy 100x100 pixels white PNG photo to satisfy backend requirement (Min 50x50)
            const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnUlEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL4Ma4AAAfF79fEAAAAASUVORK5CYII=';
            const byteCharacters = atob(dummyPngBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const dummyBlob = new Blob([byteArray], { type: 'image/png' });
            form.append('profile_photo', dummyBlob, 'default_avatar.png');

            await registerStaff(form);

            setStatus('success');
            setMessage('تم إنشاء حساب الأدمن بنجاح (admin@App.com / Admin@123456).');
        } catch (err: any) {
            const data = err?.response?.data;

            // لو الإيميل موجود بالفعل نعتبرها نجاح عملياً
            const emailErrors: string[] | undefined = data?.errors?.email;
            const emailMsg = (emailErrors && emailErrors[0]) || data?.message || '';
            if (emailMsg && /taken|exist|مستخدم بالفعل|موجود بالفعل/i.test(emailMsg)) {
                setStatus('already_exists');
                setMessage('الحساب موجود بالفعل. جرب تسجيل الدخول بـ admin@App.com');
                return;
            }

            setStatus('error');
            setMessage(data?.message || 'فشل في إنشاء الحساب.');
        }
    };

    // شغّل الإنشاء مرة واحدة تلقائياً عند فتح الصفحة
    useEffect(() => {
        runInit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)]" dir="rtl">
            <div className="max-w-lg w-full mx-4 p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl">
                <h1 className="text-2xl font-black mb-4 text-center">تهيئة حساب الأدمن</h1>

                <p className="mb-4 text-sm text-[var(--text-secondary)] text-center">
                    سيتم إنشاء حساب أدمن بالبيانات التالية:
                    <br />
                    <span className="font-bold">البريد:</span> <span className="font-mono">admin@App.com</span>
                    <br />
                    <span className="font-bold">الرقم السري:</span> <span className="font-mono">Admin@123456</span>
                </p>

                <div className="mt-6 mb-4 text-center">
                    {status === 'running' && (
                        <p className="text-sm font-bold text-cyan-400">جاري إنشاء الحساب... انتظر لحظات.</p>
                    )}
                    {status === 'success' && (
                        <p className="text-sm font-bold text-emerald-400 whitespace-pre-line">{message}</p>
                    )}
                    {status === 'already_exists' && (
                        <p className="text-sm font-bold text-amber-400 whitespace-pre-line">{message}</p>
                    )}
                    {status === 'error' && (
                        <p className="text-sm font-bold text-red-400 whitespace-pre-line">{message}</p>
                    )}
                    {status === 'idle' && (
                        <p className="text-sm font-bold text-[var(--text-secondary)]">
                            اضغط على الزر بالأسفل لو لم يبدأ التنفيذ تلقائياً.
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={runInit}
                    disabled={status === 'running'}
                    className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {status === 'running' ? 'جاري التنفيذ...' : 'تشغيل إنشاء حساب المدرس'}
                </button>

                <p className="mt-4 text-xs text-center text-[var(--text-secondary)]">
                    بعد التأكد من وجود الحساب، يمكنك تجاهل هذا الرابط أو حذفه من الـ routes.
                </p>
            </div>
        </div>
    );
}

export default InitTeacherAccountPage;

