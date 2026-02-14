/**
 * Simple Request Queue to serialize chat operations per session.
 * This prevents concurrent writes to the same session memory and ensures consistency.
 */

type Task = () => Promise<void>;

class RequestQueue {
    private queues: Map<string, Promise<void>> = new Map();

    /**
     * Enqueues a task for a specific session.
     * The task will run only after previous tasks for the same session complete.
     */
    async enqueue<T>(session: string, task: () => Promise<T>): Promise<T> {
        const currentQueue = this.queues.get(session) || Promise.resolve();

        const nextTask = currentQueue.then(async () => {
            try {
                return await task();
            } catch (err) {
                console.error(`[Queue] Task failed for session ${session}:`, err);
                throw err;
            }
        });

        // Update the queue to point to the latest task
        // We catch errors here to ensure that one failing task doesn't block the entire queue forever
        this.queues.set(session, nextTask.then(() => { }).catch(() => { }));

        return nextTask;
    }
}

export const globalChatQueue = new RequestQueue();
