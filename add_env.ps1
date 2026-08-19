$envPath = "D:\SaaS\Omni1OS\.env.local"
$envVars = @{}

Get-Content $envPath | Foreach-Object {
    if ($_ -match '^(NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY)=(.*)$') {
        $envVars[$Matches[1]] = $Matches[2]
    }
}

foreach ($key in $envVars.Keys) {
    $val = $envVars[$key]
    Write-Host "Adding $key"
    vercel env add $key production --value $val --yes
    vercel env add $key preview --value $val --yes
    vercel env add $key development --value $val --yes
}
