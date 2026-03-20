const { sendMessage, getUserName } = require('./messenger');
const { parseIntent } = require('./openrouter');
const { findScammer, reportScammer, listScammers, deleteScammer, getCount } = require('./supabase');

// Comma-separated Facebook PSIDs of admins (set in .env)
const ADMIN_PSIDS = (process.env.ADMIN_PSIDS || '').split(',').filter(Boolean);

function isAdmin(senderId) {
  return ADMIN_PSIDS.includes(senderId);
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  });
}

async function handleMessage(senderId, messageText) {
  const text = messageText.trim();

  // --- Raw admin commands (no AI parsing needed) ---

  if (text === '!listscammers' || /^!listscammers\s+\d+$/.test(text)) {
    if (!isAdmin(senderId)) {
      return sendMessage(senderId, 'Sorry, admin only kini nga command. Wala ka permission. ');
    }
    const page = parseInt(text.split(' ')[1]) || 1;
    const { records, total } = await listScammers(page);

    if (!records.length) {
      return sendMessage(senderId, 'Wala pay mga record sa database. ');
    }

    const list = records
      .map((r, i) => `${(page - 1) * 10 + i + 1}. ${r.reported_value} (${r.type}) - ${r.report_count} report(s)`)
      .join('\n');

    return sendMessage(
      senderId,
      `Listahan sa mga Possible Scammer (Page ${page}):\n\n${list}\n\nTotal: ${total}\n\nSunod nga page: !listscammers ${page + 1}`
    );
  }

  if (/^!deletescammer\s+.+/.test(text)) {
    if (!isAdmin(senderId)) {
      return sendMessage(senderId, 'Sorry, admin only kini nga command. Wala ka permission. ');
    }
    const target = text.replace(/^!deletescammer\s+/, '').trim();
    const deleted = await deleteScammer(target);
    return sendMessage(
      senderId,
      deleted
        ? `Na-delete na ang record ni "${target}". `
        : `Wala makit-an ang record ni "${target}". Timan-i nga exact match ang gigamit.`
    );
  }

  if (text === '!scammercount') {
    const count = await getCount();
    return sendMessage(senderId, `Total nga possible scammer sa database: ${count}`);
  }

  // --- AI-based intent parsing ---

  let parsed;
  try {
    parsed = await parseIntent(text);
  } catch (err) {
    console.error('OpenRouter error:', err.response?.data || err.message);
    const msg = err.isRateLimit
      ? 'Busy ang system karon. Palihug hulata og pipila ka segundo ug subaya pag-usab.'
      : 'May problema sa aking system. Subaya pag-usab human sa gamay. Pasensya na!';
    return sendMessage(senderId, msg);
  }

  const { intent, target, type } = parsed;

  switch (intent) {
    case 'start': {
      return sendMessage(
        senderId,
        'Kumusta! Ako si ScamShield\n\nNagtabang ko sa komunidad para:\n' +
        '- Mag-record sa mga possible scammer\n' +
        '- Mag-check kung scammer ba ang isang tao o number\n\n' +
        'DISCLAIMER: Ang database nakabase lang sa mga report sa mga miyembro. ' +
        'Dili kini opisyal nga legal na dokumento. Gamiton kini bilang reference lang, dili bilang final na hatol.\n\n' +
        'Para mag-report: "Scammer to: [name/number]"\n' +
        'Para mag-check: "Scammer ba si [name/number]?"'
      );
    }

    case 'report': {
      if (!target) {
        return sendMessage(
          senderId,
          'Pwede mo ispecify ang name o number nga gusto mo i-report?\n' +
          'Pananglitan: "Scammer to: 09123456789"'
        );
      }

      const reporterName = await getUserName(senderId);
      const { record, isNew, alreadyReportedBySame } = await reportScammer(
        target,
        type || 'name',
        reporterName,
        senderId
      );

      if (alreadyReportedBySame) {
        return sendMessage(
          senderId,
          `Naa nay record ani nga "${target}".\nGi-update ang bilang sa report. Salamat!`
        );
      }

      return sendMessage(
        senderId,
        `Na-record na!\n\n` +
        `Gi-report: ${record.reported_value}\n` +
        `Gi-report ni: ${reporterName}\n` +
        `Petsa: ${formatDate(record.date_reported)}\n` +
        `Bilang ng report: ${record.report_count}\n\n` +
        `Salamat sa pag-report! Matabangan nato ang uban nga dili mahulog sa scam.`
      );
    }

    case 'check': {
      if (!target) {
        return sendMessage(
          senderId,
          'Pwede mo ispecify ang name o number nga gusto mo i-check?\n' +
          'Pananglitan: "Scammer ba si Juan Dela Cruz?"'
        );
      }

      const record = await findScammer(target);

      if (record) {
        return sendMessage(
          senderId,
          `BABALA / WARNING!\n\n` +
          `Ang "${target}" ay naka-record sa aming listahan ng mga possible na scammer.\n\n` +
          `Detalye:\n` +
          `- Na-report: ${record.reported_value}\n` +
          `- Gi-report ni: ${record.reported_by}\n` +
          `- Petsa na gi-report: ${formatDate(record.date_reported)}\n` +
          `- Bilang ng report: ${record.report_count}\n\n` +
          `Mag-ingat! Dili mosugot sa bisan unsang transaksyon hangtod ma-verify ang identity niini.`
        );
      }

      return sendMessage(
        senderId,
        `Wala pa sa listahan.\n\n` +
        `Ang "${target}" ay wala pang record sa aming scammer database.\n\n` +
        `Pero dili kini 100% garantiya nga ligtas. Mag-ingat gihapon ug i-verify ang identity ` +
        `sa bisan kinsa antes mag-transact.\n\n` +
        `Kung suspicious, pwede mo siya i-report gamit ang:\n` +
        `"Possible scammer to: ${target}"`
      );
    }

    case 'ambiguous': {
      return sendMessage(
        senderId,
        `Gusto mo ba i-report o i-check ang "${target || 'kini'}"?\n` +
        `Isulat:\n` +
        `- "i-report si ${target || '[name/number]'}" para mag-report\n` +
        `- "i-check si ${target || '[name/number]'}" para mag-check`
      );
    }

    default: {
      return sendMessage(
        senderId,
        `Dili ko masabtan ang imong mensahe.\n\n` +
        `Ari ang akong kaya:\n` +
        `- Mag-report: "Scammer to: [name/number]"\n` +
        `- Mag-check: "Scammer ba si [name/number]?"\n` +
        `- Total count: !scammercount`
      );
    }
  }
}

module.exports = { handleMessage };
