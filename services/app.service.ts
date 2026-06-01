import { databaseService } from '@/services/database.service';

class AppService {
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      if (__DEV__) {
        console.log('[app] initializing…');
      }
      await databaseService.init();
      this.isInitialized = true;
      if (__DEV__) {
        console.log('[app] ready');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.initializationPromise = null; // Allow retry
      throw error;
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      await this.initializationPromise;
    } else {
      await this.initialize();
    }
  }
}

export const appService = new AppService();
