const ClinicDoctor = require('@clinic/doctor');
const { spawn } = require('child_process');
const http = require('http');

const doctor = new ClinicDoctor();

console.log('🚀 Memulai Clinic Doctor programmatic...');

doctor.collect(['node', 'profiler_wrapper.js'], function (err, filepath) {
  if (err) {
    console.error('Collect error:', err);
    return;
  }
  console.log('✅ Collect selesai, menggenerate HTML...');
  doctor.visualize(filepath, filepath + '.html', function (err) {
    if (err) {
      console.error('Visualize error:', err);
      return;
    }
    console.log('🎉 Selesai! Buka ' + filepath + '.html');
  });
});

// Tunggu server jalan, tembak autocannon, lalu kill
setTimeout(() => {
  console.log('🔥 Menjalankan autocannon...');
  const ac = spawn('npx', ['autocannon', '-d', '3', 'http://localhost:5000/api/health'], { stdio: 'inherit', shell: true });
  ac.on('close', () => {
    console.log('Menghentikan server...');
    http.get('http://localhost:5000/__clinic_kill').on('error', () => {});
  });
}, 2000);
