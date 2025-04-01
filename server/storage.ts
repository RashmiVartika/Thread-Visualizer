import { type Concept, type InsertConcept } from "@shared/schema";

export interface IStorage {
  getConcepts(): Promise<Concept[]>;
  getConcept(id: number): Promise<Concept | undefined>;
  createConcept(concept: InsertConcept): Promise<Concept>;
}

export class MemStorage implements IStorage {
  private concepts: Map<number, Concept>;
  private currentId: number;

  constructor() {
    this.concepts = new Map();
    this.currentId = 1;

    // Add initial mock data
    const mockConcepts: InsertConcept[] = [
      {
        title: "Synchronization",
        description: "Thread synchronization is a mechanism which ensures that two or more concurrent threads do not simultaneously execute some particular program segment known as a critical section.",
        code: `public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}`,
        threadConfig: {
          minThreads: 2,
          maxThreads: 5,
          defaultThreads: 3
        }
      },
      {
        title: "Deadlock",
        description: "A deadlock occurs when two or more threads are blocked forever, waiting for each other to release resources.",
        code: `public class DeadlockExample {
    private Object lock1 = new Object();
    private Object lock2 = new Object();

    public void method1() {
        synchronized(lock1) {
            synchronized(lock2) {
                // Critical section
            }
        }
    }

    public void method2() {
        synchronized(lock2) {
            synchronized(lock1) {
                // Critical section
            }
        }
    }
}`,
        threadConfig: {
          minThreads: 2,
          maxThreads: 2,
          defaultThreads: 2
        }
      },
      {
        title: "Producer-Consumer",
        description: "The Producer-Consumer pattern demonstrates thread cooperation where producer threads create data and consumer threads process it using a shared buffer.",
        code: `public class Buffer {
    private Queue<Integer> queue = new LinkedList<>();
    private int capacity = 2;

    public synchronized void produce(int item) {
        while (queue.size() == capacity) {
            wait();  // Buffer is full
        }
        queue.add(item);
        notifyAll();
    }

    public synchronized int consume() {
        while (queue.isEmpty()) {
            wait();  // Buffer is empty
        }
        int item = queue.remove();
        notifyAll();
        return item;
    }
}`,
        threadConfig: {
          minThreads: 2,
          maxThreads: 4,
          defaultThreads: 3
        }
      },
      {
        title: "Semaphore",
        description: "Semaphores are used to control access to a shared resource using a counter, useful for implementing resource pools and limiting concurrent access.",
        code: `public class ResourcePool {
    private Semaphore semaphore;
    private List<Resource> resources;

    public ResourcePool(int size) {
        semaphore = new Semaphore(size);
        resources = new ArrayList<>(size);
    }

    public Resource acquire() throws InterruptedException {
        semaphore.acquire();
        return getResource();
    }

    public void release(Resource resource) {
        returnResource(resource);
        semaphore.release();
    }
}`,
        threadConfig: {
          minThreads: 2,
          maxThreads: 6,
          defaultThreads: 4
        }
      }
    ];

    mockConcepts.forEach(concept => this.createConcept(concept));
  }

  async getConcepts(): Promise<Concept[]> {
    return Array.from(this.concepts.values());
  }

  async getConcept(id: number): Promise<Concept | undefined> {
    return this.concepts.get(id);
  }

  async createConcept(concept: InsertConcept): Promise<Concept> {
    const id = this.currentId++;
    const newConcept = { ...concept, id };
    this.concepts.set(id, newConcept);
    return newConcept;
  }
}

export const storage = new MemStorage();