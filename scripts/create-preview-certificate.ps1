param(
  [Parameter(Mandatory = $true)][string]$Path,
  [Parameter(Mandatory = $true)][string]$Password
)

$ErrorActionPreference = 'Stop'
$destination = [System.IO.Path]::GetFullPath($Path)
$directory = Split-Path -Parent $destination
New-Item -ItemType Directory -Force -Path $directory | Out-Null

$certificate = New-SelfSignedCertificate `
  -Subject 'CN=Liebesbriefe-Handyvorschau' `
  -CertStoreLocation 'Cert:\CurrentUser\My' `
  -KeyAlgorithm RSA `
  -KeyLength 2048 `
  -KeyExportPolicy Exportable `
  -NotAfter (Get-Date).AddDays(14)

try {
  $securePassword = ConvertTo-SecureString -String $Password -AsPlainText -Force
  Export-PfxCertificate -Cert $certificate -FilePath $destination -Password $securePassword | Out-Null
} finally {
  Remove-Item -LiteralPath "Cert:\CurrentUser\My\$($certificate.Thumbprint)" -Force -ErrorAction SilentlyContinue
}
