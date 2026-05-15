# Dot-source from repo root: . ./tools/keycloakify-env.ps1
# Sets JAVA_HOME, MAVEN_HOME, and PATH for portable tools/jdk21 + tools/apache-maven-3.9.6
$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = Join-Path $toolsDir "jdk21"
$env:MAVEN_HOME = Join-Path $toolsDir "apache-maven-3.9.6"
$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$(Join-Path $env:MAVEN_HOME 'bin');$env:Path"
