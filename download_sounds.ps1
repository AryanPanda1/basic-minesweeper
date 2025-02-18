$sounds = @{
    "click" = "https://raw.githubusercontent.com/codeium/minesweeper-assets/main/click.mp3"
    "flag" = "https://raw.githubusercontent.com/codeium/minesweeper-assets/main/flag.mp3"
    "unflag" = "https://raw.githubusercontent.com/codeium/minesweeper-assets/main/unflag.mp3"
    "explosion" = "https://raw.githubusercontent.com/codeium/minesweeper-assets/main/explosion.mp3"
    "win" = "https://raw.githubusercontent.com/codeium/minesweeper-assets/main/win.mp3"
}

foreach ($sound in $sounds.GetEnumerator()) {
    $outputFile = "audio/$($sound.Key).mp3"
    Write-Host "Downloading $($sound.Key) sound..."
    Invoke-WebRequest -Uri $sound.Value -OutFile $outputFile
}
