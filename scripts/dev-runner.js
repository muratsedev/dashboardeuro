const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const workspacePath = process.cwd();
const nextCliPath = path.join(workspacePath, "node_modules", "next", "dist", "bin", "next");
const lockFilePath = path.join(workspacePath, ".next", "dev", "lock");
const SYSTEM_CMD_TIMEOUT_MS = 8000;

function runSync(command, args, extraOptions = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
    timeout: SYSTEM_CMD_TIMEOUT_MS,
    maxBuffer: 10 * 1024 * 1024,
    ...extraOptions,
  });

  if (result.error) {
    if (result.error.code === "ETIMEDOUT") {
      console.warn(`[dev-runner] Timed out running: ${command} ${args.join(" ")}`);
    }
    return null;
  }

  return result;
}

function parsePortArg(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--port" || arg === "-p") {
      const value = argv[i + 1];
      if (value && !value.startsWith("-")) {
        const parsed = Number(value);
        if (Number.isInteger(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }

    if (arg.startsWith("--port=")) {
      const parsed = Number(arg.slice("--port=".length));
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return 3000;
}

function getListeningPidsWindows(port) {
  const result = runSync("netstat", ["-ano", "-p", "tcp"]);

  if (!result || result.status !== 0 || !result.stdout) {
    return [];
  }

  const lines = result.stdout.split(/\r?\n/);
  const pids = new Set();

  for (const line of lines) {
    if (!line.includes("LISTENING") || !line.includes(`:${port}`)) {
      continue;
    }

    const parts = line.trim().split(/\s+/);
    const pid = Number(parts[parts.length - 1]);

    if (Number.isInteger(pid) && pid > 0 && pid !== process.pid) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function getListeningPidsUnix(port) {
  const result = runSync("lsof", ["-ti", `tcp:${port}`]);

  if (!result || result.status !== 0 || !result.stdout) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map((v) => Number(v.trim()))
    .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
}

function getListeningPids(port) {
  if (process.platform === "win32") {
    return getListeningPidsWindows(port);
  }

  return getListeningPidsUnix(port);
}

function getWorkspaceNextDevPids() {
  if (process.platform === "win32") {
    const escapedWorkspacePath = workspacePath.replace(/\\/g, "\\\\").replace(/'/g, "''");
    const escapedNextCliPath = nextCliPath.replace(/\\/g, "\\\\").replace(/'/g, "''");
    const query = [
      "$workspace = '" + escapedWorkspacePath + "'",
      "$nextCli = '" + escapedNextCliPath + "'",
      "Get-CimInstance Win32_Process | Where-Object {",
      "  $_.ProcessId -ne " + process.pid,
      "  -and $_.Name -match '^(node|node\\.exe)$'",
      "  -and $_.CommandLine",
      "  -and $_.CommandLine.Contains($workspace)",
      "  -and $_.CommandLine.Contains($nextCli)",
      "  -and $_.CommandLine.Contains(' dev')",
      "} | Select-Object -ExpandProperty ProcessId",
    ].join("; ");

    const result = runSync("powershell", ["-NoProfile", "-Command", query]);

    if (!result || result.status !== 0 || !result.stdout) {
      return [];
    }

    return result.stdout
      .split(/\r?\n/)
      .map((value) => Number(value.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
  }

  const result = runSync("pgrep", ["-af", "next/dist/bin/next dev"]);

  if (!result || result.status !== 0 || !result.stdout) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .filter((line) => line.includes(workspacePath) && line.includes(nextCliPath))
    .map((line) => Number(line.trim().split(/\s+/)[0]))
    .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
}

function killPid(pid) {
  if (process.platform === "win32") {
    const result = runSync("taskkill", ["/PID", String(pid), "/F"]);

    return !!result && result.status === 0;
  }

  try {
    process.kill(pid, "SIGKILL");
    return true;
  } catch {
    return false;
  }
}

function clearPort(port) {
  const pids = getListeningPids(port);

  for (const pid of pids) {
    const ok = killPid(pid);
    if (ok) {
      console.log(`[dev-runner] Freed port ${port} by stopping PID ${pid}.`);
    }
  }
}

function clearWorkspaceNextDev() {
  const pids = getWorkspaceNextDevPids();

  for (const pid of pids) {
    const ok = killPid(pid);
    if (ok) {
      console.log(`[dev-runner] Stopped existing next dev PID ${pid} for this workspace.`);
    }
  }
}

function clearStaleLock() {
  if (!fs.existsSync(lockFilePath)) {
    return;
  }

  const activePids = getWorkspaceNextDevPids();
  if (activePids.length > 0) {
    return;
  }

  fs.rmSync(lockFilePath, { force: true });
  console.log("[dev-runner] Removed stale .next/dev/lock file.");
}

function run() {
  const forwardedArgs = process.argv.slice(2);
  const port = parsePortArg(forwardedArgs);

  clearPort(port);
  clearWorkspaceNextDev();
  clearStaleLock();

  const child = spawn(process.execPath, [nextCliPath, "dev", "--webpack", ...forwardedArgs], {
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

run();
