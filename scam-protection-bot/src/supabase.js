const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Search for a scammer by name or number (partial/fuzzy match).
 * Used for user-facing "check" queries.
 */
async function findScammer(value) {
  const { data, error } = await supabase
    .from('scammers')
    .select('*')
    .ilike('reported_value', `%${value}%`)
    .order('report_count', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('findScammer error:', error);
    return null;
  }

  return data;
}

/**
 * Exact case-insensitive lookup. Used internally to detect duplicates.
 */
async function findScammerExact(value) {
  const { data, error } = await supabase
    .from('scammers')
    .select('*')
    .ilike('reported_value', value)
    .maybeSingle();

  if (error) {
    console.error('findScammerExact error:', error);
    return null;
  }

  return data;
}

/**
 * Report a scammer. Returns { record, isNew, alreadyReportedBySame }.
 * reporterName = display name (Facebook name)
 * reporterId   = PSID, used for duplicate detection in the reporters array
 */
async function reportScammer(reportedValue, type, reporterName, reporterId) {
  const existing = await findScammerExact(reportedValue);

  if (existing) {
    const alreadyReportedBySame = existing.reporters.includes(reporterId);
    const updatedReporters = alreadyReportedBySame
      ? existing.reporters
      : [...existing.reporters, reporterId];

    const { data, error } = await supabase
      .from('scammers')
      .update({
        report_count: alreadyReportedBySame
          ? existing.report_count
          : existing.report_count + 1,
        reporters: updatedReporters,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) console.error('reportScammer update error:', error);
    return { record: data || existing, isNew: false, alreadyReportedBySame };
  }

  const { data, error } = await supabase
    .from('scammers')
    .insert({
      reported_value: reportedValue,
      type: type || 'name',
      reported_by: reporterName,
      date_reported: new Date().toISOString(),
      report_count: 1,
      reporters: [reporterId],
    })
    .select()
    .single();

  if (error) console.error('reportScammer insert error:', error);
  return { record: data, isNew: true, alreadyReportedBySame: false };
}

/**
 * List all scammers, paginated.
 */
async function listScammers(page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('scammers')
    .select('*', { count: 'exact' })
    .order('report_count', { ascending: false })
    .range(from, to);

  if (error) console.error('listScammers error:', error);
  return { records: data || [], total: count || 0 };
}

/**
 * Delete a scammer record by name or number (exact match).
 */
async function deleteScammer(value) {
  const existing = await findScammerExact(value);
  if (!existing) return false;

  const { error } = await supabase
    .from('scammers')
    .delete()
    .eq('id', existing.id);

  if (error) {
    console.error('deleteScammer error:', error);
    return false;
  }

  return true;
}

/**
 * Get total count of reported scammers.
 */
async function getCount() {
  const { count, error } = await supabase
    .from('scammers')
    .select('*', { count: 'exact', head: true });

  if (error) console.error('getCount error:', error);
  return count || 0;
}

module.exports = { findScammer, reportScammer, listScammers, deleteScammer, getCount };
