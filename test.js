const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function test() {
  try {
    const script = `
      Add-Type -AssemblyName System.windows.forms
      $f = New-Object System.Windows.Forms.FolderBrowserDialog
      $f.Description = "Select Download Folder"
      $f.ShowNewFolderButton = $true
      if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $f.SelectedPath
      }
    `;
    // Add -Sta flag for COM apartment state requirement for UI dialogs
    const { stdout, stderr } = await execPromise(`powershell -Sta -NoProfile -Command "${script.replace(/\n/g, ';')}"`);
    console.log("OUT:", stdout);
    console.log("ERR:", stderr);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}
test();
