# MT5 Algo Trading Platform - Full Compiled Error Logs

This file compiles all critical error logs, console exception traces, and permission warnings that occurred during the platform debugging process.

---

## Log 1: GET /api/v1/mt5/status API Timeout (10,000ms)
* **Context**: Triggered by Next.js dev server during polling from `src/app/dashboard/page.tsx`.
* **Raw Exception Trace**:
  ```
  Error: [API Timeout] GET http://127.0.0.1:8000/api/v1/mt5/status timed out after 10000ms
      at createUnhandledError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/console-error.js:27:49)
      at handleClientError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/use-error-handler.js:44:56)
      at console.error (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/globals/intercept-console-error.js:48:56)
      at request (webpack-internal:///(app-pages-browser)/./src/services/api.ts:82:25)
      at async DashboardContent.useCallback[fetchDashboardData] (webpack-internal:///(app-pages-browser)/./src/app/dashboard/page.tsx:201:35)
  ```

---

## Log 2: Settings PUT Request Event Loop Crash
* **Context**: Triggered by uvicorn backend when writing to `/settings/{account_id}`.
* **Raw Exception Trace**:
  ```
  Error: [API Error Response] 500: {"success":false,"message":"Failed to save settings: no running event loop","data":[]}
      at createUnhandledError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/console-error.js:27:49)
      at handleClientError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/use-error-handler.js:44:56)
      at console.error (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/globals/intercept-console-error.js:48:56)
      at request (webpack-internal:///(app-pages-browser)/./src/services/api.ts:63:25)
      at async handleSaveSettings (webpack-internal:///(app-pages-browser)/./src/app/settings/page.tsx:143:13)
  ```
* **Raw Connection Failure trace**:
  ```
  Error: [API Connection Failure] PUT http://127.0.0.1:8000/api/v1/settings/1: {"success":false,"message":"Failed to save settings: no running event loop","data":[]}
  ```

---

## Log 3: Sandbox Login Authentication Failures
* **Context**: Triggered by the frontend when submitting invalid/unhashed login requests.
* **Raw Exception Trace**:
  ```
  Error: Incorrect username or password
      at request (webpack-internal:///(app-pages-browser)/./src/services/api.ts:64:23)
      at async handleSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:55:26)
  ```

---

## Log 4: Host Process Termination Denial Logs (kill_log_2.txt)
* **Context**: Triggered when the restricted container/sandbox Windows user (`ag-sandbox-...`) executed system-level `taskkill` calls targeting processes owned by the host desktop user (`PuthawalaNuareMoazza`).
* **Stdout/Stderr logs**:
  ```
  Access is denied.
  Access is denied.
  Access is denied.
  ```

---

## Log 5: Sandbox Shell Node & Python Path Environment Resolution Warnings
* **Context**: Error output returned by sandbox shell runner tasks trying to locate execution binaries or search folder trees.
* **Command Not Found logs**:
  ```
  C:\node-v24.16.0-win-x64\node.exe : The term 'C:\node-v24.16.0-win-x64\node.exe' is not recognized as the name of a 
  cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify 
  that the path is correct and try again.
  ```
* **PowerShell Autoload Module Warnings**:
  ```
  .venv\Scripts\python : The module '.venv' could not be loaded. For more information, run 'Import-Module .venv'.
  At line:1 char:1
  + .venv\Scripts\python --version
  + ~~~~~~~~~~~~~~~~~~~~
      + CategoryInfo          : ObjectNotFound: (.venv\Scripts\python:String) [], CommandNotFoundException
      + FullyQualifiedErrorId : CouldNotAutoLoadModule
  ```
* **Git Dev Null Permission Warnings**:
  ```
  fatal: could not open '/dev/null' for reading and writing: Permission denied
  ```
