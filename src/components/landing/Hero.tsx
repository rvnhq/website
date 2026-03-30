import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Plasma from '@/components/ui/Plasma';

export default function Hero() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [accentColor, setAccentColor] = useState<string>('#00C8DC');

    useEffect(() => {
        const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        if (computedColor.startsWith('#')) {
            setAccentColor(computedColor);
        }
    }, []);

    return (
        <section className="hero" aria-label="Hero">
            {/* Three.js scene mounts here - currently a tinted background */}
            <div
                ref={canvasRef}
                className="hero-canvas"
                aria-hidden="true"
            >
                {/* <Silk
                    speed={5}
                    scale={1.125}
                    color={accentColor}
                    noiseIntensity={1.5}
                    rotation={0}
                /> */}
                <Plasma
                    color={accentColor}
                    speed={0.69}
                    direction="forward"
                    scale={1}
                    opacity={0.69}
                    mouseInteractive={false}
                />
            </div>

            {/* Content */}
            <div className="hero-content">
                {/* <div className="hero-eyebrow">
                    <span className="badge badge-accent">
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'inline-block',
                            }}
                        />
                        Open source · Self-hosted
                    </span>
                </div> */}

                {/* <img
                    src={theme === 'dark' ? '/raven-logo-dark.png' : '/raven-logo-light.png'}
                    alt="Raven"
                    className="hero-brand-logo"
                /> */}

                <h1 className="text-display hero-title">
                    Server monitoring<br />
                    <span style={{ color: 'var(--fg-muted)', fontWeight: 300 }}>without the complexity.</span>
                </h1>

                <div className="hero-actions">
                    <a href="/docs/installation" className="btn btn-primary btn-lg">
                        Get started
                        <ArrowRight size={16} />
                    </a>
                    <a
                        href="https://github.com/rvnhq/raven"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-lg"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        View on GitHub
                    </a>
                </div>
            </div>
        </section>
    );
}
