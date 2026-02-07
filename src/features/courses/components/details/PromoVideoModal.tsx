import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PromoVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
}

export function PromoVideoModal({ isOpen, onClose, videoUrl }: PromoVideoModalProps) {
    if (!isOpen || !videoUrl) return null;

    // Helper to get embed URL
    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
        }
        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }
        return url;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
                onClick={onClose}
            >
                {/* Close Button */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={onClose}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 shadow-2xl"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Video Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="w-full max-w-6xl aspect-video rounded-2xl md:rounded-[3rem] overflow-hidden bg-black border-4 border-white/10 shadow-[0_0_100px_rgba(var(--brand-500-rgb),0.3)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <iframe
                        src={getEmbedUrl(videoUrl)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Promo Video"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
