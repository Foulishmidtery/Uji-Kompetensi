/**
 * 🔬 Clinic.js Programmatic Profiler Runner untuk InvenTrack Server
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const args = process.argv.slice(2);
const MODE = args[0] || 'doctor';
const ENDPOINT = args[1] || '/api/health';
const DURATION = parseInt(args[2]) || 10;
const CONNECTIONS = parseInt(args[3]) || 5;
const PORT = process.env.PORT || 5000;

const VALID_MODES = ['doctor', 'flame', 'bubbleprof'];

if (MODE !== 'all' && !VALID_MODES.includes(MODE)) {
  console.error(`❌ Mode "${MODE}" tidak valid!`);
  process.exit(1);
}

function runProfile(mode) {
  return new Promise((resolve, reject) => {
    let ClinicTool;
    try {
      ClinicTool = require(`@clinic/${mode}`);
    } catch (err) {
      console.error(`❌ Module @clinic/${mode} tidak ditemukan! Pastikan clinic sudah di-install.`);
      process.exit(1);
    }

    const tool = new ClinicTool();
    const url = `http://localhost:${PORT}${ENDPOINT}`;

    console.log(`\n======================================================`);
    console.log(`🚀 Memulai profiling [${mode.toUpperCase()}] pada ${ENDPOINT}...`);
    console.log(`======================================================\n`);

    tool.collect(['node', 'profiler_wrapper.js'], function (err, filepath) {
      if (err) {
        console.error('\n❌ Collect error:', err.message);
        return reject(err);
      }
      
      console.log(`\n✅ Pengumpulan data selesai! Memproses hasil menjadi HTML...`);
      console.log(`⏳ Ini mungkin memakan waktu beberapa saat tergantung mode...\n`);
      
      tool.visualize(filepath, filepath + '.html', function (err) {
        if (err) {
          console.error('❌ Visualize error:', err.message);
          return reject(err);
        }
        
        const absolutePath = path.resolve(filepath + '.html');
        console.log(`🎉 Profiling selesai!`);
        console.log(`👉 Membuka file di browser:`);
        console.log(`   file://${absolutePath}\n`);
        
        // Auto-open di windows/mac/linux
        if (process.platform === 'win32') {
           spawn('cmd.exe', ['/c', 'start', '""', absolutePath], { detached: true, stdio: 'ignore' });
        } else {
           const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
           spawn(openCmd, [absolutePath], { detached: true, stdio: 'ignore' });
        }
        
        resolve();
      });
    });

    let isReady = false;
    function pollServer() {
      const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
        if (!isReady && res.statusCode === 200) {
          isReady = true;
          console.log(`🔥 Server siap! Memulai load test ke ${url} selama ${DURATION} detik...\n`);
          
          const acProcess = spawn('npx', ['autocannon', '-d', String(DURATION), '-c', String(CONNECTIONS), url], {
            shell: true,
            stdio: 'inherit'
          });
          
          acProcess.on('close', () => {
            console.log('\n✅ Load test selesai! Memicu graceful shutdown...');
            http.get(`http://localhost:${PORT}/__clinic_kill`).on('error', () => {});
          });
        }
      });
      
      req.on('error', () => {
        if (!isReady) {
          setTimeout(pollServer, 500);
        }
      });
    }

    pollServer();
  });
}

async function main() {
  if (MODE === 'all') {
    for (const mode of VALID_MODES) {
      try {
        await runProfile(mode);
      } catch (err) {
        console.error(`⚠️ Mode ${mode} gagal, lanjut ke berikutnya...`);
      }
    }
  } else {
    await runProfile(MODE);
  }
}

main().catch(console.error);
