/* ============================================================
   MAIN - Entry point: MPA page detection & global event listeners
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    let path = window.location.pathname;
    let page = path.split('/').pop().split('.')[0];

    if (!page || page === '' || page === 'index') {
        setTimeout(loadDashboard, 100);
    } else if (page === 'explore') {
        setTimeout(initExploreGraph, 100);
    } else if (page === 'lecturers') {
        setTimeout(loadLecturers, 100);
    } else if (page === 'publications') {
        setTimeout(loadPublications, 100);
    } else if (page === 'projects') {
        setTimeout(loadProjects, 100);
    } else if (page === 'statistics') {
        setTimeout(loadStatistics, 100);
    }
});

// Global Event Delegation for dynamically loaded navbar search
document.addEventListener('keyup', (e) => {
    if (e.target && e.target.id === 'globalSearch') {
        if (e.key === 'Enter') {
            const query = e.target.value;
            if (window.location.pathname.indexOf('explore.html') === -1) {
                window.location.href = 'explore.html?q=' + encodeURIComponent(query);
            } else {
                document.getElementById('exploreSearch').value = query;
                performSearch();
            }
        }
    }
});
