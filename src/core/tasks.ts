import { spawn } from 'child_process';
import chalk from 'chalk';

export interface BackgroundTask {
    id: string;
    command: string;
    status: 'running' | 'completed' | 'failed';
    startTime: number;
    endTime?: number;
    output: string;
    pid?: number;
}

class BackgroundProcessManager {
    private tasks: Map<string, BackgroundTask> = new Map();
    private queue: string[] = [];
    private maxConcurrency: number = 2;
    private activeCount: number = 0;

    /**
     * Starts a new background task (or queues it).
     */
    start(command: string): string {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const task: BackgroundTask = {
            id,
            command,
            status: 'running', // Initially 'running' but might be queued effectively
            startTime: Date.now(),
            output: ''
        };

        this.tasks.set(id, task);

        if (this.activeCount < this.maxConcurrency) {
            this._runTask(id);
        } else {
            console.log(chalk.yellow(`[Background] Task ${id} queued (Active: ${this.activeCount}/${this.maxConcurrency})`));
            this.queue.push(id);
        }

        return id;
    }

    private _runTask(id: string) {
        const task = this.tasks.get(id);
        if (!task) return;

        this.activeCount++;
        console.log(chalk.blue(`[Background] Starting task ${id}: ${task.command}`));

        const child = spawn(task.command, { shell: true });
        if (child.pid !== undefined) {
            task.pid = child.pid;
        }

        child.stdout.on('data', (data) => {
            task.output += data.toString();
        });

        child.stderr.on('data', (data) => {
            task.output += data.toString();
        });

        child.on('close', (code) => {
            task.status = code === 0 ? 'completed' : 'failed';
            task.endTime = Date.now();
            console.log(chalk.blue(`[Background] Task ${id} finished with code ${code}`));

            this.activeCount--;
            this._processQueue();
        });
    }

    private _processQueue() {
        if (this.queue.length > 0 && this.activeCount < this.maxConcurrency) {
            const nextId = this.queue.shift();
            if (nextId) {
                this._runTask(nextId);
            }
        }
    }

    getTask(id: string): BackgroundTask | undefined {
        return this.tasks.get(id);
    }

    getAllTasks(): BackgroundTask[] {
        return Array.from(this.tasks.values());
    }

    /**
     * Returns tasks that have completed since the last check.
     * Note: Queued tasks are 'running' but haven't produced output yet.
     */
    getRecentlyFinished(): BackgroundTask[] {
        return this.getAllTasks().filter(t => t.status !== 'running');
    }

    clearFinished() {
        for (const [id, task] of this.tasks.entries()) {
            if (task.status !== 'running') {
                this.tasks.delete(id);
            }
        }
    }
}

class SimpleScheduler {
    /**
     * Executes a task after a specified delay.
     */
    delay(ms: number, task: () => Promise<void> | void) {
        setTimeout(async () => {
            try {
                await task();
            } catch (err) {
                console.error('[Scheduler] Delayed task failed:', err);
            }
        }, ms);
    }
}

export const backgroundTasks = new BackgroundProcessManager();
export const scheduler = new SimpleScheduler();
