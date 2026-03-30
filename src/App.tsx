import { useState } from 'react';
import { Toaster } from 'sonner';
import { Transcriber } from './components/Transcriber';
import { Game } from './components/Game';
import { PhoneticTable } from './components/PhoneticTable';
import { cn } from './lib/utils';
import { Languages, Gamepad2, Info, Table, Globe } from 'lucide-react';
import { DIALECTS } from './constants';

type Tab = 'transcriber' | 'game' | 'about' | 'table';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [dialect, setDialect] = useState(DIALECTS[0].id);

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Toaster position="top-center" richColors />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F8F8F7]/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
              <Languages className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-serif italic tracking-tight">Fonética PT-BR</h1>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Estudo de Dialetos</p>
            </div>
          </div>

          <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
            <button
              onClick={() => setActiveTab('game')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'game' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden md:inline">Jogar</span>
            </button>
            <button
              onClick={() => setActiveTab('transcriber')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'transcriber' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline">Conversor</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'table' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Table className="w-4 h-4" />
              <span className="hidden md:inline">Tabela</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'about' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Info className="w-4 h-4" />
              <span className="hidden md:inline">Sobre</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-200">
            <Globe className="w-4 h-4 text-zinc-400" />
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              {DIALECTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'transcriber' && <Transcriber dialect={dialect} setDialect={setDialect} />}
        {activeTab === 'game' && <Game dialect={dialect} />}
        {activeTab === 'table' && <PhoneticTable />}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-12 py-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-serif italic">Sobre o Projeto</h2>
              <p className="text-xl text-zinc-600 leading-relaxed">
                Este programa foi desenvolvido para auxiliar estudantes e entusiastas da linguística no aprendizado da transcrição fonética da língua portuguesa utilizando o Alfabeto Fonético Internacional (AFI).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Funcionalidades</h3>
                <ul className="space-y-3 text-zinc-700">
                  <li className="flex gap-3">
                    <span className="text-zinc-300">•</span>
                    <span>Transcrição automática via IA (Gemini)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-300">•</span>
                    <span>Suporte a variações regionais (R forte, S chiado, etc)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-300">•</span>
                    <span>Modo de jogo gamificado com 4 níveis de dificuldade</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-300">•</span>
                    <span>Teclado AFI integrado para facilitar a entrada</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-mono">O Alfabeto Fonético</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  O AFI é um sistema de notação fonética baseado no alfabeto latino, criado pela Associação Fonética Internacional como uma forma padronizada de representar os sons da linguagem falada. No português, ele é essencial para distinguir variações como o "o" aberto [ɔ] e fechado [o], ou o "r" vibrante [r] e o gutural [ʁ].
                </p>
              </div>
            </div>

            <div className="p-8 bg-zinc-900 rounded-3xl text-white flex items-center justify-between">
              <div>
                <h4 className="text-lg font-serif italic mb-1">Pronto para começar?</h4>
                <p className="text-zinc-400 text-sm">Teste seus conhecimentos agora mesmo.</p>
              </div>
              <button
                onClick={() => setActiveTab('game')}
                className="px-8 py-3 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
              >
                Ir para o Jogo
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-400 text-sm font-mono">© 2026 Fonética PT-BR • Educacional</p>
          <div className="flex gap-8">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 text-sm transition-colors">Documentação</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 text-sm transition-colors">Termos</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 text-sm transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
