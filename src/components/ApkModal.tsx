import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, ExternalLink, Copy, X, Terminal, Shield, Layers } from 'lucide-react';

interface ApkModalProps {
  onClose: () => void;
}

export const ApkModal: React.FC<ApkModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'pwabuilder' | 'capacitor'>('pwa');

  const rawUrl = window.location.href;
  const publicUrl = 'https://martinalvan.github.io/TheBackRooms/';
  const currentUrl = rawUrl.startsWith('http') ? rawUrl : publicUrl;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('Para instalar en Android:\n1. Toca los 3 puntos del navegador (Chrome).\n2. Elige "Añadir a la pantalla de inicio" o "Instalar aplicación".');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="apk-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="relative z-10 max-w-2xl w-full my-auto bg-neutral-950 border border-yellow-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-neutral-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-yellow-400">
                TRANSFORMAR A APK / INSTALAR EN ANDROID
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Convierte esta Web App en una App Nativa Android (.APK)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Tabs */}
        <div className="flex border-b border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-3 px-2 text-center font-bold border-b-2 transition-all ${
              activeTab === 'pwa'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Instalar App Directa (PWA)
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex-1 py-3 px-2 text-center font-bold border-b-2 transition-all ${
              activeTab === 'pwabuilder'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Convertir a .APK (PWABuilder)
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-3 px-2 text-center font-bold border-b-2 transition-all ${
              activeTab === 'capacitor'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. Capacitor (Android Studio)
          </button>
        </div>

        {/* Tab 1: PWA Instant Installation */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-300 leading-relaxed">
              El juego ya está configurado con **PWA (Progressive Web App)**. Funciona como una aplicación instalada en tu teléfono sin necesidad de descargar archivos APK externos de tiendas.
            </p>

            <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
              <div className="text-xs font-mono font-bold text-yellow-400 uppercase">Pasos en Android (Chrome / Edge / Brave):</div>
              <ol className="list-decimal list-inside text-xs text-neutral-300 space-y-1.5 leading-relaxed font-mono">
                <li>Abre el menú desplegable del navegador (los 3 puntos en la esquina superior derecha).</li>
                <li>Selecciona <span className="text-yellow-300 font-bold">"Añadir a la pantalla de inicio"</span> o <span className="text-yellow-300 font-bold">"Instalar aplicación"</span>.</li>
                <li>¡Listo! El juego se guardará con su propio icono de The Backrooms e interfaz a pantalla completa.</li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                onClick={handleInstallPWA}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>{deferredPrompt ? 'INSTALAR EN ESTE DISPOSITIVO AHORA' : 'VER INSTRUCCIONES DE INSTALACIÓN'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: PWABuilder 1-Click APK Generator */}
        {activeTab === 'pwabuilder' && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-300 leading-relaxed">
              Puedes convertir esta web directamente en un paquete **.APK de Android** usando la herramienta gratuita **PWABuilder** (desarrollada por Microsoft):
            </p>

            {/* URL Copy Box */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-neutral-400">URL Pública de tu Web App (para PWABuilder):</div>
              <div className="flex items-center justify-between gap-2 bg-black p-2.5 rounded-lg border border-neutral-800">
                <span className="text-xs font-mono text-yellow-300 truncate">{publicUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-2 text-xs text-neutral-300 font-mono">
              <div className="font-bold text-yellow-400 uppercase">Cómo generar tu APK en 1 minuto:</div>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>Copia la URL pública de arriba (o la URL de tu repositorio subido a <strong>GitHub Pages / Vercel / Netlify</strong>).</li>
                <li>Visita el sitio gratuito <span className="text-yellow-300 font-bold">PWABuilder.com</span> o <span className="text-yellow-300 font-bold">WebIntoApp.com</span>.</li>
                <li>Pega la URL y haz clic en <span className="text-yellow-300 font-bold">"Build My APK"</span>.</li>
                <li>Descarga el archivo <span className="text-green-400 font-bold">.APK</span> listo para instalar en cualquier Android.</li>
              </ol>
            </div>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-mono font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>IR A PWABUILDER.COM</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Tab 3: Capacitor Native Build */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-300 leading-relaxed">
              Si quieres compilar el proyecto nativamente desde el código fuente para generar un APK oficial firmado en Android Studio:
            </p>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-mono space-y-1.5">
              <div className="font-bold text-yellow-400">⚠️ Solución a "could not determine executable to run":</div>
              <p>• <strong>Diferencia clave entre NPX y NPM:</strong> Asegúrate de escribir <code className="bg-black/60 px-1 py-0.5 rounded text-yellow-300">npx cap init</code> (con <strong>X</strong>), NO <code className="bg-black/60 px-1 py-0.5 rounded text-red-400">npm cap init</code>.</p>
              <p>• <strong>Ubicación del proyecto:</strong> Debes ejecutar los comandos dentro de la carpeta extraída de tu proyecto (donde esté el archivo <code className="text-yellow-300">package.json</code>).</p>
              <p>• <strong>Alternativa sin comandos:</strong> Recuerda que puedes usar la <strong>Opción 2 (PWABuilder)</strong> copiando la URL del juego para generar el APK sin instalar Node.js ni usar la consola.</p>
            </div>

            <div className="p-4 bg-black border border-neutral-800 rounded-2xl font-mono text-xs text-green-400 space-y-2 overflow-x-auto">
              <div className="text-neutral-500">// 1. Requisito: Descarga e instala Node.js LTS desde nodejs.org y reinicia PowerShell</div>
              <div className="text-neutral-500">// 2. Instalar Capacitor en el proyecto:</div>
              <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
              <div className="text-neutral-500">// 3. Inicializar y añadir Android:</div>
              <div>npx cap init "Backrooms" "com.backrooms.infinito"</div>
              <div>npx cap add android</div>
              <div className="text-neutral-500">// 4. Compilar el juego y sincronizar:</div>
              <div>npm run build</div>
              <div>npx cap sync android</div>
              <div className="text-neutral-500">// 5. Abrir en Android Studio para generar el .APK:</div>
              <div>npx cap open android</div>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <Shield className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>Con Capacitor, el juego tiene acceso completo a sensores, mandos Bluetooth y pantalla completa táctil nativa.</span>
            </div>
          </div>
        )}

        {/* Footer Close */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold rounded-xl transition-colors"
          >
            ENTENDIDO / CERRAR
          </button>
        </div>

      </div>
    </div>
  );
};
