const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('HTTP Status Code:', res.statusCode);
    
    // Check exact markers in the rendered DOM in sequential order
    const markers = [
      { name: '01. Hero', query: 'Mastery' },
      { name: '02. Partners', query: 'Trusted by over 100 leading companies worldwide' },
      { name: '03. Top Categories', query: 'EXPLORE DISCIPLINARY PATHS' },
      { name: '04. About Learning Center', query: '# ABOUT THE PLATFORM' },
      { name: '05. Top Courses (with New Releases)', query: 'New Releases' },
      { name: '06. Live Events & Exams', query: 'Live Sessions &amp; Exams' },
      { name: '07. Product Showcase', query: 'Authentic Learning Platform' },
      { name: '08. Learning Journey', query: 'STEP-BY-STEP ROADMAP' },
      { name: '09. Top Instructors', query: 'GLOBAL PRACTITIONERS' },
      { name: '10. Testimonials', query: 'PROVEN SUCCESS' },
      { name: '11. FAQ', query: 'Frequently Asked Questions' },
      { name: '12. Final CTA', query: 'Ready to Advance Your Technical Career?' },
      { name: '13. Blogs', query: 'Latest Insights' },
      { name: '14. Footer', query: 'All rights reserved.' },
    ];

    console.log('\n--- HOMEPAGE SECTION ORDER VERIFICATION ---');
    let lastIndex = -1;
    let orderPass = true;

    for (const marker of markers) {
      let idx = data.indexOf(marker.query);
      if (idx === -1) {
        const unescaped = marker.query.replace(/&amp;/g, '&');
        idx = data.indexOf(unescaped);
      }
      const found = idx !== -1;
      const ordered = found && idx > lastIndex;
      console.log(`[${found ? (ordered ? 'PASS' : 'ORDER_FAIL') : 'MISSING'}] ${marker.name} -> Index: ${idx}`);
      if (!found || !ordered) {
        orderPass = false;
      }
      if (found) {
        lastIndex = idx;
      }
    }

    console.log('\n--- UNWANTED DUPLICATE SECTIONS CHECK ---');
    const overviewPresent = data.includes('Comprehensive Platform Overview') || data.includes('Explore Our Platform Capabilities');
    const newCoursesPresent = data.includes('Fresh Off the Press') || data.includes('Newest Additions');
    console.log('Overview Section standalone in HTML:', overviewPresent ? 'FOUND (FAIL)' : 'ABSENT (PASS)');
    console.log('NewCourses Section standalone in HTML:', newCoursesPresent ? 'FOUND (FAIL)' : 'ABSENT (PASS)');

    console.log('\nOverall Structural Order Result:', (orderPass && !overviewPresent && !newCoursesPresent) ? 'ALL PASS' : 'FAILED');
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
