/* ============================================================

   KNOWLEDGE MAP LECTURER - Core: Globals, Auth, Init, Clock

   ============================================================ */



const API_LECTURER_BASE = '/api/lecturer';

let userInfo = null;

let currentEntitiesData = {};

let allLecturers = [];
let allExternalAuthors = [];



document.addEventListener('DOMContentLoaded', () => {

    // Check Auth

    const role = localStorage.getItem('userRole');

    if (role !== 'lecturer' && role !== 'admin') {

        window.location.href = '/user/login.html';

        return;

    }

    // Thêm link quay lại Admin nếu vai trò là admin
    if (role === 'admin') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.style.borderTop = '1px dashed rgba(255,255,255,0.15)';
            li.style.marginTop = '10px';
            li.style.paddingTop = '10px';
            li.innerHTML = `
                <a href="/admin/index.html" class="nav-link" style="color: #3b82f6;">
                    <i class="fas fa-user-shield"></i>
                    <span>Khu vực Admin</span>
                </a>
            `;
            const logoutItem = navMenu.querySelector('li:last-child');
            if (logoutItem) {
                navMenu.insertBefore(li, logoutItem);
            } else {
                navMenu.appendChild(li);
            }
        }
    }

    

    try {

        userInfo = JSON.parse(localStorage.getItem('userInfo'));

        if (!userInfo || !userInfo.id) throw new Error("Invalid UserInfo");

    } catch(e) {

        window.location.href = '/user/login.html';

        return;

    }



    // Set Welcome Text

    const elWelcome = document.getElementById('welcomeText');

    if (elWelcome) {

        if (typeof initLecturerProfile === 'function') { initLecturerProfile(); } else { elWelcome.textContent = `Xin chào, ${userInfo.name}`; }

    }



    // Load data based on page

    if (document.getElementById('page-lecturer-overview')) {

        loadLecturerProfile();

    } else if (document.getElementById('page-lecturer-publications')) {

        loadPublications();

    } else if (document.getElementById('page-lecturer-projects')) {

        loadProjects();

    }

    

    // Binding form

    const form = document.getElementById('lecturerForm');

    if (form) {

        form.addEventListener('submit', handleFormSubmit);

    }

    

    // Load all lecturers for select fields

    loadAllLecturers();
    loadAllExternalAuthors();



    // Start Clock

    updateClock();

    setInterval(updateClock, 1000);


    // Sidebar toggle (ẩn/hiện sidebar)
    const menuToggle  = document.getElementById('menuToggle');
    const sidebar     = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent?.classList.toggle('expanded');
        });
    }

});



function updateClock() {

    const el = document.getElementById('realtimeClock');

    if (!el) return;

    const now = new Date();

    el.textContent = now.toLocaleString('vi-VN', { 

        hour: '2-digit', minute: '2-digit', second: '2-digit',

        day: '2-digit', month: '2-digit', year: 'numeric' 

    });

}



async function loadAllLecturers() {

    try {

        const res = await fetch('/api/giang-vien');

        const data = await res.json();

        if (data.status === 'ok') {

            allLecturers = data.data;

        }

    } catch (e) {

        console.error(e);

    }

}



async function loadAllExternalAuthors() {

    try {

        const res = await fetch(`/api/lecturer/tac-gia-ngoai?gv_id=${userInfo ? userInfo.id : ''}`);

        const data = await res.json();

        if (data.status === 'ok') {

            allExternalAuthors = data.data;

        }

    } catch (e) {

        console.error(e);

    }

}



function logoutUser() {

    localStorage.removeItem('userRole');

    localStorage.removeItem('userInfo');

    window.location.href = '/';

}
