const fetch = (...args) =>
  import("node-fetch")
    .then(({ default: f }) => f(...args))
    .catch(() => null);

async function sendTaskCompletedNotification({ task, client }) {
  const webhookUrl =
    process.env.WHATSAPP_WEBHOOK_URL || client?.whatsappGroupLink;
  if (!webhookUrl || !fetch) return;
  const payload = {
    type: "task_completed",
    title: `Task Completed: ${task.title}`,
    message: `Task "${task.title}" has been marked as done by ${
      task.assignedTo?.name || "employee"
    }.`,
    taskId: String(task._id),
    clientId: client ? String(client._id) : undefined,
  };
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // ignore webhook errors
  }
}

module.exports = { sendTaskCompletedNotification };
