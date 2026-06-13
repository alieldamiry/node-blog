import { Queue, Worker } from "bullmq";

const connection = { host: "localhost", port: 6379 };

const myQueue = new Queue("test-queue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Add 5 jobs
for (let i = 1; i <= 5; i++) {
  await myQueue.add("greet", { name: `Job ${i}` });
}

// Process them
const worker = new Worker(
  "test-queue",
  async (job) => {
    console.log(`Processing: ${job.data.name}`);
  },
  { connection },
);

worker.on("completed", (job) => console.log(`Done: ${job.id}`));
worker.on("failed", (job, err) => console.error(`Failed: ${job.id}`, err));
