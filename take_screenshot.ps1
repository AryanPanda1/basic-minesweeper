Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Start-Sleep -Seconds 2  # Wait for the game to be visible

$bounds = [System.Drawing.Rectangle]::FromLTRB(0, 0, 800, 600)
$screenshot = New-Object System.Drawing.Bitmap $bounds.width, $bounds.height
$graphics = [System.Drawing.Graphics]::FromImage($screenshot)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.size)

$screenshot.Save("screenshot.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$screenshot.Dispose()
