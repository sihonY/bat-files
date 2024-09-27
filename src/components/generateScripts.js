// generateScripts.js
/**
 * 根据文件过滤器和脚本类型生成相应的文件过滤脚本片段
 * @param {Object} fileFilter - 文件过滤器对象
 * @param {string} scriptType - 脚本类型（batch, powershell, shell）
 * @returns {string} - 生成的文件过滤脚本片段
 */
function setFileFilter(fileFilter, scriptType, targetType = '') {
  let script = '';
  if (scriptType === 'batch') {
    let filePattern = '*';
    if (fileFilter.filterType === 'name' && fileFilter.filterValue) {
      switch (fileFilter.matchType) {
        case 'include':
          filePattern = `*${fileFilter.filterValue}*`;
          script += `set "filePattern=${filePattern}"\n`;
          break;
        case 'exclude':
          script += `set "filePattern=*"\n`;
          script += `set "excludePattern=${fileFilter.filterValue}"\n`;
          break;
        case 'match':
          filePattern = fileFilter.filterValue;
          script += `set "filePattern=${filePattern}"\n`;
          break;
      }
    } else {
      script += `set "filePattern=${filePattern}"\n`;
    }
  } else if (scriptType === 'powershell') {
    let filter = '*';
    if (fileFilter.filterType === 'name' && fileFilter.filterValue) {
      switch (fileFilter.matchType) {
        case 'include':
          filter = `*${fileFilter.filterValue}*`;
          break;
        case 'exclude':
          script += `$excludePattern = "${fileFilter.filterValue}"\n`;
          break;
        case 'match':
          filter = fileFilter.filterValue;
          break;
      }
    }
    script += `Get-ChildItem -Path . ${targetType} -Filter "${filter}" | ForEach-Object {\n`;
  } else if (scriptType === 'shell') {
    if (fileFilter.filterType === 'name' && fileFilter.filterValue) {
      switch (fileFilter.matchType) {
        case 'include':
          script += `filePattern="*${fileFilter.filterValue}*"\n`;
          break;
        case 'exclude':
          script += `filePattern="*"\n`;
          script += `excludePattern="${fileFilter.filterValue}"\n`;
          break;
        case 'match':
          script += `filePattern="${fileFilter.filterValue}"\n`;
          break;
      }
    } else {
      script += `filePattern="*"\n`;
    }
    script += `findCommand="find . ${targetType} -name \\"$filePattern\\""\n`;
  }
  return script;
}

/**
 * 生成文件重命名的脚本逻辑
 * @param {Object} fileFilter - 文件过滤器对象
 * @param {Object} renameRules - 重命名规则对象
 * @param {string} recurse - 是否递归处理子目录
 * @param {string} scriptType - 脚本类型（batch, powershell, shell）
 * @returns {string} - 生成的文件重命名脚本片段
 */
function generateFileRenameLogic(fileFilter, renameRules, recurse, scriptType) {
  let script = '';
  if (scriptType === 'batch') {
    if (renameRules.activeRenameTab === 'advanced') {
      script += 'set /A "num=1"\n';
    }
    if (fileFilter.matchType !== 'exclude') {
      script += `for ${recurse} %%F in ("!filePattern!") do (\n`;
    } else {
      script += `for ${recurse} %%F in (*) do (\n`;
      script += `  echo %%~nxF | findstr /V /I "!excludePattern!" >nul && (\n`;
    }
    script += '  set "filename=%%~nF"\n';
    script += '  set "extension=%%~xF"\n';

    if (renameRules.activeRenameTab === 'advanced') {
      script += `  set "newname=${renameRules.advancedPattern}"\n`;
      script += '  set "newname=!newname:{{name}}=%%~nF!"\n';
      script += '  call :replaceNum newname !num!\n';
      script += '  set /A "num+=1"\n';
    } else {
      if (renameRules.matchType === 'once') {
        script += `  set "newname=!filename:${renameRules.replaceFrom}=${renameRules.replaceTo}!"\n`;
      } else {
        script += '  set "newname=!filename!"\n';
        script += `  set "newname=!newname:${renameRules.replaceFrom}=${renameRules.replaceTo}!"\n`;
      }
    }

    script += '  if not "!newname!"=="!filename!" (\n';
    script += '    if not exist "!newname!!extension!" (\n';
    script += '      ren "%%F" "!newname!!extension!"\n';
    script += '      echo Renamed: %%F to !newname!!extension!\n';
    script += '    ) else (\n';
    script += '      echo Skipped: %%F - New name already exists\n';
    script += '    )\n';
    script += '  )\n';

    if (fileFilter.matchType === 'exclude') {
      script += '  )\n';
    }
    script += ')\n\n';

    if (renameRules.activeRenameTab === 'advanced') {
      script += ':replaceNum\n';
      script += 'setlocal EnableDelayedExpansion\n';
      script += 'set "string=!%1!"\n';
      script += 'set "string=!string:{{num}}=%2!"\n';
      script += 'endlocal & set "%1=%string%"\n';
      script += 'goto :eof\n\n';
    }
  } else if (scriptType === 'powershell') {
    if (renameRules.activeRenameTab === 'advanced') {
      script += `  $num = 1\n`;
      script += `  $newName = '${renameRules.advancedPattern}' -replace '{{name}}', $_.BaseName -replace '{{num}}', $num\n`;
      script += `  $num++\n`;
    } else if (renameRules.activeRenameTab === 'regex') {
      let newName = renameRules.newName.replace(/(?<!\{\{)\$(\d+)(?!\}\})/g, '`$$$1');
      newName = newName.replace(/\{\{\$(\d+)\}\}/g, '$$$1');
      script += `  $newName = $_.Name -replace '${renameRules.regex}', '${newName}'\n`;
    } else {
      if (renameRules.matchType === 'once') {
        script += `  $newName = $_.Name -replace '${renameRules.replaceFrom}', '${renameRules.replaceTo}'\n`;
      } else {
        script += `  $newName = $_.Name -replace '${renameRules.replaceFrom}', '${renameRules.replaceTo}' -replace '${renameRules.replaceFrom}', '${renameRules.replaceTo}'\n`;
      }
    }
    script += `  if ($_.Name -ne $newName) {\n`;
    script += `    $newPath = Join-Path $_.Directory.FullName $newName\n`;
    script += `    if (-not (Test-Path $newPath)) {\n`;
    script += `      Rename-Item -Path $_.FullName -NewName $newName\n`;
    script += `      Write-Host "Renamed: $($_.FullName) to $newPath"\n`;
    script += `    } else {\n`;
    script += `      Write-Host "Skipped: $($_.FullName) - New name already exists"\n`;
    script += `    }\n`;
    script += `  }\n`;
    script += `}\n`;
  } else if (scriptType === 'shell') {
    script += `while IFS= read -r -d '' file; do\n`;
    script += `  filename=$(basename "$file")\n`;
    script += `  dir=$(dirname "$file")\n`;
    if (renameRules.activeRenameTab === 'advanced') {
      script += `  num=1\n`;
      script += `  newname=$(echo "${renameRules.advancedPattern}" | sed "s/{{name}}/$filename/g" | sed "s/{{num}}/$num/g")\n`;
      script += `  num=$((num + 1))\n`;
    } else if (renameRules.activeRenameTab === 'regex') {
      let newName = renameRules.newName.replace(/(?<!\{\{)\$(\d+)(?!\}\})/g, '\\$\\$\\$1');
      newName = newName.replace(/\{\{\$(\d+)\}\}/g, '\\$\\$\\$1');
      script += `  newname=$(echo "$filename" | sed -E 's/${renameRules.regex}/${newName}/')\n`;
    } else {
      if (renameRules.matchType === 'once') {
        script += `  newname=$(echo "$filename" | sed "s/${renameRules.replaceFrom}/${renameRules.replaceTo}/")\n`;
      } else {
        script += `  newname=$(echo "$filename" | sed "s/${renameRules.replaceFrom}/${renameRules.replaceTo}/g")\n`;
      }
    }
    script += `  if [ "$filename" != "$newname" ]; then\n`;
    script += `    if [ ! -e "$dir/$newname" ]; then\n`;
    script += `      mv "$file" "$dir/$newname"\n`;
    script += `      echo "Renamed: $file to $dir/$newname"\n`;
    script += `    else\n`;
    script += `      echo "Skipped: $file - New name already exists"\n`;
    script += `    fi\n`;
    script += `  fi\n`;
    script += `done < <($findCommand -print0)\n`;
  }
  return script;
}

/**
 * 生成目录重命名的脚本逻辑
 * @param {Object} fileFilter - 文件过滤器对象
 * @param {Object} renameRules - 重命名规则对象
 * @param {string} recurse - 是否递归处理子目录
 * @param {string} scriptType - 脚本类型（batch, powershell, shell）
 * @returns {string} - 生成的目录重命名脚本片段
 */
function generateDirectoryRenameLogic(fileFilter, renameRules, recurse, scriptType) {
  let script = '';
  if (scriptType === 'batch') {
    if (renameRules.activeRenameTab === 'advanced') {
      script += 'set /A "num=1"\n';
    }
    if (fileFilter.matchType !== 'exclude') {
      script += `for /d ${recurse} %%D in ("!filePattern!") do (\n`;
    } else {
      script += `for /d ${recurse} %%D in (*) do (\n`;
      script += `  echo %%~nxD | findstr /V /I "!excludePattern!" >nul && (\n`;
    }
    script += '  set "dirname=%%~nxD"\n';

    if (renameRules.activeRenameTab === 'advanced') {
      script += `  set "newname=${renameRules.advancedPattern}"\n`;
      script += '  set "newname=!newname:{{name}}=%%~nxD!"\n';
      script += '  call :replaceNum newname !num!\n';
      script += '  set /A "num+=1"\n';
    } else {
      if (renameRules.matchType === 'once') {
        script += `  set "newname=!dirname:${renameRules.replaceFrom}=${renameRules.replaceTo}!"\n`;
      } else {
        script += '  set "newname=!dirname!"\n';
        script += `  set "newname=!newname:${renameRules.replaceFrom}=${renameRules.replaceTo}!"\n`;
      }
    }

    script += '  if not "!newname!"=="!dirname!" (\n';
    script += '    if not exist "!newname!" (\n';
    script += '      ren "%%D" "!newname!"\n';
    script += '      echo Renamed: %%D to !newname!\n';
    script += '    ) else (\n';
    script += '      echo Skipped: %%D - New name already exists\n';
    script += '    )\n';
    script += '  )\n';

    if (fileFilter.matchType === 'exclude') {
      script += '  )\n';
    }
    script += ')\n\n';
  } else if (scriptType === 'powershell') {
    if (renameRules.activeRenameTab === 'advanced') {
      script += `  $num = 1\n`;
      script += `  $newName = '${renameRules.advancedPattern}' -replace '{{name}}', $_.Name -replace '{{num}}', $num\n`;
      script += `  $num++\n`;
    } else {
      script += `  $newName = $_.Name -replace '${renameRules.regexPattern}', '${renameRules.regexReplacement}'\n`;
    }
    script += `  Rename-Item $_.FullName $newName\n`;
    script += `}\n`;
  } else if (scriptType === 'shell') {
    script += `while IFS= read -r -d '' dir; do\n`;
    script += `  dirname=$(basename "$dir")\n`;
    script += `  parentdir=$(dirname "$dir")\n`;
    if (renameRules.activeRenameTab === 'advanced') {
      script += `  num=1\n`;
      script += `  newname=$(echo "${renameRules.advancedPattern}" | sed "s/{{name}}/$dirname/g" | sed "s/{{num}}/$num/g")\n`;
      script += `  num=$((num + 1))\n`;
    } else {
      if (renameRules.matchType === 'once') {
        script += `  newname=$(echo "$dirname" | sed "s/${renameRules.replaceFrom}/${renameRules.replaceTo}/")\n`;
      } else {
        script += `  newname=$(echo "$dirname" | sed "s/${renameRules.replaceFrom}/${renameRules.replaceTo}/g")\n`;
      }
    }
    script += `  if [ "$dirname" != "$newname" ]; then\n`;
    script += `    if [ ! -e "$parentdir/$newname" ]; then\n`;
    script += `      mv "$dir" "$parentdir/$newname"\n`;
    script += `      echo "Renamed: $dir to $parentdir/$newname"\n`;
    script += `    else\n`;
    script += `      echo "Skipped: $dir - New name already exists"\n`;
    script += `    fi\n`;
    script += `  fi\n`;
    script += `done < <($findCommand -print0)\n`;
  }
  return script;
}

export function generateBatch(params) {
  const { directoryScope, fileFilter, renameRules } = params;
  let script = '@echo off\n';
  script += 'setlocal enabledelayedexpansion\n\n';

  script += setDirectory(directoryScope, 'batch');
  script += setFileFilter(fileFilter, 'batch');
  script += setRenameLogic(directoryScope, fileFilter, renameRules, 'batch');

  script += 'echo Rename operation completed.\n';
  script += 'pause\n';

  return script;
}

export function generatePowerShell(params) {
  const { directoryScope, fileFilter, renameRules } = params;
  let script = '';

  script += setDirectory(directoryScope, 'powershell');
  script += setFileFilter(fileFilter, 'powershell', directoryScope.renameTarget === 'file' ? '-File' : '-Directory');
  script += setRenameLogic(directoryScope, fileFilter, renameRules, 'powershell');

  script += 'Write-Host "Rename operation completed."\n';
  script += 'Read-Host "Press Enter to exit"\n';

  return script;
}

export function generateShell(params) {
  const { directoryScope, fileFilter, renameRules } = params;
  let script = '#!/bin/bash\n\n';

  script += setDirectory(directoryScope, 'shell');
  script += setFileFilter(fileFilter, 'shell', directoryScope.renameTarget === 'file' ? '-type f' : '-type d');
  script += setRenameLogic(directoryScope, fileFilter, renameRules, 'shell');

  script += 'echo "Rename operation completed."\n';
  script += 'read -p "Press Enter to exit"\n';

  return script;
}

//fixed
function setDirectory(directoryScope, scriptType) {
  let script = '';
  if (scriptType === 'batch') {
    if (directoryScope.scope === 'current') {
      script += 'set "folder=%cd%"\n';
    } else if (directoryScope.scope === 'custom' && directoryScope.customPath) {
      script += `set "folder=${directoryScope.customPath}"\n`;
    } else {
      script += 'echo Error: Invalid directory scope\n';
      script += 'exit /b 1\n';
    }
    script += 'cd /d "%folder%"\n\n';
  } else if (scriptType === 'powershell' || scriptType === 'shell') {
    script += `cd "${directoryScope.customPath}"\n\n`;
  }
  return script;
}

function setRenameLogic(directoryScope, fileFilter, renameRules, scriptType) {
  let script = '';
  let recurse = directoryScope.includeSubdirectories ? (scriptType === 'batch' ? '/r' : '-Recurse') : '';

  if (directoryScope.renameTarget === 'file') {
    script += generateFileRenameLogic(fileFilter, renameRules, recurse, scriptType);
  } else if (directoryScope.renameTarget === 'directory') {
    script += generateDirectoryRenameLogic(fileFilter, renameRules, recurse, scriptType);
  }

  return script;
}