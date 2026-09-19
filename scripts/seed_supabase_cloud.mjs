import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const url = 'https://ctkkyqokpfspejvwkxtq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0a2t5cW9rcGZzcGVqdndreHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTIwMzksImV4cCI6MjEwNTM2ODAzOX0.ObXuP-ewibpcJg_rlmseod6cIBIGizbuJo7_FbIo12E';

const sb = createClient(url, key);

async function run() {
  console.log('Reading local data/org_store.json...');
  const localStore = JSON.parse(fs.readFileSync('data/org_store.json', 'utf8'));

  const payload = {
    __haziniy_store_sync__: true,
    version: Date.now(),
    updated_at: new Date().toISOString(),
    departmentsCount: localStore.departments.length,
    positionsCount: localStore.positions.length,
    employeesCount: localStore.employees.length,
    data: localStore
  };

  console.log('Pushing initial store snapshot to Supabase ai_recommendations...');
  const { data, error } = await sb.from('ai_recommendations').insert({
    recommendation_text: JSON.stringify(payload)
  }).select();

  if (error) {
    console.error('Push error:', error);
    process.exit(1);
  }

  console.log('Successfully pushed snapshot! ID:', data[0]?.id);

  console.log('Verifying fetch from Supabase...');
  const { data: rows, error: fErr } = await sb
    .from('ai_recommendations')
    .select('id, recommendation_text, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (fErr) {
    console.error('Fetch error:', fErr);
  } else {
    const syncRow = rows.find(r => r.recommendation_text && r.recommendation_text.includes('__haziniy_store_sync__'));
    if (syncRow) {
      const parsed = JSON.parse(syncRow.recommendation_text);
      console.log('FETCH SUCCESS! Supabase contains full store snapshot:');
      console.log('Departments:', parsed.data.departments.length);
      console.log('Positions:', parsed.data.positions.length);
      console.log('Employees:', parsed.data.employees.length);
      console.log('Branches:', parsed.data.branches.length);
      console.log('Has AI Analysis:', !!parsed.data.orgAnalysis);
    }
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
