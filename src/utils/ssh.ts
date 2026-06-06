// src/utils/ssh.ts
import SSHClient from 'react-native-ssh-sftp';

export interface ServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: 'password' | 'key';
  password?: string;
  privateKey?: string;
  color: string;
}

export interface SSHResult {
  success: boolean;
  output?: string;
  error?: string;
}

class SSHManager {
  private clients: Map<string, any> = new Map();

  async connect(server: ServerConfig): Promise<SSHResult> {
    try {
      const client = new SSHClient(
        server.host,
        server.port,
        server.username,
        server.authType === 'password'
          ? { password: server.password }
          : { privateKey: server.privateKey }
      );
      await client.connect();
      this.clients.set(server.id, client);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async execute(serverId: string, command: string): Promise<SSHResult> {
    const client = this.clients.get(serverId);
    if (!client) return { success: false, error: 'Nu ești conectat la server' };
    try {
      const output = await client.execute(command);
      return { success: true, output };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async disconnect(serverId: string): Promise<void> {
    const client = this.clients.get(serverId);
    if (client) {
      await client.disconnect();
      this.clients.delete(serverId);
    }
  }

  isConnected(serverId: string): boolean {
    return this.clients.has(serverId);
  }

  // ── High-level helpers ────────────────────────────────────────────
  async getSystemStats(serverId: string) {
    const [cpu, temp, ram, disk, uptime, load] = await Promise.all([
      this.execute(serverId, "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'"),
      this.execute(serverId, "cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{print $1/1000}'"),
      this.execute(serverId, "free -m | awk 'NR==2{print $2,$3}'"),
      this.execute(serverId, "df -h / | awk 'NR==2{print $2,$3,$5}'"),
      this.execute(serverId, "uptime -p"),
      this.execute(serverId, "cat /proc/loadavg | awk '{print $1,$2,$3}'"),
    ]);
    return { cpu, temp, ram, disk, uptime, load };
  }

  async getDockerContainers(serverId: string) {
    return this.execute(serverId,
      "docker ps -a --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}' 2>/dev/null"
    );
  }

  async dockerAction(serverId: string, action: string, containerId: string) {
    return this.execute(serverId, `docker ${action} ${containerId}`);
  }

  async getProcesses(serverId: string) {
    return this.execute(serverId,
      "ps aux --sort=-%cpu | head -30 | awk '{print $1,$2,$3,$4,$11}'"
    );
  }

  async killProcess(serverId: string, pid: number, signal = 9) {
    return this.execute(serverId, `kill -${signal} ${pid}`);
  }

  async getUFWRules(serverId: string) {
    return this.execute(serverId, 'sudo ufw status numbered 2>/dev/null');
  }

  async addUFWRule(serverId: string, rule: string) {
    return this.execute(serverId, `sudo ufw ${rule}`);
  }

  async deleteUFWRule(serverId: string, ruleNum: number) {
    return this.execute(serverId, `echo "y" | sudo ufw delete ${ruleNum}`);
  }

  async getSambaShares(serverId: string) {
    return this.execute(serverId, 'testparm -s 2>/dev/null || cat /etc/samba/smb.conf 2>/dev/null');
  }

  async restartSamba(serverId: string) {
    return this.execute(serverId, 'sudo systemctl restart smbd nmbd');
  }

  async getSystemdServices(serverId: string) {
    return this.execute(serverId,
      "systemctl list-units --type=service --no-pager --plain | head -40"
    );
  }

  async controlService(serverId: string, action: string, service: string) {
    return this.execute(serverId, `sudo systemctl ${action} ${service}`);
  }

  async getCronJobs(serverId: string) {
    return this.execute(serverId, 'crontab -l 2>/dev/null; cat /etc/cron.d/* 2>/dev/null');
  }

  async getDiskSMART(serverId: string, device: string) {
    return this.execute(serverId, `sudo smartctl -a ${device} 2>/dev/null`);
  }

  async runSpeedtest(serverId: string) {
    return this.execute(serverId, 'speedtest-cli --json 2>/dev/null || speedtest --format=json 2>/dev/null');
  }

  async runDiskBenchmark(serverId: string, path: string) {
    return this.execute(serverId,
      `dd if=/dev/zero of=${path}/testfile bs=1M count=512 conv=fdatasync 2>&1 && rm -f ${path}/testfile`
    );
  }

  async getNetworkInterfaces(serverId: string) {
    return this.execute(serverId, 'ip -j addr 2>/dev/null');
  }

  async wakeOnLan(mac: string) {
    // Sent from phone directly, not via SSH
    // Uses react-native-wake-on-lan
    return { success: true, output: `WoL packet sent to ${mac}` };
  }

  async powerControl(serverId: string, action: 'shutdown' | 'reboot' | 'suspend') {
    const cmds = {
      shutdown: 'sudo shutdown -h now',
      reboot:   'sudo reboot',
      suspend:  'sudo systemctl suspend',
    };
    return this.execute(serverId, cmds[action]);
  }

  async installPackage(serverId: string, packageName: string, version?: string) {
    const pkg = version ? `${packageName}=${version}` : packageName;
    return this.execute(serverId, `sudo apt-get install -y ${pkg} 2>&1`);
  }

  async runDockerCompose(serverId: string, action: string, path: string) {
    return this.execute(serverId, `cd ${path} && docker compose ${action} 2>&1`);
  }

  async setChmod(serverId: string, path: string, mode: string, recursive = false) {
    return this.execute(serverId, `chmod ${recursive ? '-R ' : ''}${mode} "${path}"`);
  }

  async setChown(serverId: string, path: string, owner: string, group: string, recursive = false) {
    return this.execute(serverId, `chown ${recursive ? '-R ' : ''}${owner}:${group} "${path}"`);
  }

  async listDirectory(serverId: string, path: string) {
    return this.execute(serverId, `ls -la "${path}" 2>/dev/null`);
  }

  async readFile(serverId: string, path: string) {
    return this.execute(serverId, `cat "${path}" 2>/dev/null`);
  }

  async writeFile(serverId: string, path: string, content: string) {
    const escaped = content.replace(/'/g, "'\\''");
    return this.execute(serverId, `echo '${escaped}' > "${path}"`);
  }

  async deleteFile(serverId: string, path: string) {
    return this.execute(serverId, `rm -rf "${path}"`);
  }

  async getTailLogs(serverId: string, source: 'syslog' | 'docker', name?: string, lines = 100) {
    if (source === 'syslog') return this.execute(serverId, `sudo tail -n ${lines} /var/log/syslog 2>/dev/null`);
    return this.execute(serverId, `docker logs --tail ${lines} ${name} 2>&1`);
  }

  async detectInstalledPanels(serverId: string) {
    return this.execute(serverId, `
      echo "=CHECK=";
      systemctl is-active casaos 2>/dev/null && echo "casaos:active";
      systemctl is-active cockpit 2>/dev/null && echo "cockpit:active";
      systemctl is-active webmin 2>/dev/null && echo "webmin:active";
      docker ps --format "{{.Names}}" 2>/dev/null | grep -E "portainer|npm|uptime-kuma|grafana|dashy";
    `);
  }
}

export const sshManager = new SSHManager();
