const { execSync } = require("child_process");

const ports = [
  ...Array.from({ length: 11 }, (_, index) => 3000 + index),
  5000,
  5001,
];

const isWindows = process.platform === "win32";
const killed = new Set();

function run(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function stopWindowsPort(port) {
  const output = run(`netstat -ano -p tcp | findstr :${port}`);
  const pids = output
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).pop())
    .filter((pid) => pid && /^\d+$/.test(pid) && pid !== "0");

  for (const pid of new Set(pids)) {
    if (killed.has(pid)) continue;
    run(`taskkill /PID ${pid} /F`);
    killed.add(pid);
    console.log(`Stopped PID ${pid} on port ${port}`);
  }
}

function stopUnixPort(port) {
  const output = run(`lsof -ti tcp:${port}`);
  const pids = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const pid of new Set(pids)) {
    if (killed.has(pid)) continue;
    run(`kill -9 ${pid}`);
    killed.add(pid);
    console.log(`Stopped PID ${pid} on port ${port}`);
  }
}

for (const port of ports) {
  if (isWindows) {
    stopWindowsPort(port);
  } else {
    stopUnixPort(port);
  }
}

if (killed.size === 0) {
  console.log("No project dev ports were running.");
} else {
  console.log(`Stopped ${killed.size} process${killed.size === 1 ? "" : "es"}.`);
}
