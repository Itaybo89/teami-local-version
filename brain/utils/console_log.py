# FILE: utils/console_log.py
# Purpose: Provides a centralized and conditional console logging utility
#          with standardized, level-based formatting.

from debug_flags import debug_console_log as default_debug

def log_console(msg: str, level: str = "info", debug_flag: bool | None = None) -> None:
    """
    Prints a formatted message to the console, conditionally based on debug settings.

    This utility standardizes console output by prepending messages with
    level-based prefixes (e.g., '🧠 [LOG]', '❌ [ERROR]').

    Logging behavior:
    1.  **Master Switch (`default_debug`):** No messages are printed if `default_debug` is `False`,
        unless the message level is 'error'.
    2.  **Specific Flag (`debug_flag`):** If provided, `debug_flag` overrides `default_debug`
        for that specific message. If `None`, `default_debug` is used.
    3.  **Error Override:** Messages with `level="error"` are always printed to the console,
        regardless of debug settings, to ensure critical issues are visible.

    Args:
        msg (str): The message content to be printed.
        level (str, optional): The log level ('info', 'error', 'warn', 'debug'). Defaults to "info".
        debug_flag (bool | None, optional): Overrides module's default debug setting for this message.
    """
    # Determine the effective debug status for this log message.
    debug_is_active = debug_flag if debug_flag is not None else default_debug

    # Rule 1: Do not print if master console debug switch is off AND it's not an error.
    if not default_debug and level != "error":
        return

    # Rule 2: Do not print if `debug_is_active` is False AND it's not an error.
    if not debug_is_active and level != "error":
        return

    # Select appropriate prefix based on log level.
    prefix = "🧠 [LOG]"
    if level == "error":
        prefix = "❌ [ERROR]"
    elif level == "warn":
        prefix = "⚠️ [WARN]"
    elif level == "debug":
        prefix = "🐞 [DEBUG]"
    
    print(f"{prefix}: {msg}")