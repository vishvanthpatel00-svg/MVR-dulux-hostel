(function(){
  const session = getSession();
  if(!session || session.role !== 'student'){
    window.location.href = 'login.html';
    return;
  }
  const student = getStudentById(session.id);
  if(!student){ clearSession(); window.location.href = 'login.html'; return; }

  /* ---- header / ID card ---- */
  document.getElementById('studentGreeting').textContent = student.name.split(' ')[0];
  document.getElementById('idInitials').textContent = student.name.split(' ').map(n=>n[0]).join('').slice(0,2);
  document.getElementById('idName').textContent = student.name;
  document.getElementById('idId').textContent = student.id;
  document.getElementById('idRoom').innerHTML = `<b>${student.room}</b>`;
  document.getElementById('idBlock').innerHTML = `<b>${student.block}</b>`;
  document.getElementById('idSharing').innerHTML = `<b>${student.sharing}</b>`;
  document.getElementById('idCourse').innerHTML = `<b>${student.course}</b>`;

  document.getElementById('profCourse').textContent = student.course;
  document.getElementById('profJoined').textContent = student.joined;
  document.getElementById('profGuardian').textContent = student.guardian;
  document.getElementById('profContact').textContent = student.contact;
  document.getElementById('profFee').textContent = student.feeStatus;
  document.getElementById('profBlood').textContent = student.bloodGroup;

  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    clearSession();
    window.location.href = 'index.html';
  });

  /* ---- tabs ---- */
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  const statusClass = s => 'status-' + s.toLowerCase();

  /* ---- outings ---- */
  function renderOutings(){
    const list = getOutingsFor(student.id);
    const box = document.getElementById('outingList');
    document.getElementById('outingCount').textContent = list.length;
    if(!list.length){ box.innerHTML = '<div class="empty-state">No outing requests yet. Use the form to request one.</div>'; return; }
    box.innerHTML = list.map(o => `
      <div class="list-row">
        <div class="lr-main">
          <b>${o.destination}</b>
          <span>${o.date} · ${o.timeOut} → ${o.timeIn} · ${o.reason}</span>
          ${o.remark ? `<span> · Warden note: ${o.remark}</span>` : ''}
        </div>
        <div class="lr-meta">
          <span class="status-pill ${statusClass(o.status)}">${o.status}</span><br>
          ${o.status === 'Approved' ? `<a class="btn btn-sm btn-outline" style="margin-top:8px" href="gate-pass.html?id=${o.id}">Gate pass</a>` : ''}
        </div>
      </div>`).join('');
  }
  document.getElementById('outingForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    addOuting({
      studentId: student.id,
      destination: document.getElementById('outDest').value,
      date: document.getElementById('outDate').value,
      timeOut: document.getElementById('outTimeOut').value,
      timeIn: document.getElementById('outTimeIn').value,
      reason: document.getElementById('outReason').value
    });
    e.target.reset();
    renderOutings();
    document.getElementById('outingMsg').textContent = 'Request sent to the warden. Track its status below.';
    setTimeout(()=> document.getElementById('outingMsg').textContent = '', 4000);
  });

  /* ---- reports ---- */
  function renderReports(){
    const list = getReportsFor(student.id);
    const box = document.getElementById('reportList');
    document.getElementById('reportCount').textContent = list.length;
    if(!list.length){ box.innerHTML = '<div class="empty-state">No reports submitted yet.</div>'; return; }
    box.innerHTML = list.map(r => `
      <div class="list-row">
        <div class="lr-main">
          <b>${r.category}</b>
          <span>${r.description}</span>
          ${r.remark ? `<span> · Warden note: ${r.remark}</span>` : ''}
        </div>
        <div class="lr-meta">
          <span class="status-pill ${statusClass(r.status)}">${r.status}</span><br>
          ${new Date(r.createdAt).toLocaleDateString()}
        </div>
      </div>`).join('');
  }
  document.getElementById('reportForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    addReport({
      studentId: student.id,
      category: document.getElementById('repCategory').value,
      description: document.getElementById('repDesc').value
    });
    e.target.reset();
    renderReports();
    document.getElementById('reportMsg').textContent = 'Report sent to the hostel admin.';
    setTimeout(()=> document.getElementById('reportMsg').textContent = '', 4000);
  });

  /* ---- notices ---- */
  function renderNotices(){
    const box = document.getElementById('noticeList');
    box.innerHTML = getNotices().map(n => `
      <div class="n-item">
        <div class="notice-date">${n.date}</div>
        <div class="notice-body"><b>${n.title}</b><span>${n.body}</span></div>
      </div>`).join('');
  }

  renderOutings();
  renderReports();
  renderNotices();
})();
