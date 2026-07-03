import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    const script = `
      Add-Type -AssemblyName System.windows.forms
      $f = New-Object System.Windows.Forms.FolderBrowserDialog
      $f.Description = "Select Download Folder"
      $f.ShowNewFolderButton = $true
      
      $form = New-Object System.Windows.Forms.Form
      $form.TopMost = $true
      $form.WindowState = [System.Windows.Forms.FormWindowState]::Minimized
      
      if ($f.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
        $f.SelectedPath
      }
      $form.Dispose()
    `;
    const { stdout } = await execPromise(`powershell -Sta -NoProfile -Command "${script.replace(/\n/g, ';')}"`);
    const folderPath = stdout.trim();
    return NextResponse.json({ folderPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
