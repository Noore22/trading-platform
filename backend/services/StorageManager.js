const fs = require('fs').promises;
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../storage');
const DATA_DIR = path.join(__dirname, '../data');

class Mutex {
    constructor() {
        this.locked = false;
        this.queue = [];
    }

    async acquire() {
        if (!this.locked) {
            this.locked = true;
            return;
        }
        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next();
        } else {
            this.locked = false;
        }
    }
}

const fileLocks = new Map();
const cache = new Map();

function getMutex(filename) {
    if (!fileLocks.has(filename)) {
        fileLocks.set(filename, new Mutex());
    }
    return fileLocks.get(filename);
}

class StorageManager {
    static async init() {
        try {
            await fs.mkdir(STORAGE_DIR, { recursive: true });
        } catch (err) { }
    }

    static async _ensureFile(collectionName) {
        const filePath = path.join(STORAGE_DIR, `${collectionName}.json`);
        try {
            await fs.access(filePath);
            return filePath;
        } catch (err) {
            let seedData = [];
            try {
                const oldDataPath = path.join(DATA_DIR, `${collectionName}.js`);
                delete require.cache[require.resolve(oldDataPath)];
                seedData = require(oldDataPath);
            } catch (seedErr) {
                seedData = [];
            }
            await fs.writeFile(filePath, JSON.stringify(seedData, null, 2), 'utf-8');
            return filePath;
        }
    }

    static async loadToCache(collectionName) {
        await this.init();
        const mutex = getMutex(collectionName);
        await mutex.acquire();
        try {
            const filePath = await this._ensureFile(collectionName);
            const data = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(data);
            cache.set(collectionName, parsed);
            return parsed;
        } catch (err) {
            console.error(`Storage read error for ${collectionName}:`, err);
            return [];
        } finally {
            mutex.release();
        }
    }

    static async read(collectionName) {
        if (cache.has(collectionName)) {
            return cache.get(collectionName);
        }
        return await this.loadToCache(collectionName);
    }

    static getCache(collectionName) {
        return cache.get(collectionName);
    }

    static async write(collectionName, data) {
        cache.set(collectionName, data);
        await this.init();
        const mutex = getMutex(collectionName);
        await mutex.acquire();
        try {
            const filePath = await this._ensureFile(collectionName);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (err) {
            console.error(`Storage write error for ${collectionName}:`, err);
            throw err;
        } finally {
            mutex.release();
        }
    }

    static saveBackground(collectionName) {
        if (!cache.has(collectionName)) return;

        if (!this.saveTimers) this.saveTimers = new Map();
        
        if (this.saveTimers.has(collectionName)) {
            clearTimeout(this.saveTimers.get(collectionName));
        }

        const timer = setTimeout(() => {
            this.write(collectionName, cache.get(collectionName)).catch(err => {
                console.error(`Background save failed for ${collectionName}:`, err);
            });
            this.saveTimers.delete(collectionName);
        }, 5000); // 5 second debounce

        this.saveTimers.set(collectionName, timer);
    }
}

module.exports = StorageManager;
