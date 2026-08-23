/* ============================================================
   MVR DULUX BOYS HOSTEL — data layer
   --------------------------------------------------------------
   DEMO DATA STORE. Everything here lives in the browser's
   localStorage so the site is fully functional the moment you
   open it — no server needed to try it out. Open the Student
   Portal and the Admin Portal in two tabs of the SAME browser
   and you'll see outing requests / reports flow between them
   live, because they share one localStorage.

   IMPORTANT — before this goes live with real student data:
   localStorage lives only in one browser on one device, and the
   demo passwords below are stored in plain text in this file,
   visible to anyone who views the page source. That's fine for
   a demo, not for a real hostel roll with real students. See
   README.md for how to swap this file for a real backend
   (Supabase, the same approach used on srimedhaedu.in) without
   touching any other page.
   ============================================================ */

const DB_KEYS = {
  students: 'mvr_students',
  outings:  'mvr_outings',
  reports:  'mvr_reports',
  notices:  'mvr_notices',
  session:  'mvr_session'
};

const SEED_STUDENTS = [
  {
    id: 'MVR24-101',
    username: 'arjun101',
    password: 'hostel@123',
    name: 'Arjun Reddy',
    course: 'B.Tech ECE, II Year',
    block: 'A Block',
    room: 'A-204',
    sharing: '4-Sharing',
    joined: '2025-06-14',
    guardian: 'S. Reddy (father) · 9876543210',
    contact: '9000011101',
    feeStatus: 'Paid up to Dec 2026',
    bloodGroup: 'B+'
  },
  {
    id: 'MVR24-102',
    username: 'karthik102',
    password: 'hostel@123',
    name: 'Karthik Rao',
    course: 'B.Tech CSE, III Year',
    block: 'B Block',
    room: 'B-311',
    sharing: '5-Sharing',
    joined: '2024-07-02',
    guardian: 'M. Rao (father) · 9876501234',
    contact: '9000011102',
    feeStatus: 'Paid up to Dec 2026',
    bloodGroup: 'O+'
  },
  {
    id: 'MVR24-103',
    username: 'sameer103',
    password: 'hostel@123',
    name: 'Sameer Khan',
    course: 'B.Tech Mechanical, I Year',
    block: 'C Block',
    room: 'C-108',
    sharing: '8-Sharing',
    joined: '2026-06-20',
    guardian: 'A. Khan (father) · 9876512345',
    contact: '9000011103',
    feeStatus: 'Due — ₹9,000 pending',
    bloodGroup: 'A+'
  }
];

const SEED_NOTICES = [
  { date: '2026-08-20', title: 'Mess menu updated for the week', body: 'Friday dinner changed to paneer butter masala. Full menu on the notice board outside the mess hall.' },
  { date: '2026-08-18', title: 'Water tank cleaning — B Block', body: 'B Block water supply will pause 10 AM–1 PM on Aug 24 for scheduled tank cleaning.' },
  { date: '2026-08-12', title: 'Outing pass timing reminder', body: 'All outings must end by 8:00 PM on weekdays and 9:30 PM on weekends. Late returns need a warden call.' }
];

function seedIfEmpty(key, seed){
  if(!localStorage.getItem(key)){
    localStorage.setItem(key, JSON.stringify(seed));
  }
}
function initDB(){
  seedIfEmpty(DB_KEYS.students, SEED_STUDENTS);
  seedIfEmpty(DB_KEYS.outings, []);
  seedIfEmpty(DB_KEYS.reports, []);
  seedIfEmpty(DB_KEYS.notices, SEED_NOTICES);
}
initDB();

function readStore(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } }
function writeStore(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

/* ---------- students ---------- */
function getStudents(){ return readStore(DB_KEYS.students); }
function findStudentByLogin(username, password){
  return getStudents().find(s => s.username.toLowerCase() === username.trim().toLowerCase() && s.password === password);
}
function getStudentById(id){ return getStudents().find(s => s.id === id); }

/* ---------- outings ---------- */
function getOutings(){ return readStore(DB_KEYS.outings).sort((a,b)=> b.createdAt.localeCompare(a.createdAt)); }
function getOutingsFor(studentId){ return getOutings().filter(o => o.studentId === studentId); }
function addOuting(entry){
  const all = readStore(DB_KEYS.outings);
  const rec = {
    id: 'OUT-' + Date.now().toString(36).toUpperCase(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    remark: '',
    ...entry
  };
  all.push(rec);
  writeStore(DB_KEYS.outings, all);
  return rec;
}
function updateOutingStatus(id, status, remark){
  const all = readStore(DB_KEYS.outings);
  const rec = all.find(o => o.id === id);
  if(rec){ rec.status = status; rec.remark = remark || rec.remark; rec.decidedAt = new Date().toISOString(); }
  writeStore(DB_KEYS.outings, all);
}

/* ---------- reports ---------- */
function getReports(){ return readStore(DB_KEYS.reports).sort((a,b)=> b.createdAt.localeCompare(a.createdAt)); }
function getReportsFor(studentId){ return getReports().filter(r => r.studentId === studentId); }
function addReport(entry){
  const all = readStore(DB_KEYS.reports);
  const rec = {
    id: 'RPT-' + Date.now().toString(36).toUpperCase(),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    remark: '',
    ...entry
  };
  all.push(rec);
  writeStore(DB_KEYS.reports, all);
  return rec;
}
function updateReportStatus(id, status, remark){
  const all = readStore(DB_KEYS.reports);
  const rec = all.find(r => r.id === id);
  if(rec){ rec.status = status; rec.remark = remark || rec.remark; }
  writeStore(DB_KEYS.reports, all);
}

/* ---------- notices ---------- */
function getNotices(){ return readStore(DB_KEYS.notices).sort((a,b)=> b.date.localeCompare(a.date)); }
function addNotice(entry){
  const all = readStore(DB_KEYS.notices);
  all.push({ date: new Date().toISOString().slice(0,10), ...entry });
  writeStore(DB_KEYS.notices, all);
}

/* ---------- session ---------- */
function setSession(role, id){ sessionStorage.setItem(DB_KEYS.session, JSON.stringify({ role, id })); }
function getSession(){ try{ return JSON.parse(sessionStorage.getItem(DB_KEYS.session)); }catch(e){ return null; } }
function clearSession(){ sessionStorage.removeItem(DB_KEYS.session); }

/* ---------- csv export ---------- */
function toCSV(rows, columns){
  const head = columns.map(c=>c.label).join(',');
  const body = rows.map(r => columns.map(c => {
    let v = c.get(r); v = (v===undefined||v===null) ? '' : String(v).replace(/"/g,'""');
    return /[,"\n]/.test(v) ? `"${v}"` : v;
  }).join(',')).join('\n');
  return head + '\n' + body;
}
function downloadCSV(filename, csv){
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
