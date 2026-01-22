import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export async function sendTelegramMessage(message: string) {
    if (!BOT_TOKEN || !CHANNEL_ID) {
        console.error('Telegram configuration missing');
        return { success: false, error: 'Config missing' };
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await axios.post(url, {
            chat_id: CHANNEL_ID,
            text: message,
            parse_mode: 'HTML',
        });

        if (response.data.ok) {
            return { success: true };
        } else {
            return { success: false, error: response.data.description };
        }
    } catch (error: any) {
        console.error('Telegram API Error:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

export function formatReminderMessage(task: any, daysLeft: number) {
    const statusIcon = task.status === 'PENDING' ? '⏳' : '🚧';
    const urgentIcon = daysLeft <= 3 ? '🚨' : daysLeft <= 7 ? '⚠️' : '🔔';

    let timeMsg = '';
    if (daysLeft === 0) timeMsg = '<b>Expiring TODAY!</b>';
    else if (daysLeft < 0) timeMsg = `<b>OVERDUE by ${Math.abs(daysLeft)} days</b>`;
    else timeMsg = `Expiring in <b>${daysLeft} days</b>`;

    return `
${urgentIcon} <b>OFFICIAL REMINDER</b> ${urgentIcon}

<b>Task:</b> ${task.task_type}
<b>Title:</b> ${task.title}
<b>Department:</b> ${task.department || 'N/A'}
<b>Due Date:</b> ${new Date(task.due_date).toLocaleDateString('en-IN')}
<b>Status:</b> ${task.status} ${statusIcon}

${timeMsg}

<i>Please take necessary action. Refer to ID: ${task.id.split('-')[0]}</i>
  `.trim();
}
