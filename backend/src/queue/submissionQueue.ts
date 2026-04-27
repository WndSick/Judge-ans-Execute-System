import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

const submissionQueue = new Queue("submissionQueue", {
  connection: redisConnection
});

export default submissionQueue;
