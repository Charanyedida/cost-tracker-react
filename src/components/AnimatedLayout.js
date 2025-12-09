import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function AnimatedLayout({ children, className = "" }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(containerRef.current,
                { opacity: 0, scale: 0.98 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [children]); // Re-animate when children change (key change in App.js)

    return (
        <div ref={containerRef} className={`app-content ${className}`} style={{ position: 'relative', zIndex: 10 }}>
            {children}
        </div>
    );
}
