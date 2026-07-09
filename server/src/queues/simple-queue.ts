/**
 * Simple in-memory async queue for MVP.
 * Processes tasks sequentially with configurable concurrency.
 * 
 * TODO Phase 2: Replace with BullMQ + Redis for persistence and distributed processing.
 */

type TaskFn = () => Promise<void>;

interface QueuedTask {
  id: string;
  fn: TaskFn;
  addedAt: Date;
}

export class SimpleQueue {
  private queue: QueuedTask[] = [];
  private processing = false;
  private concurrency: number;
  private activeCount = 0;
  private name: string;

  constructor(name: string, concurrency: number = 1) {
    this.name = name;
    this.concurrency = concurrency;
  }

  add(id: string, fn: TaskFn): void {
    this.queue.push({ id, fn, addedAt: new Date() });
    console.log(`📋 [${this.name}] Queued task: ${id} (${this.queue.length} pending)`);
    this.processNext();
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.activeCount;
  }

  private async processNext(): Promise<void> {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) return;

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;
    console.log(`▶️  [${this.name}] Processing: ${task.id}`);

    try {
      await task.fn();
      console.log(`✅ [${this.name}] Completed: ${task.id}`);
    } catch (error) {
      console.error(`❌ [${this.name}] Failed: ${task.id}`, error);
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }
}
