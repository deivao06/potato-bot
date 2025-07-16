import { AuthenticationState, AuthenticationCreds } from 'baileys';
import { initAuthCreds } from 'baileys/lib/Utils/auth-utils';
import { promises as fs } from 'fs';
import path from 'path';

interface AuthData {
  creds: AuthenticationCreds;
  keys: {
    [keyType: string]: { [id: string]: any };
  };
}

export class SingleFileAuthState {
  private filePath: string;
  private authData: AuthData;

  constructor(filePath: string = './auth_state.json') {
    this.filePath = path.resolve(filePath);
    this.authData = this.createEmptyAuthData();
  }

  private createEmptyAuthData(): AuthData {
    // Use Baileys' built-in function to generate proper credentials with crypto keys
    const creds = initAuthCreds();
    
    return {
      creds: creds,
      keys: {
        'pre-key': {},
        'session': {},
        'sender-key': {},
        'app-state-sync-key': {},
        'app-state-sync-version': {},
        'sender-key-memory': {}
      }
    };
  }

  /**
   * Load authentication state from file
   */
  async loadAuthState(): Promise<AuthenticationState> {
    try {
      // Check if auth file exists
      const exists = await fs.access(this.filePath).then(() => true).catch(() => false);
      
      if (exists) {
        const data = await fs.readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(data);
        
        // Validate and merge with default structure
        this.authData = {
          creds: parsed.creds || ({} as AuthenticationCreds),
          keys: {
            'pre-key': parsed.keys?.['pre-key'] || {},
            'session': parsed.keys?.['session'] || {},
            'sender-key': parsed.keys?.['sender-key'] || {},
            'app-state-sync-key': parsed.keys?.['app-state-sync-key'] || {},
            'app-state-sync-version': parsed.keys?.['app-state-sync-version'] || {},
            'sender-key-memory': parsed.keys?.['sender-key-memory'] || {}
          }
        };
        
        console.log('✅ Loaded existing auth state from', this.filePath);
      } else {
        console.log('📝 No existing auth state found, creating new one');
        this.authData = this.createEmptyAuthData();
      }
    } catch (error) {
      console.error('❌ Error loading auth state:', error);
      console.log('📝 Creating fresh auth state');
      this.authData = this.createEmptyAuthData();
    }

    const authState = {
      creds: this.authData.creds,
      keys: {
        get: async (type: any, ids: any) => {
          const key = type as string;
          const data = this.authData.keys[key] || {};
          
          if (Array.isArray(ids)) {
            const result: { [id: string]: any } = {};
            for (const id of ids) {
              if (data[id]) {
                result[id] = data[id];
              }
            }
            return result;
          } else {
            return data[ids] ? { [ids]: data[ids] } : {};
          }
        },

        set: async (data: any) => {
          for (const category in data) {
            const key = category as string;
            const items = data[key];
            
            if (!this.authData.keys[key]) {
              this.authData.keys[key] = {};
            }
            
            for (const id in items) {
              const value = items[id];
              if (value === null || value === undefined) {
                delete this.authData.keys[key][id];
              } else {
                this.authData.keys[key][id] = value;
              }
            }
          }
          
          // Auto-save after each set operation
          await this.saveAuthState();
        }
      }
    };

    // Update creds reference when it changes
    Object.defineProperty(authState, 'creds', {
      get: () => this.authData.creds,
      set: (newCreds: any) => {
        this.authData.creds = newCreds;
        this.saveAuthState();
      }
    });

    return authState;
  }

  /**
   * Save authentication state to file
   */
  async saveAuthState(): Promise<void> {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Save to temp file first, then rename for atomic operation
      const tempPath = `${this.filePath}.tmp`;
      await fs.writeFile(
        tempPath, 
        JSON.stringify(this.authData, null, 2), 
        'utf-8'
      );
      
      // Atomic rename
      await fs.rename(tempPath, this.filePath);
      
      console.log('💾 Auth state saved');
    } catch (error) {
      console.error('❌ Error saving auth state:', error);
    }
  }

  /**
   * Update credentials
   */
  updateCreds(creds: AuthenticationCreds): void {
    this.authData.creds = creds;
  }

  /**
   * Get save credentials function for Baileys
   */
  getSaveCredsFunction() {
    return async () => {
      await this.saveAuthState();
    };
  }

  /**
   * Clear auth state (for logout)
   */
  async clearAuthState(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
      console.log('🗑️  Auth state cleared');
    } catch (error) {
      console.error('❌ Error clearing auth state:', error);
    }
  }
}

/**
 * Create single file auth state - replacement for useMultiFileAuthState
 */
export async function useSingleFileAuthState(filePath?: string): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  clearAuth: () => Promise<void>;
}> {
  const authState = new SingleFileAuthState(filePath);
  const state = await authState.loadAuthState();
  
  return {
    state,
    saveCreds: authState.getSaveCredsFunction(),
    clearAuth: () => authState.clearAuthState()
  };
}