import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { GeminiService, Definitions } from './services/gemini.service';
import { ChartComponent } from './chart.component';

type Tab = 'awan' | 'dasar' | 'lengkap';

@Component({
  selector: 'app-root',
  imports: [ChartComponent],
  template: `
    <div class="min-h-screen bg-green-50/50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main class="max-w-4xl mx-auto">
        
        <div class="flex justify-between items-center mb-8">
            <div></div>
            <h1 class="text-4xl sm:text-5xl font-bold text-green-800 dark:text-green-300 text-center">Med-Pharm Buddy</h1>
            <button (click)="toggleDarkMode()" class="p-2 rounded-full text-green-700 dark:text-yellow-400 hover:bg-green-100 dark:hover:bg-gray-800 transition-colors" [attr.aria-label]="isDarkMode() ? 'Activate light mode' : 'Activate dark mode'">
              @if (isDarkMode()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>
        </div>
        <p class="text-lg text-green-700 dark:text-green-400 mt-2 text-center mb-8">Kamus Kedokteran dan Farmasi Tepercaya Anda</p>
        

        <form (submit)="search($event)" class="flex gap-2 mb-8">
          <input
            #searchInput
            type="text"
            placeholder="Cari istilah medis atau farmasi..."
            class="flex-grow w-full px-4 py-3 text-lg border-2 border-green-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:border-green-400 dark:focus:border-green-500 outline-none transition-shadow bg-white dark:bg-gray-800"
            (input)="searchTerm.set(searchInput.value)"
            [value]="searchTerm()"
          />
          <button
            type="submit"
            [disabled]="loading()"
            class="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 disabled:bg-green-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            @if (loading()) {
              <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              <span>Cari</span>
            }
          </button>
        </form>
        
        @if (error()) {
          <div class="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
            <p class="font-bold">Terjadi Kesalahan</p>
            <p>{{ error() }}</p>
          </div>
        }

        @if (definitions(); as defs) {
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-6 sm:p-8 animate-fade-in">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-3xl font-bold text-green-900 dark:text-green-200 capitalize">{{ defs.term }}</h2>
              <button 
                (click)="speak(defs.term)"
                [disabled]="isSpeaking()"
                class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                [class.animate-pulse]="isSpeaking()"
                aria-label="Dengarkan pengucapan">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                </svg>
              </button>
            </div>

            <div class="border-b border-green-200 dark:border-gray-700">
              <nav class="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  (click)="activeTab.set('awan')"
                  [class]="activeTab() === 'awan' ? 'border-green-600 text-green-700 dark:text-green-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'"
                  class="whitespace-nowrap py-3 px-1 border-b-4 font-medium text-lg transition-colors focus:outline-none"
                >
                  Awan
                </button>
                <button
                  (click)="activeTab.set('dasar')"
                  [class]="activeTab() === 'dasar' ? 'border-green-600 text-green-700 dark:text-green-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'"
                  class="whitespace-nowrap py-3 px-1 border-b-4 font-medium text-lg transition-colors focus:outline-none"
                >
                  Dasar
                </button>
                <button
                  (click)="activeTab.set('lengkap')"
                  [class]="activeTab() === 'lengkap' ? 'border-green-600 text-green-700 dark:text-green-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'"
                  class="whitespace-nowrap py-3 px-1 border-b-4 font-medium text-lg transition-colors focus:outline-none"
                >
                  Lengkap
                </button>
              </nav>
            </div>

            <div class="prose dark:prose-invert max-w-none prose-green mt-6 text-gray-600 dark:text-gray-300">
              @switch (activeTab()) {
                @case ('awan') {
                  <p>{{ defs.awan }}</p>
                }
                @case ('dasar') {
                  <p>{{ defs.dasar }}</p>
                }
                @case ('lengkap') {
                  <p>{{ defs.lengkap }}</p>
                  @if (defs.visualizationData && defs.visualizationData.data.length > 0) {
                    <div class="mt-8 not-prose">
                       <h4 class="text-xl font-semibold mb-4 text-green-800 dark:text-green-300">{{ defs.visualizationData.title }}</h4>
                       <app-chart [data]="defs.visualizationData.data" [isDarkMode]="isDarkMode()" />
                    </div>
                  }
                }
              }
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  
  searchTerm = signal('');
  definitions = signal<Definitions | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<Tab>('awan');
  isDarkMode = signal<boolean>(false);
  isSpeaking = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.isDarkMode.set(localStorage.getItem('theme') === 'dark');
      effect(() => {
        if (this.isDarkMode()) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(value => !value);
  }
  
  async search(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set(null);
    this.definitions.set(null);
    
    try {
      const result = await this.geminiService.getDefinitions(this.searchTerm());
      if (result) {
        this.definitions.set(result);
        this.activeTab.set('awan');
      } else {
        this.error.set('Tidak dapat menemukan definisi untuk istilah tersebut. Silakan coba lagi.');
      }
    } catch (e: unknown) {
      const error = e as Error;
      this.error.set(error.message || 'Terjadi kesalahan tak terduga.');
    } finally {
      this.loading.set(false);
    }
  }
  
  speak(text: string) {
    if ('speechSynthesis' in window && !this.isSpeaking()) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';

      utterance.onstart = () => {
        this.isSpeaking.set(true);
      };

      utterance.onend = () => {
        this.isSpeaking.set(false);
      };

      utterance.onerror = (event) => {
        console.error('An error occurred during speech synthesis:', event);
        this.isSpeaking.set(false);
        this.error.set('Gagal memutar pengucapan audio.');
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else if (!('speechSynthesis' in window)) {
      this.error.set('Text-to-speech tidak didukung di browser Anda.');
    }
  }
}
