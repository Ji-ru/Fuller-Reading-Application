@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      http://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%"=="" @echo off
@rem The below code block is to fix a limitation in PowerShell+, 
@rem it is not needed for regular cmd.exe
@goto start

:start
:findJava

SetLocal EnableDelayedExpansion

for /f "delims=" %%a in ('"!__reducepath!"') do set "__path=%%a"
SetLocal DisableDelayedExpansion

set "JAVACMD="
if defined JAVA_HOME goto refineJavaHome

set "JAVACMD=java"
goto run

:refineJavaHome
if not exist "%JAVA_HOME%\bin\javaw.exe" goto refineJavaHome_SDK
if not exist "%JAVA_HOME%\bin\java.exe" goto refineJavaHome_SDK
if not exist "%JAVA_HOME%\jre\bin\javaw.exe" goto refineJavaHome_JRE
if not exist "%JAVA_HOME%\jre\bin\java.exe" goto refineJavaHome_JRE

goto refineJavaHome_FOUND

:refineJavaHome_SDK
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "JAVACMD=java"
goto run

:refineJavaHome_JRE
set "PATH=%JAVA_HOME%\jre\bin;%PATH%"
set "JAVACMD=java"
goto run

:refineJavaHome_FOUND
set "PATH=%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;%PATH%"
set "JAVACMD=%JAVA_HOME%\bin\javaw.exe"
goto run

:findJavaEnd

ENDLOCAL

:run

@rem Resolve any symlinks
set "APP_HOME=%~dp0"
set "APP_BASE_NAME=%~n0"
set "RESOLVED_APP_HOME=%APP_HOME%"

If not exist "%APP_HOME%gradle\wrapper\gradle-wrapper.jar" goto mainTerm

SetLocal EnableDelayedExpansion

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set "DEFAULT_JVM_OPTS=-Xmx64m -Xms64m"

@rem Get the command-line options
set "args=%*"

for /f "tokens=1,2,* delims= " %%a in ("!args!") do (
    set "_jopt=%%a"
    set "_jarg=%%b"
    call :GetArgs
)

set "_jarg="

if defined JAVA_HOME (
    set "JAVACMD=!JAVA_HOME!\bin\javaw.exe"
) else (
    set "JAVACMD=java"
)

set "CLASSPATH=%APP_HOME%gradle\wrapper\gradle-wrapper.jar"

@rem Set project directory to the Gradle project root (same as android)
set "args=%args% --project-dir %APP_HOME%"

@rem Execute Gradle
"%JAVACMD%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "!CLASSPATH!" org.gradle.wrapper.GradleWrapperMain %args%

:runEnd

@rem Exit code is already set by the Java process.
@rem Do not attempt to set it again.
endlocal
exit /b %ERRORLEVEL%

:GetArgs
endlocal

if "!_jopt!"=="-g"   set "_jopt=--debug"
if "!_jopt!"=="--g"  set "_jopt=--debug"

if "!_jopt!"=="--j" (
    if "!_jarg!"=="" goto mainTerm
    set "__path=!_jarg!"
    if not exist "!__path!" (
        echo.  Gradle user home: !__path! does not exist >&2
        goto mainTerm
    )
    set "GRADLE_USER_HOME=!__path!"
    set "CLASSPATH=!__path!\wrapper\dists\!CLASSPATH!"
    goto shiftArgs
)

if "!_jopt!"=="--s" (
    if "!_jarg!"=="" goto mainTerm
    set "STOP_AT=!_jarg!"
    goto shiftArgs
)

if "!_jopt!"=="--no-daemon"   goto shiftArgs
if "!_jopt!"=="--offline"     goto shiftArgs
if "!_jopt!"=="--no-search-upwards" goto shiftArgs
if "!_jopt!"=="--gradle-user-home"   goto shiftArgs
if "!_jopt!"=="--project-dir"         goto shiftArgs

:shiftArgs
if "!_jopt!"==""        goto shiftArgsEnd
if "!_jarg!"=="--stacktrace"  goto shiftArgsEnd
if "!_jarg!"=="--info"        goto shiftArgsEnd
if "!_jarg!"=="--debug"       goto shiftArgsEnd
if "!_jarg!"=="--warn"        goto shiftArgsEnd
if "!_jarg!"=="--rerun"       goto shiftArgsEnd
if "!_jopt!"=="--stacktrace"  goto appendArgs
if "!_jopt!"=="--info"        goto appendArgs
if "!_jopt!"=="--debug"       goto appendArgs
if "!_jopt!"=="--warn"        goto appendArgs
if "!_jopt!"=="--rerun"       goto appendArgs
set "_jarg="
goto appendArgs

:appendArgs
set "args=!args! !_jopt! !_jarg!"

if "!_jarg!"=="" goto shiftArgsEnd
if "!_jopt!"=="--gradle-user-home"      goto getNextArg
if "!_jopt!"=="--project-dir"            goto getNextArg
if "!_jopt!"=="-D"                      => getNextArg
if "!_jopt!"=="-P"                      => getNextArg
if "!_jopt!"=="-I"                      => getNextArg
goto shiftArgsEnd

:getNextArg
shift /0
set "args=!args! !arg1!"
goto shiftArgsEnd

:shiftArgsEnd
shift /1
set "_jopt=%1"
set "_jarg=%2"
if "!_jopt!"=="" goto shift
if not "%~2"=="" goto GetArgs
goto shiftArgsEnd

:shift
if "%~1"==""          goto shiftArgsEnd
if "%~1"=="-g"       => GetArgs2
if "%~1"=="--g"      => GetArgs2
set "args=!args! %1"
shift
goto shift

:GetArgs2
set "args=!args! --debug"
shift
goto shift

:shiftArgsEnd
endlocal

:mainTerm
endlocal

@rem if not "%GIT_TERMINAL_PROMPT%"=="0" (SETLOCAL ENABLEDELAYEDEXPANSION & FOR /F "delims=" %%I IN ("!GIT_DIR!") DO (ENDLOCAL & SETLOCAL ENABLEDELAYEDEXPANSION & SET "GIT_DIR=%%I")) 