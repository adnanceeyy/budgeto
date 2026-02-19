import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

class DatabaseService {
  private dbNative: any = null;
  private isWeb = Platform.OS === 'web';

  async init() {
    if (this.isWeb) {
      if (!localStorage.getItem('antigravity_categories')) {
        this.seedWeb();
      }
      return;
    }

    this.dbNative = await SQLite.openDatabaseAsync('antigravity.db');
    await this.dbNative.execAsync(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT, icon TEXT, color TEXT, budget REAL
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT, amount REAL, category_id INTEGER, note TEXT, date TEXT
            );
            CREATE TABLE IF NOT EXISTS debts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person TEXT, amount REAL, type TEXT, note TEXT, date TEXT, status TEXT
            );
        `);
  }

  private seedWeb() {
    const cats = [
      { id: 1, name: 'Dining & Food', icon: 'utensils', color: '#6366F1', budget: 600 },
      { id: 2, name: 'Fuel & Transit', icon: 'car', color: '#22D3EE', budget: 250 },
      { id: 3, name: 'Gadgets & Tech', icon: 'cpu', color: '#F472B6', budget: 400 },
      { id: 4, name: 'Paycheck', icon: 'banknote', color: '#34D399', budget: 0 }
    ];
    const txs = [
      { id: 101, type: 'income', amount: 4500, category_id: 4, note: 'Freelance Payout', date: new Date().toISOString() },
      { id: 102, type: 'expense', amount: 32.50, category_id: 1, note: 'Starbucks Coffee', date: new Date().toISOString() },
      { id: 103, type: 'expense', amount: 15.00, category_id: 2, note: 'Bus Pass', date: new Date().toISOString() }
    ];
    const debts = [
      { id: 1, person: 'Alex Smith', amount: 50.0, type: 'owed_to_me', note: 'Lunch', date: new Date().toISOString(), status: 'pending' },
      { id: 2, person: 'Rental Agency', amount: 1200.0, type: 'i_owe', note: 'Security Deposit', date: new Date().toISOString(), status: 'pending' }
    ];
    localStorage.setItem('antigravity_categories', JSON.stringify(cats));
    localStorage.setItem('antigravity_transactions', JSON.stringify(txs));
    localStorage.setItem('antigravity_debts', JSON.stringify(debts));
  }

  async wipeData() {
    if (this.isWeb) {
      localStorage.clear();
      this.seedWeb();
      return;
    }
    await this.dbNative.runAsync('DELETE FROM transactions');
    await this.dbNative.runAsync('DELETE FROM categories');
    await this.dbNative.runAsync('DELETE FROM debts');
  }

  async getCategories() {
    if (this.isWeb) {
      return JSON.parse(localStorage.getItem('antigravity_categories') || '[]');
    }
    return await this.dbNative.getAllAsync('SELECT * FROM categories');
  }

  async addCategory(cat: { name: string; icon: string; color: string; budget: number }) {
    if (this.isWeb) {
      const cats = JSON.parse(localStorage.getItem('antigravity_categories') || '[]');
      const newCat = { ...cat, id: Date.now() };
      cats.push(newCat);
      localStorage.setItem('antigravity_categories', JSON.stringify(cats));
      return newCat;
    }
    const result = await this.dbNative.runAsync(
      'INSERT INTO categories (name, icon, color, budget) VALUES (?, ?, ?, ?)',
      [cat.name, cat.icon, cat.color, cat.budget]
    );
    return { ...cat, id: result.lastInsertRowId };
  }

  async updateCategory(id: number, cat: { name: string; icon: string; color: string; budget: number }) {
    if (this.isWeb) {
      const cats = JSON.parse(localStorage.getItem('antigravity_categories') || '[]');
      const index = cats.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        cats[index] = { ...cat, id };
        localStorage.setItem('antigravity_categories', JSON.stringify(cats));
      }
      return;
    }
    await this.dbNative.runAsync(
      'UPDATE categories SET name = ?, icon = ?, color = ?, budget = ? WHERE id = ?',
      [cat.name, cat.icon, cat.color, cat.budget, id]
    );
  }

  async deleteCategory(id: number) {
    if (this.isWeb) {
      let cats = JSON.parse(localStorage.getItem('antigravity_categories') || '[]');
      cats = cats.filter((c: any) => c.id !== id);
      localStorage.setItem('antigravity_categories', JSON.stringify(cats));
      return;
    }
    await this.dbNative.runAsync('DELETE FROM categories WHERE id = ?', [id]);
    await this.dbNative.runAsync('DELETE FROM transactions WHERE category_id = ?', [id]);
  }

  async getTransactions() {
    if (this.isWeb) {
      const txs = JSON.parse(localStorage.getItem('antigravity_transactions') || '[]');
      const cats = await this.getCategories();
      return txs.map((t: any) => ({
        ...t,
        category_name: cats.find((c: any) => c.id === t.category_id)?.name,
        category_color: cats.find((c: any) => c.id === t.category_id)?.color
      }));
    }
    return await this.dbNative.getAllAsync('SELECT t.*, c.name as category_name, c.color as category_color FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ORDER BY date DESC');
  }

  async addTransaction(tx: any) {
    if (this.isWeb) {
      const txs = JSON.parse(localStorage.getItem('antigravity_transactions') || '[]');
      const newTx = { ...tx, id: Date.now() };
      txs.unshift(newTx);
      localStorage.setItem('antigravity_transactions', JSON.stringify(txs));
      return;
    }
    await this.dbNative.runAsync(
      'INSERT INTO transactions (type, amount, category_id, note, date) VALUES (?, ?, ?, ?, ?)',
      [tx.type, tx.amount, tx.category_id, tx.note, tx.date]
    );
  }

  async deleteTransaction(id: number) {
    if (this.isWeb) {
      let txs = JSON.parse(localStorage.getItem('antigravity_transactions') || '[]');
      txs = txs.filter((t: any) => t.id !== id);
      localStorage.setItem('antigravity_transactions', JSON.stringify(txs));
      return;
    }
    await this.dbNative.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  }

  async updateTransaction(id: number, tx: any) {
    if (this.isWeb) {
      const txs = JSON.parse(localStorage.getItem('antigravity_transactions') || '[]');
      const index = txs.findIndex((t: any) => t.id === id);
      if (index !== -1) {
        txs[index] = { ...txs[index], ...tx };
        localStorage.setItem('antigravity_transactions', JSON.stringify(txs));
      }
      return;
    }
    await this.dbNative.runAsync(
      'UPDATE transactions SET type = ?, amount = ?, category_id = ?, note = ?, date = ? WHERE id = ?',
      [tx.type, tx.amount, tx.category_id, tx.note, tx.date, id]
    );
  }

  // Debt Methods
  async getDebts() {
    if (this.isWeb) {
      return JSON.parse(localStorage.getItem('antigravity_debts') || '[]');
    }
    return await this.dbNative.getAllAsync('SELECT * FROM debts ORDER BY date DESC');
  }

  async addDebt(debt: any) {
    if (this.isWeb) {
      const debts = JSON.parse(localStorage.getItem('antigravity_debts') || '[]');
      const newDebt = { ...debt, id: Date.now() };
      debts.unshift(newDebt);
      localStorage.setItem('antigravity_debts', JSON.stringify(debts));
      return;
    }
    await this.dbNative.runAsync(
      'INSERT INTO debts (person, amount, type, note, date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [debt.person, debt.amount, debt.type, debt.note, debt.date, debt.status]
    );
  }

  async deleteDebt(id: number) {
    if (this.isWeb) {
      let debts = JSON.parse(localStorage.getItem('antigravity_debts') || '[]');
      debts = debts.filter((d: any) => d.id !== id);
      localStorage.setItem('antigravity_debts', JSON.stringify(debts));
      return;
    }
    await this.dbNative.runAsync('DELETE FROM debts WHERE id = ?', [id]);
  }

  async updateDebtStatus(id: number, status: string) {
    if (this.isWeb) {
      const debts = JSON.parse(localStorage.getItem('antigravity_debts') || '[]');
      const index = debts.findIndex((d: any) => d.id === id);
      if (index !== -1) {
        debts[index].status = status;
        localStorage.setItem('antigravity_debts', JSON.stringify(debts));
      }
      return;
    }
    await this.dbNative.runAsync('UPDATE debts SET status = ? WHERE id = ?', [status, id]);
  }
}

export const dbService = new DatabaseService();
export const initDatabase = () => dbService.init();
