// Final Impact - Admin Portal Gateway
// In public and open-source distributions, this gateway safely routes to an inert stub.
// In the private developer environment with local developer assets, it dynamically attaches
// the secure creator administration console.

import { AdminModal as StubModal } from './AdminModal.stub.js';

let DevModalClass = null;

// Dynamically check for local developer module if running in browser / dev mode
if (typeof window !== 'undefined') {
  try {
    import('../admin/private/AdminModal.dev.js')
      .then(mod => {
        DevModalClass = mod.AdminModal || mod.default;
      })
      .catch(() => {
        // Private developer module absent - remains inert stub
      });
  } catch (e) {
    // Unsupported or bundled
  }
}

export class AdminModal {
  constructor(game) {
    this.game = game;
    this.instance = DevModalClass ? new DevModalClass(game) : new StubModal(game);
    this.isOpen = false;
  }

  async open() {
    if (!DevModalClass && typeof window !== 'undefined') {
      try {
        const mod = await import('../admin/private/AdminModal.dev.js');
        DevModalClass = mod.AdminModal || mod.default;
        if (DevModalClass) {
          this.instance = new DevModalClass(this.game);
        }
      } catch (e) {}
    }

    if (this.instance && typeof this.instance.open === 'function') {
      this.instance.open();
      this.isOpen = !!this.instance.isOpen;
    }
  }

  close() {
    if (this.instance && typeof this.instance.close === 'function') {
      this.instance.close();
      this.isOpen = !!this.instance.isOpen;
    }
  }

  async toggle() {
    if (!DevModalClass && typeof window !== 'undefined') {
      try {
        const mod = await import('../admin/private/AdminModal.dev.js');
        DevModalClass = mod.AdminModal || mod.default;
        if (DevModalClass) {
          this.instance = new DevModalClass(this.game);
        }
      } catch (e) {}
    }

    if (this.instance && typeof this.instance.toggle === 'function') {
      this.instance.toggle();
      this.isOpen = !!this.instance.isOpen;
    }
  }
}
