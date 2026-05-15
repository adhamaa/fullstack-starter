# Source from repo root: source tools/keycloakify-env.sh
# Sets JAVA_HOME, MAVEN_HOME, and PATH for portable tools/jdk21 + tools/apache-maven-3.9.6
_tools_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]:-$0}")" && pwd)"
export JAVA_HOME="$_tools_dir/jdk21"
export MAVEN_HOME="$_tools_dir/apache-maven-3.9.6"
export PATH="$JAVA_HOME/bin:$MAVEN_HOME/bin:$PATH"
unset _tools_dir
