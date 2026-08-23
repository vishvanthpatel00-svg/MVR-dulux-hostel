(function(){
  const session = getSession();
  if(!session || session.role !== 'admin'){
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    clearSession();
    window.location.href = 'index.html';
  });

  const statusClass = s => 'status-' + s.toLowerCase();
  const nameFor = id => (getStudentById(id) || {}).name || id;
  const roomFor = id => { const s = getStudentById(id); return s ? `${s.room} · ${s.block}` : ''; };

  /* ---- tabs ---- */
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  /* ---- stats ---- */
  function renderStats(){
    const students = getStudents();
    const outings = getOutings();
    const reports = getReports();
    document.getElementById('statStudents').textContent = students.length;
    document.getElementById('statPendingOut').textContent = outings.filter(o=>o.status==='Pending').length;
    document.getElementById('statOpenReports').textContent = reports.filter(r=>r.status!=='Resolved').length;
    const dueFees = students.filter(s=>/due/i.test(s.feeStatus)).length;
    document.getElementById('statDueFees').textContent = dueFees;
  }

  /* ---- students table ---- */
  function renderStudents(){
    const q = (document.getElementById('studentSearch').value || '').toLowerCase();
    const block = document.getElementById('blockFilter').value;
    let rows = getStudents();
    if(q) rows = rows.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.room.toLowerCase().includes(q));
    if(block) rows = rows.filter(s => s.block === block);
    document.getElementById('studentTable').innerHTML = rows.map(s => `
      <tr>
        <td class="idcell">${s.id}</td>
        <td><b>${s.name}</b><br><span class="muted">${s.course}</span></td>
        <td>${s.room}<br><span class="muted">${s.block} · ${s.sharing}</span></td>
        <td>${s.contact}</td>
        <td>${s.feeStatus}</td>
      </tr>`).join('') || `<tr><td colspan="5" class="empty-state">No students match that search.</td></tr>`;
  }
  document.getElementById('studentSearch').addEventListener('input', renderStudents);
  document.getElementById('blockFilter').addEventListener('change', renderStudents);
  document.getElementById('exportStudents').addEventListener('click', ()=>{
    const csv = toCSV(getStudents(), [
      {label:'ID', get:s=>s.id}, {label:'Name', get:s=>s.name}, {label:'Course', get:s=>s.course},
      {label:'Block', get:s=>s.block}, {label:'Room', get:s=>s.room}, {label:'Sharing', get:s=>s.sharing},
      {label:'Contact', get:s=>s.contact}, {label:'Guardian', get:s=>s.guardian}, {label:'Fee Status', get:s=>s.feeStatus}
    ]);
    downloadCSV('mvr-students.csv', csv);
  });

  /* ---- outings table ---- */
  function renderOutings(){
    const rows = getOutings();
    document.getElementById('outingTable').innerHTML = rows.map(o => `
      <tr>
        <td class="idcell">${o.id}</td>
        <td><b>${nameFor(o.studentId)}</b><br><span class="muted">${roomFor(o.studentId)}</span></td>
        <td>${o.destination}<br><span class="muted">${o.reason}</span></td>
        <td>${o.date}<br><span class="muted">${o.timeOut} → ${o.timeIn}</span></td>
        <td><span class="status-pill ${statusClass(o.status)}">${o.status}</span></td>
        <td>
          <div class="row-actions">
            ${o.status==='Pending' ? `
              <button class="btn btn-sm btn-ink" data-approve="${o.id}">Approve</button>
              <button class="btn btn-sm btn-outline" data-reject="${o.id}">Reject</button>
            ` : `<span class="muted">${o.remark || '—'}</span>`}
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No outing requests yet.</td></tr>`;

    document.querySelectorAll('[data-approve]').forEach(b=>b.addEventListener('click', ()=>{
      updateOutingStatus(b.dataset.approve, 'Approved', 'Approved by warden');
      renderOutings(); renderStats();
    }));
    document.querySelectorAll('[data-reject]').forEach(b=>b.addEventListener('click', ()=>{
      const why = prompt('Reason for rejecting this outing request?') || 'Not approved';
      updateOutingStatus(b.dataset.reject, 'Rejected', why);
      renderOutings(); renderStats();
    }));
  }
  document.getElementById('exportOutings').addEventListener('click', ()=>{
    const csv = toCSV(getOutings(), [
      {label:'ID', get:o=>o.id}, {label:'Student', get:o=>nameFor(o.studentId)}, {label:'Room', get:o=>roomFor(o.studentId)},
      {label:'Destination', get:o=>o.destination}, {label:'Reason', get:o=>o.reason}, {label:'Date', get:o=>o.date},
      {label:'Out', get:o=>o.timeOut}, {label:'In', get:o=>o.timeIn}, {label:'Status', get:o=>o.status}, {label:'Remark', get:o=>o.remark}
    ]);
    downloadCSV('mvr-outings.csv', csv);
  });

  /* ---- reports table ---- */
  function renderReports(){
    const rows = getReports();
    document.getElementById('reportTable').innerHTML = rows.map(r => `
      <tr>
        <td class="idcell">${r.id}</td>
        <td><b>${nameFor(r.studentId)}</b><br><span class="muted">${roomFor(r.studentId)}</span></td>
        <td>${r.category}</td>
        <td>${r.description}</td>
        <td><span class="status-pill ${statusClass(r.status)}">${r.status}</span></td>
        <td>
          <div class="row-actions">
            ${r.status!=='Resolved' ? `
              <button class="btn btn-sm btn-ink" data-review="${r.id}">Mark reviewing</button>
              <button class="btn btn-sm btn-outline" data-resolve="${r.id}">Mark resolved</button>
            ` : `<span class="muted">${r.remark || '—'}</span>`}
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No reports submitted yet.</td></tr>`;

    document.querySelectorAll('[data-review]').forEach(b=>b.addEventListener('click', ()=>{
      updateReportStatus(b.dataset.review, 'Reviewing', '');
      renderReports(); renderStats();
    }));
    document.querySelectorAll('[data-resolve]').forEach(b=>b.addEventListener('click', ()=>{
      const note = prompt('Note on how this was resolved?') || 'Resolved';
      updateReportStatus(b.dataset.resolve, 'Resolved', note);
      renderReports(); renderStats();
    }));
  }

  /* ---- notices ---- */
  function renderNoticesAdmin(){
    document.getElementById('adminNoticeList').innerHTML = getNotices().map(n => `
      <div class="n-item"><div class="notice-date">${n.date}</div>
        <div class="notice-body"><b>${n.title}</b><span>${n.body}</span></div></div>`).join('');
  }
  document.getElementById('noticeForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    addNotice({ title: document.getElementById('noticeTitle').value, body: document.getElementById('noticeBody').value });
    e.target.reset();
    renderNoticesAdmin();
  });

  renderStats();
  renderStudents();
  renderOutings();
  renderReports();
  renderNoticesAdmin();
})();
